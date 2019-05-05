import * as dom from '../dom'
import * as types from './types'

export class Failure implements types.UI {
	root: HTMLElement

	constructor(app: types.Looker, message: string) {
		this.root = dom.div(
			dom.h1(app.looks.title, 'Error'),
			dom.div(
				app.looks.alertDanger,
				dom.div(
					app.looks.textWrap,
					message,
				)
			),
		)
	}

	focus() {
	}
}
