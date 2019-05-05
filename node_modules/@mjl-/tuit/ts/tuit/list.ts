import * as dom from '../dom'
import * as types from './types'
import * as looks from './looks'
import * as split from './split'
import * as fns from './fns'
import * as load from './load'

export const rowMarkSelected = (looks: looks.Looks, ui: HTMLElement, primary: HTMLElement, secondary: HTMLElement) => {
	ui.className = looks.listItemSelected.className
	primary.className = looks.listItemSelectedPrimary.className
	secondary.className = looks.listItemSelectedSecondary.className
}

export const rowMarkUnselected = (looks: looks.Looks, ui: HTMLElement, primary: HTMLElement, secondary: HTMLElement) => {
	ui.className = looks.listItem.className
	primary.className = looks.listItemPrimary.className
	secondary.className = looks.listItemSecondary.className
}


export interface ItemOpener<ItemView> {
	openItem: (key: string) => Promise<ItemView>
}

export interface ItemRower<Item> extends dom.Rooter {
	key: string	// unique value identifying item
	item: Item
	render: () => void
	markSelected: () => void
	markUnselected: () => void
	matches: (text: string) => boolean
	compare: (o: ItemRower<Item>) => number
}

export interface Selecter<Item, ItemRow extends ItemRower<Item>> {
	selectClick: (itemRow: ItemRow) => void
}

const styles = {
	listBox: { borderTop: '.25em solid #fff' },
	list: {
		borderBottom: '.25em solid #ddd',
		maxWidth: '13em',
	},
}

