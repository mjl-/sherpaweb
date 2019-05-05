import * as dom from '../dom'
import * as types from './types'
import * as fns from './fns'

export enum PopupSize {
	Small,
	Medium,
	Large,
}

const popupCloseBtnStyle: dom.CSSProperties = {
	cursor: 'pointer',
	position: 'absolute',
	right: '0',
	top: '0',
	color: '#888',
	padding: '.25em .5em .5em',
}

const popupBgStyle: dom.CSSProperties = {
	position: 'fixed',
	top: '0',
	left: '0',
	right: '0',
	bottom: '0',
	backgroundColor: 'rgba(0, 0, 0, .5)',
	opacity: 0,
}

const popupStyle: dom.CSSProperties = {
	position: 'fixed',
	top: '30px',
	backgroundColor: 'white',
	padding: '1em 2em 2em 2em',
	boxShadow: '0 0 100px #666',
	borderRadius: '.25em',
	opacity: 0,
}
const popupSmallStyle: dom.CSSProperties = {
	left: 'calc(50% - 200px)',
	right: 'calc(50% - 200px)',
}
const popupMediumStyle: dom.CSSProperties = {
	left: 'calc(50% - 300px)',
	right: 'calc(50% - 300px)',
}
const popupLargeStyle: dom.CSSProperties = {
	left: 'calc(50% - 450px)',
	right: 'calc(50% - 450px)',
}

export class Popup {
	closed: Promise<boolean>	// true means popup closed by call to close(), false means popup was canceled
	closedResolve: (v: boolean) => void

	private background: HTMLElement
	private popup: HTMLElement

	constructor(app: types.Looker & dom.Rooter, view: types.UI, size: PopupSize = PopupSize.Medium) {
		const looksPopupCloseBtn = app.ensureLooks('popup-close-btn', popupCloseBtnStyle)
		const looksPopupBg = app.ensureLooks('popup-bg', popupBgStyle)
		const looksPopup =
			size === PopupSize.Small ? app.ensureLooks('popup-small', popupStyle, popupSmallStyle) :
				size === PopupSize.Medium ? app.ensureLooks('popup-medium', popupStyle, popupMediumStyle) :
					app.ensureLooks('popup-large', popupStyle, popupLargeStyle)

		// tsc doesn't know new Promise() calls its handler immediately and initializes these values.
		this.closedResolve = (v: boolean) => {}
		this.closed = new Promise(resolve => {
			this.closedResolve = resolve
		})

		const closeButton = dom.div(
			looksPopupCloseBtn,
			{ tabindex: '0' },
			dom.listen('keydown', e => {
				if (e.key === 'Enter') {
					this.cancel()
				}
			}),
			dom.listen('click', () => this.cancel()),
			'x',
		)
		this.background = dom.div(
			looksPopupBg,
			dom.listen('click', () => this.cancel())
		)
		this.popup = dom.div(
			looksPopup,
			closeButton,
			view,
			dom.listen('keyup', ev => {
				if (ev.key === 'Escape') {
					ev.stopPropagation()
					this.cancel()
				}
			})
		)
		app.root.appendChild(this.background)
		app.root.appendChild(this.popup)
		fns.fade(this.background, .25)
		fns.fade(this.popup, .25)
		closeButton.focus() // in case view.focus() doesn't set a focus
		view.focus()
	}

	close() {
		this.background.remove()
		this.popup.remove()
		this.closedResolve(true)
	}

	cancel() {
		this.background.remove()
		this.popup.remove()
		this.closedResolve(false)
	}
}
