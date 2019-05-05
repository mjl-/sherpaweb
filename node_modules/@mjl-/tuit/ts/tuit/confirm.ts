import * as dom from '../dom'
import * as types from './types'
import * as popup from './popup'
import * as styles from './styles'

export class Confirm implements types.UI {
	root: HTMLElement
	confirmed: Promise<void>

	private button: HTMLElement

	constructor(app: types.Looker, title: string, message: string, action: string) {
		let confirmResolve: () => void = () => {} // needed because tsc doesn't know "new Promise" assigns immediately.
		this.confirmed = new Promise(resolve => confirmResolve = confirmResolve)

		this.root = dom.div(
			dom.h1(app.looks.title, title),
			dom.p(
				app.looks.textWrap,
				message,
			),
			dom.br(),
			dom.div(
				styles.textAlign.right,
				this.button = dom.button(
					app.looks.btnPrimary,
					dom.listen('click', confirmResolve),
					action,
				),
			),
		)
	}

	focus() {
		this.button.focus()
	}
}

// Ask for confirmation. Promise result is the answer.
export const confirm = (app: types.Looker & dom.Rooter, title: string, message: string, action: string): Promise<boolean> => {
	return new Promise((resolve) => {
		const confirm = new Confirm(app, title, message, action)
		const p = new popup.Popup(app, confirm, popup.PopupSize.Small)
		return Promise.race([
			confirm.confirmed
				.then((v) => {
					p.close()
					return v
				}),
			p.closed,
		])
	})
}