export class List<
	Item,
	ItemRow extends dom.Rooter & ItemRower<Item>,
	ItemNew extends types.UI & types.Stater,
	ItemView extends types.UI & types.Stater,
	> implements types.UI, types.Stater {
	root: HTMLElement
	selected?: ItemRow
	rowsAll: ItemRow[]
	rowsFiltered: ItemRow[]
	listBox: HTMLElement
	search: HTMLInputElement
	list: HTMLElement
	detailBox: HTMLElement
	noSelection: HTMLElement
	viewUI?: ItemView
	newUI?: ItemNew

	constructor(
		private app: dom.Rooter & types.Saver & types.Loader & types.Looker & types.StateSaver,
		private title: string,
		items: Item[],
		private rowClass: { new(app: types.Looker, item: Item, listUI: Selecter<Item, ItemRow>): ItemRow },
		private newClass: () => ItemNew,
		private viewClass: (itemRow: ItemRow) => ItemView,
	) {
		const looksListBox = app.ensureLooks('list-box', styles.listBox)

		this.search = dom.input(
			app.looks.searchInput,
			{ placeholder: 'search...' },
			dom.listen('keyup', ev => {
				const v = this.searchValue()
				this.filter()
				if (v) {
					if (this.rowsFiltered.length > 0) {
						this.search.className = app.looks.searchInputFiltered.className
					} else {
						this.search.className = app.looks.searchInputNoresults.className
					}
				} else {
					this.search.className = app.looks.searchInput.className
				}
			})
		)

		this.rowsAll = items.map(e => {
			return new rowClass(app, e, this)
		})
		this.rowsFiltered = this.rowsAll.map(e => e)
		this.rowsFiltered.sort((a: ItemRow, b: ItemRow) => a.compare(b))
		this.listBox = fns.box(
			app,
			dom.div(
				looksListBox,
				{ tabindex: '0' },
				dom.listen('keydown', ev => {
					if (this.rowsFiltered.length === 0) {
						return
					}

					const selectOffset = (offset: number) => {
						ev.preventDefault()
						const index = Math.min(this.rowsFiltered.length - 1, Math.max(0, this.rowsFiltered.findIndex(ir => ir === this.selected) + offset))
						if (index >= 0 && index < this.rowsFiltered.length) {
							this.select(this.rowsFiltered[index])
						}
					}

					switch (ev.key) {
						case 'ArrowUp':
							if (this.selected) {
								selectOffset(-1)
							} else {
								this.select(this.rowsFiltered[this.rowsFiltered.length - 1])
							}
							break
						case 'ArrowDown':
							if (this.selected) {
								selectOffset(1)
							} else {
								this.select(this.rowsFiltered[0])
							}
							break
						case 'Enter':
							const e = this.rowsFiltered.find(ur => ur.root === document.activeElement)
							if (e) {
								this.selectClick(e)
							}
							break
						default:
							return
					}
					ev.preventDefault()
				}),
				...this.rowsFiltered,
			)
		)
		this.list = fns.box(
			app,
			dom._style(styles.list),
			dom.div(
				app.looks.boxPadding,
				dom.div(
					dom.h1(
						app.looks.inlineTitle,
						title,
					),
					' ',
					dom.button(
						app.looks.btnSuccess,
						dom.listen('click', ev => {
							this.deselect(false)
							this.loadNew([])
							app.saveState()
						}),
						'new'
					),
				),
				this.search,
			),
			this.listBox,
		)
		this.noSelection = fns.middle(app, dom.div('Choose from the list'))
		this.detailBox = fns.box(app)
		const splitUI = new split.Split(app, this.list, this.detailBox)
		this.root = fns.box(
			app,
			{ ui: 'ItemList' },
			splitUI,
		)
	}

	async loadNew(state: types.State): Promise<void> {
		const newUI = this.newClass()
		this.newUI = newUI
		await newUI.loadState(state)
		load.reveal(this.detailBox, newUI.root)
		newUI.focus()
	}

	async loadState(state: types.State): Promise<void> {
		let w = state.shift()
		if (w === 'New') {
			return this.loadNew(state)
		} else if (typeof w === 'string' && w.startsWith('-')) {
			w = w.substring(1)
			const row = this.rowsFiltered.find(row => row.key === w)
			if (row) {
				return this.loadItem(state, row)
			}
		}
		dom.children(this.detailBox, this.noSelection)
		return Promise.resolve()
	}

	currentState(): types.State {
		if (this.newUI) {
			return ['New', ...this.newUI.currentState()]
		} else if (this.selected && this.viewUI) {
			return ['-' + this.selected.key, ...this.viewUI.currentState()]
		} else {
			return []
		}
	}

	focus() {
		if (this.newUI) {
			this.newUI.focus()
		} else if (this.viewUI) {
			this.viewUI.focus()
		} else {
			this.search.focus()
		}
	}

	searchValue() {
		return this.search.value.toLowerCase().trim()
	}

	openItem(itemKey: string): Promise<ItemView> {
		const ir = this.rowsAll.find(ir => ir.key === itemKey)
		if (!ir) {
			return Promise.reject({ message: 'cannot find key "' + itemKey + '" in ' + this.title.toLowerCase() })
		}
		if (!this.rowsFiltered.find(row => row === ir)) {
			this.rowsFiltered.push(ir)
		}
		this.loadItem([], ir)
		this.filter() // for sorting
		const viewUI = this.viewUI
		return new Promise(resolve => {
			resolve(viewUI)
		})
	}

	selectClick(ir: ItemRow) {
		if (this.selected === ir) {
			this.deselect(true)
		} else {
			this.select(ir)
		}
	}

	async loadItem(state: types.State, ir: ItemRow): Promise<void> {
		if (ir !== this.selected) {
			this.newUI = undefined
			if (this.selected) {
				this.selected.markUnselected()
			}
			this.selected = ir
			this.selected.markSelected()
			this.viewUI = this.viewClass(ir)
			load.reveal(this.detailBox, this.viewUI!.root)
		}
		await this.viewUI!.loadState(state)
	}

	select(ir: ItemRow) {
		this.loadItem([], ir)
		this.app.saveState()
	}

	async deselect(loadDetail: boolean): Promise<void> {
		if (this.selected) {
			this.selected.markUnselected()
		}
		this.selected = undefined
		this.viewUI = undefined
		if (loadDetail) {
			load.reveal(this.detailBox, this.noSelection)
			this.search.focus()
		}
		this.app.saveState()
	}

	filter() {
		const filter = (ir: ItemRow, text: string) => {
			return ir.matches(text)
		}
		const v = this.searchValue()
		this.rowsFiltered = this.rowsAll.filter(ir => filter(ir, v) || ir == this.selected)
		this.rowsFiltered.sort((a: ItemRow, b: ItemRow) => a.compare(b))
		dom.children(this.listBox, ...this.rowsFiltered)
	}

	addItem(item: Item) {
		const ir = new this.rowClass(this.app, item, this)
		this.rowsAll.push(ir)
		this.rowsFiltered.push(ir)
		this.select(ir)
		this.filter()
	}

	removeItem(ir: ItemRow) {
		this.deselect(true)
		this.rowsAll = this.rowsAll.filter(v => v !== ir)
		this.filter()
	}

	updateItem(ir: ItemRow, item: Item) {
		ir.item = item
		ir.render()
	}
}
