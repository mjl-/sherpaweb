import * as dom from '../dom'
import * as looks from './looks'
import * as types from './types'
import * as popover from './popover'

const typeaheadOptionStyle: dom.CSSProperties = {
	padding: '.25em',
	borderRadius: '.25em',
	cursor: 'pointer',
}

export class TypeaheadOption implements dom.Rooter {
	root: HTMLElement

	constructor(app: types.Looker, public value: string, typeahead: Typeahead) {
		const looksTypeaheadOption = app.ensureLooks('typeahead-option', typeaheadOptionStyle)
			.pseudo(':hover', { backgroundColor: '#eee' })
			.pseudo(':focus', { backgroundColor: '#ddd' })

		this.root = dom.div(
			looksTypeaheadOption,
			{ tabindex: '0' },
			value,
			dom.listen('click', ev => typeahead.selected(this)),
			dom.listen('keydown', ev => {
				if (ev.key === 'Enter') {
					ev.preventDefault()
					typeahead.selected(this)
				}
			}),
			dom.listen('blur', ev => typeahead.checkFocus()),
		)
	}
}

const commonPrefix = (s: string, l: string[]): string => {
	if (l.length === 0) {
		return s
	}
	let v = l[0]
	l.forEach(e => {
		let i: number
		for (i = 0; i < v.length && i < e.length && v[i] === e[i]; i++) {
		}
		v = v.substring(0, i)
	})
	return v
}

export class Typeahead implements types.UI {
	root: HTMLElement

	private popoverBox: HTMLElement
	private optionsAll: TypeaheadOption[]
	private optionsFiltered: TypeaheadOption[]
	private input: HTMLInputElement
	private optionsBox: HTMLElement
	private popover: popover.Popover

	constructor(
		private app: types.Looker,
		value: string,
		private values: string[],
		private inputLooks: looks.Style,
		inputFocusedLooks: looks.Style,
		private select: (v: string) => void,
		create: (v: string) => void,
		private focused: () => void,
		private blurred: () => void,
	) {
		const looksTypeahead = app.ensureLooks('typeahead', { position: 'relative' })

		this.optionsAll = this.values.map(v => new TypeaheadOption(app, v, this))
		this.optionsFiltered = this.optionsAll
		this.popoverBox = dom.div()
		this.optionsBox = dom.div(
			...this.optionsFiltered,
		)
		this.popover = new popover.Popover(app, this.optionsBox)
		this.input = dom.input(
			inputLooks,
			{ value: value },
			dom.listen('focus', ev => {
				this.focused()
				this.input.className = inputFocusedLooks.className
				this.filter(true)
			}),
			dom.listen('blur', ev => this.checkFocus()),
			dom.listen('keydown', ev => {
				if (ev.key === 'Enter') {
					if (this.input.value) {
						if (this.values.includes(this.input.value)) {
							select(this.input.value)
						} else {
							create(this.input.value)
						}
					}
				} else if (ev.key === 'f' && ev.getModifierState('Control')) {
					ev.preventDefault()
					this.input.value = commonPrefix(this.input.value, this.optionsFiltered.map(o => o.value))
				}
			}),
			dom.listen('keyup', ev => {
				this.filter(true)
			}),
		)
		this.root = dom.div(
			looksTypeahead,
			this.input,
			this.popoverBox,
		)
	}

	value() {
		return this.input.value
	}

	focus() {
		this.input.focus()
	}

	setValue(v: string) {
		this.input.value = v
		this.filter(false)
	}

	removeValue(v: string) {
		const i = this.values.indexOf(v)
		if (i < 0) {
			throw new Error('could not find value')
		}
		this.values.splice(i, 1)
		this.optionsAll.splice(i, 1)
		this.filter(false)
	}

	addValue(v: string) {
		this.values.push(v)
		this.values.sort()
		const i = this.values.indexOf(v)
		this.optionsAll.splice(i, 0, new TypeaheadOption(this.app, v, this))
		this.filter(false)
	}

	filter(ensure: boolean) {
		const v = this.input.value.toLowerCase()
		this.optionsFiltered = []
		this.values.forEach((vv, i) => {
			if (vv.toLowerCase().includes(v)) {
				this.optionsFiltered.push(this.optionsAll[i])
			}
		})
		if (this.optionsFiltered.length === 0) {
			dom.children(this.popoverBox)
		} else if (this.popoverBox.childElementCount > 0 || ensure) {
			dom.children(this.optionsBox, ...this.optionsFiltered)
			dom.children(this.popoverBox, this.popover)
		}
	}

	selected(o: TypeaheadOption) {
		this.select(o.value)
	}

	isFocused(): boolean {
		const elem = document.activeElement
		if (elem === this.input) {
			return true
		}
		for (let i = 0; i < this.optionsFiltered.length; i++) {
			if (this.optionsFiltered[i].root === elem) {
				return true
			}
		}
		return false
	}

	checkFocus() {
		setTimeout(() => {
			if (this.isFocused()) {
				return
			}

			this.input.className = this.inputLooks.className
			dom.children(this.popoverBox)
			this.blurred()
		}, 0)
	}
}
