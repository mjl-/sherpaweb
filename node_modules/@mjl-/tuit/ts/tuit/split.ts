import * as dom from '../dom'
import * as types from './types'

const splitStyle: dom.CSSProperties = {
	display: 'flex',
	height: '100%',
	flexGrow: 1,
	flexDirection: 'row',
}
const splitKidStyle: dom.CSSProperties = {
	display: 'flex',
	height: '100%',
	overflowY: 'auto',
}
const splitBorderStyle: dom.CSSProperties = {
	height: '100%',
	width: '1px',
	backgroundColor: '#ddd',
}

export class Split implements dom.Rooter {
	root: HTMLElement

	constructor(app: types.Looker, ...elems: HTMLElement[]) {
		const looksSplit = app.ensureLooks('split', splitStyle)
		const looksSplitKid = app.ensureLooks('split-kid', splitKidStyle)
		const looksSplitBorder = app.ensureLooks('split-border', splitBorderStyle)

		const makeKid = (e: HTMLElement) => dom.div(looksSplitKid, e)
		const x = [makeKid(elems[0])]
		elems.slice(1).map(e => {
			x.push(dom.div(looksSplitBorder))
			x.push(makeKid(e))
		})
		if (x.length > 0) {
			x[x.length - 1].style.flexGrow = '1'
		}
		this.root = dom.div(
			{ ui: 'Split' },
			looksSplit,
			...x
		)
	}
}
