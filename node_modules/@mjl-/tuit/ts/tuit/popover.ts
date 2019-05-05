import * as dom from '../dom'
import * as types from './types'

const popoverStyle: dom.CSSProperties = {
	position: 'absolute',
	bottom: '2.2em',
	width: '100%',
	border: '1px solid #ccc',
	borderRadius: '.25em',
	boxShadow: '0 0 10px #ccc',
	marginTop: '.25em',
	backgroundColor: 'white',
	padding: '.25em',
	zIndex: 2,
	overflowY: 'auto',
	maxHeight: '10em',
}

export class Popover implements dom.Rooter {
	root: HTMLElement

	constructor(app: types.Looker, elem: HTMLElement) {
		const looksPopover = app.ensureLooks('popover', popoverStyle)

		this.root = dom.div(
			looksPopover,
			elem,
		)
	}
}
