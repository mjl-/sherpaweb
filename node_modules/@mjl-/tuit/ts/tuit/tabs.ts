import * as dom from '../dom'
import * as types from './types'
import * as fns from './fns'
import * as load from './load'

const tabsBoxStyle: dom.CSSProperties = {
	borderBottom: '1px solid #ccc',
	textAlign: 'center',
}

export class Tabs implements types.UI, types.Stater {
	root: HTMLElement

	selectedBox: HTMLElement
	activeIndex: number
	buttons: HTMLButtonElement[]

	constructor(private app: dom.Rooter & types.Saver & types.Loader & types.Looker & types.StateSaver, public tabs: { label: string, name: string, ui: types.UI & types.Stater }[]) {
		const looksTabsBox = app.ensureLooks('tabs-box', tabsBoxStyle)

		this.activeIndex = -1
		this.buttons = tabs.map((tab, index) =>
			dom.button(
				app.looks.groupBtnLight,
				dom.listen('click', ev => this.select(index)),
				tabs[index].label,
				{ tabindex: '0' },
			)
		)
		this.selectedBox = fns.box(app)
		this.root = fns.box(
			app,
			dom.div(
				looksTabsBox,
				dom.div(
					app.looks.boxPadding,
					...this.buttons,
				),
			),
			this.selectedBox,
		)
	}

	async openTab(name: string): Promise<types.UI & types.Stater> {
		const index = this.tabs.findIndex(tab => tab.name === name)
		if (index < 0) {
			return Promise.reject({ message: 'cannot find tab' })
		}
		await this.loadTab([], index)
		return this.tabs[index].ui
	}

	select(index: number) {
		this.loadTab([], index)
		this.app.saveState()
	}

	async loadTab(state: types.State, index: number): Promise<void> {
		if (this.activeIndex !== index) {
			if (this.activeIndex >= 0) {
				this.buttons[this.activeIndex].className = this.app.looks.groupBtnLight.className
			}
			this.activeIndex = index
			this.buttons[this.activeIndex].className = this.app.looks.groupBtnPrimary.className
			const activeTab = this.tabs[this.activeIndex]
			await load.reveal(this.selectedBox, activeTab.ui.root)
		}
		return this.tabs[this.activeIndex].ui.loadState(state)
	}

	focus() {
		this.tabs[this.activeIndex].ui.focus()
	}

	loadState(state: types.State): Promise<void> {
		const w = state.shift()
		if (w) {
			const i = this.tabs.findIndex(tab => tab.name === w)
			if (i >= 0) {
				return this.loadTab(state, i)
			}
		}
		return this.loadTab(state, 0)
	}

	currentState(): types.State {
		const tab = this.tabs[this.activeIndex]
		return [tab.name, ...tab.ui.currentState()]
	}
}
