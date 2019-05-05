import * as dom from '../dom'
import * as types from './types'

export const delay = async (ms: number): Promise<void> => {
	await new Promise(resolve => setTimeout(resolve, ms))
}

// packState returns the state in a form that can be assigned to location.hash directly.
export const packState = (state: types.State): string => {
	if (state.length === 0) {
		return ''
	}

	const pack = (st: types.StateWord): string => {
		if (typeof st === 'string') {
			return encodeURIComponent(st)
		}
		return ['[', ...st.map(w => pack(w)), ']'].join(' ')
	}
	return '#' + state.map(w => pack(w)).join(' ')
}


export const parseState = (locationHash: string): types.State => {
	const words = locationHash ? decodeURIComponent(locationHash).substring(1).split(' ') : []

	const takeArray = (): types.State => {
		const r: types.State = []
		while (words.length > 0 && words[0] !== ']') {
			const w = words[0]
			words.shift()
			if (w === '[') {
				r.push(takeArray())
				words.shift()
			} else {
				r.push(w)
			}
		}
		return r
	}
	const r = takeArray()
	return r
}

export const fade = (elem: HTMLElement, step: number): Promise<void> => {
	return new Promise(resolve => {
		let opacity = Math.max(0, Math.min(1, parseFloat(elem.style.opacity || '1')))
		let id = window.setInterval(() => {
			opacity += step
			elem.style.opacity = '' + opacity
			if (opacity <= 0 || opacity >= 1) {
				window.clearInterval(id)
				resolve()
			}
		}, 16)
	})
}

export const box = (app: types.Looker, ...l: dom.ElemArg0[]) => {
	const e = dom.div({ ui: 'box' }, app.looks.box, ...l)
	e.style.setProperty('height', '100%') // todo: figure out why this is necessary. same style is in class, but doesn't have the effect this inline style has....
	return e
}


const middleBoxStyle: dom.CSSProperties = {
	display: 'flex',
	height: '100%',
	textAlign: 'center',
}
const middleStyle: dom.CSSProperties = {
	flexGrow: 1,
	alignSelf: 'center',
}

export const middle = (app: types.Looker, ...kids: HTMLElement[]) => {
	const looksMiddleBox = app.ensureLooks('middle-box', middleBoxStyle)
	const looksMiddle = app.ensureLooks('middle', middleStyle)

	return dom.div(looksMiddleBox,
		dom.div(looksMiddle,
			...kids,
		),
	)
}
