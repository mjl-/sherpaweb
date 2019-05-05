import * as dom from '../dom'
import * as fns from './fns'
import * as types from './types'
import * as load from './load'

export const save = async (
	app: types.Looker,
	spinBox: HTMLElement,
	disabler: { disabled: boolean } | null,
	msg: string,
	fn: () => Promise<void>,
	errorHandler: (err: Error) => Promise<void>,
): Promise<void> => {
	dom.children(spinBox, dom.span(app.looks.spin))
	if (disabler) {
		disabler.disabled = true
	}
	const _finally = () => {
		if (disabler) {
			disabler.disabled = false
		}
	}
	try {
		await fn()
	} catch (err) {
		await errorHandler(err)
	}

	load.reveal(spinBox, dom.span(app.looks.checkmarkSuccess))
	_finally()

	fns.delay(1000)
		.then(() => fns.fade(spinBox, -.2))
		.then(() => dom.children(spinBox))
}
