import * as dom from '@mjl-/tuit/dom'
import * as tuit from '@mjl-/tuit/tuit'
import Intro from './intro'
import Docs from './docs'

class Blank {
	root: HTMLElement

	constructor() {
		this.root = dom.div()
	}

	focus() {
	}

	async loadState(state: tuit.State) {
		throw new Error('blank')
	}

	currentState(): tuit.State {
		throw new Error('blank')
	}
}

export default class App {
	root: HTMLElement
	looks: tuit.Looks
	private appLooks: { [className: string]: tuit.Style }
	style: {
		comment: tuit.Style
		formInputError: tuit.Style
	}
	currentUI: tuit.UI & tuit.Stater
	hashChange: () => void

	constructor(mtpt: HTMLElement) {
		this.looks = new tuit.Looks(this, 'sherpaweb')
		this.appLooks = {}
		this.style = {
			comment: this.looks.create(false, 'comment', {
				color: '#660066',
			}),
			formInputError: this.looks.create(false, 'form-input-error', this.looks.formInput, {
				borderColor: 'red',
			}),
		}

		this.root = tuit.box(
			this,
			{ ui: 'App' },
			{ class: 'sherpaweb-' + this.looks.uniqueID },
		)

		this.hashChange = () => this.loadState(tuit.parseState(location.hash))

		this.currentUI = new Blank()

		dom.children(mtpt, this.root)
		const initState = tuit.parseState(location.hash)
		this.loadState(initState)
			.then(() => window.addEventListener('hashchange', this.hashChange))
	}

	focus() {
	}

	async loadState(state: tuit.State): Promise<void> {
		if (state.length === 0) {
			return this.openIntro()
		}
		const docsUI = await this.openDocs()
		return docsUI.loadState(state)
	}

	async openIntro() {
		const intro = new Intro(this)
		this.currentUI = intro
		await tuit.reveal(this.root, intro.root)
	}

	openDocs(): Docs {
		if (!(this.currentUI instanceof Docs)) {
			const docs = new Docs(this)
			this.currentUI = docs
			dom.children(this.root, docs.root)
		}
		return this.currentUI as Docs
	}

	saveState() {
		const state = this.currentUI.currentState()
		window.removeEventListener('hashchange', this.hashChange)
		location.hash = tuit.packState(state)
		// without the setTimeout, we would still get the hashchange event on firefox
		setTimeout(() => window.addEventListener('hashchange', this.hashChange), 0)
	}

	_ensureLooks(copy: boolean, className: string, ...styles: (tuit.Style | dom.CSSProperties)[]): tuit.Style {
		let v = this.appLooks[className]
		if (!v) {
			v = this.looks.create(copy, className, ...styles)
			this.appLooks[className] = v
		}
		return v
	}

	ensureLooks(className: string, ...styles: (tuit.Style | dom.CSSProperties)[]): tuit.Style {
		return this._ensureLooks(false, className, ...styles)
	}

	copyLooks(className: string, ...styles: (tuit.Style | dom.CSSProperties)[]): tuit.Style {
		return this._ensureLooks(true, className, ...styles)
	}

	async loadBaseURL(baseURL: string): Promise<void> {
		try {
			const docsUI = await this.openDocs()
			await docsUI.openBaseURL(baseURL)
			await docsUI.loadSection(docsUI.state!.sherpadoc)
		} catch (err) {
			await this.openIntro()
		}
		this.saveState()
	}
}
