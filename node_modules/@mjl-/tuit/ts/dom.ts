import * as CSS from 'csstype'
export { Properties as CSSProperties } from 'csstype'

interface StringDict {
	[propName: string]: string
}

class Listener {
	constructor(public event: string, public handler: (event: Event) => void) {
	}
}

export class Style {
	constructor(public props: CSS.Properties) {
	}
}

export interface Rooter {
	root: HTMLElement
}

export const isRooter = (v: any): v is Rooter => {
	return 'root' in v && v.root instanceof HTMLElement
}

export interface ClassNamer {
	className: string
}

export function isClassNamer(v: any): v is ClassNamer {
	return 'className' in v && typeof v['className'] === 'string'
}

export type ElemArg = string | ClassNamer | Element | Listener | Style | StringDict | Rooter
export type ElemArg0 = string | Element | Listener | Style | StringDict | Rooter

export const fill = <T extends HTMLElement>(e: T, l: ElemArg[]): T => {
	let haveClass = false
	l.forEach((c) => {
		if (typeof c === 'string') {
			const n = document.createTextNode(c)
			e.appendChild(n)
		} else if (c instanceof Element) {
			e.appendChild(c)
		} else if (isClassNamer(c)) {
			if (haveClass) {
				throw new Error('duplicate className')
			}
			e.className = c.className
			haveClass = true
		} else if (c instanceof Listener) {
			e.addEventListener(c.event, c.handler)
		} else if (c instanceof Style) {
			const st = e.style as any // xxx
			for (const key in <object>c.props) {
				st[key] = (<any>c.props)[key] // xxx probably not always correct, eg for array values
			}
		} else if (isRooter(c)) {
			e.appendChild(c.root)
		} else if (typeof c === 'object' && c !== null && c.constructor === Object) {
			for (const key in c) {
				e.setAttribute(key, c[key])
			}
		}
	})
	return e
}

export const a = (...l: ElemArg[]) => fill(document.createElement('a'), l)
export const nav = (...l: ElemArg[]) => fill(document.createElement('nav'), l)
export const label = (...l: ElemArg[]) => fill(document.createElement('label'), l)
export const small = (...l: ElemArg[]) => fill(document.createElement('small'), l)
export const h1 = (...l: ElemArg[]) => fill(document.createElement('h1'), l)
export const h2 = (...l: ElemArg[]) => fill(document.createElement('h2'), l)
export const h3 = (...l: ElemArg[]) => fill(document.createElement('h3'), l)
export const h4 = (...l: ElemArg[]) => fill(document.createElement('h4'), l)
export const h5 = (...l: ElemArg[]) => fill(document.createElement('h5'), l)
export const h6 = (...l: ElemArg[]) => fill(document.createElement('h6'), l)
export const div = (...l: ElemArg[]) => fill(document.createElement('div'), l)
export const span = (...l: ElemArg[]) => fill(document.createElement('span'), l)
export const button = (...l: ElemArg[]) => fill(document.createElement('button'), l)
export const table = (...l: ElemArg[]) => fill(document.createElement('table'), l)
export const thead = (...l: ElemArg[]) => fill(document.createElement('thead'), l)
export const tbody = (...l: ElemArg[]) => fill(document.createElement('tbody'), l)
export const tr = (...l: ElemArg[]) => fill(document.createElement('tr'), l)
export const th = (...l: ElemArg[]) => fill(document.createElement('th'), l)
export const td = (...l: ElemArg[]) => fill(document.createElement('td'), l)
export const input = (...l: ElemArg[]) => fill(document.createElement('input'), l)
export const form = (...l: ElemArg[]) => fill(document.createElement('form'), l)
export const fieldset = (...l: ElemArg[]) => fill(document.createElement('fieldset'), l)
export const strong = (...l: ElemArg[]) => fill(document.createElement('strong'), l)
export const img = (...l: ElemArg[]) => fill(document.createElement('img'), l)
export const p = (...l: ElemArg[]) => fill(document.createElement('p'), l)
export const br = (...l: ElemArg[]) => fill(document.createElement('br'), l)
export const style = (...l: ElemArg[]) => fill(document.createElement('style'), l)
export const textarea = (...l: ElemArg[]) => fill(document.createElement('textarea'), l)
export const select = (...l: ElemArg[]) => fill(document.createElement('select'), l)
export const option = (...l: ElemArg[]) => fill(document.createElement('option'), l)
export const ul = (...l: ElemArg[]) => fill(document.createElement('ul'), l)
export const ol = (...l: ElemArg[]) => fill(document.createElement('ol'), l)
export const li = (...l: ElemArg[]) => fill(document.createElement('li'), l)
export const dl = (...l: ElemArg[]) => fill(document.createElement('dl'), l)
export const dt = (...l: ElemArg[]) => fill(document.createElement('dt'), l)
export const dd = (...l: ElemArg[]) => fill(document.createElement('dd'), l)
export const address = (...l: ElemArg[]) => fill(document.createElement('address'), l)
export const article = (...l: ElemArg[]) => fill(document.createElement('article'), l)
export const aside = (...l: ElemArg[]) => fill(document.createElement('aside'), l)
export const footer = (...l: ElemArg[]) => fill(document.createElement('footer'), l)
export const header = (...l: ElemArg[]) => fill(document.createElement('header'), l)
export const hgroup = (...l: ElemArg[]) => fill(document.createElement('hgroup'), l)
export const main = (...l: ElemArg[]) => fill(document.createElement('main'), l)
export const section = (...l: ElemArg[]) => fill(document.createElement('section'), l)
export const blockquote = (...l: ElemArg[]) => fill(document.createElement('blockquote'), l)
export const figcaption = (...l: ElemArg[]) => fill(document.createElement('figcaption'), l)
export const figure = (...l: ElemArg[]) => fill(document.createElement('figure'), l)
export const hr = (...l: ElemArg[]) => fill(document.createElement('hr'), l)
export const abbr = (...l: ElemArg[]) => fill(document.createElement('abbr'), l)
export const bdi = (...l: ElemArg[]) => fill(document.createElement('bdi'), l)
export const bdo = (...l: ElemArg[]) => fill(document.createElement('bdo'), l)
export const cite = (...l: ElemArg[]) => fill(document.createElement('cite'), l)
export const code = (...l: ElemArg[]) => fill(document.createElement('code'), l)
export const data = (...l: ElemArg[]) => fill(document.createElement('data'), l)
export const dfn = (...l: ElemArg[]) => fill(document.createElement('dfn'), l)
export const em = (...l: ElemArg[]) => fill(document.createElement('em'), l)
export const i = (...l: ElemArg[]) => fill(document.createElement('i'), l)
export const kbd = (...l: ElemArg[]) => fill(document.createElement('kbd'), l)
export const mark = (...l: ElemArg[]) => fill(document.createElement('mark'), l)
export const q = (...l: ElemArg[]) => fill(document.createElement('q'), l)
export const sub = (...l: ElemArg[]) => fill(document.createElement('sub'), l)
export const sup = (...l: ElemArg[]) => fill(document.createElement('sup'), l)
export const time = (...l: ElemArg[]) => fill(document.createElement('time'), l)
export const tt = (...l: ElemArg[]) => fill(document.createElement('tt'), l)
export const u = (...l: ElemArg[]) => fill(document.createElement('u'), l)
export const audio = (...l: ElemArg[]) => fill(document.createElement('audio'), l)
export const video = (...l: ElemArg[]) => fill(document.createElement('video'), l)
export const track = (...l: ElemArg[]) => fill(document.createElement('track'), l)
export const embed = (...l: ElemArg[]) => fill(document.createElement('embed'), l)
export const iframe = (...l: ElemArg[]) => fill(document.createElement('iframe'), l)
export const object = (...l: ElemArg[]) => fill(document.createElement('object'), l)
export const param = (...l: ElemArg[]) => fill(document.createElement('param'), l)
export const picture = (...l: ElemArg[]) => fill(document.createElement('picture'), l)
export const source = (...l: ElemArg[]) => fill(document.createElement('source'), l)
export const canvas = (...l: ElemArg[]) => fill(document.createElement('canvas'), l)
export const del = (...l: ElemArg[]) => fill(document.createElement('del'), l)
export const ins = (...l: ElemArg[]) => fill(document.createElement('ins'), l)
export const caption = (...l: ElemArg[]) => fill(document.createElement('caption'), l)
export const col = (...l: ElemArg[]) => fill(document.createElement('col'), l)
export const colgroup = (...l: ElemArg[]) => fill(document.createElement('colgroup'), l)
export const datalist = (...l: ElemArg[]) => fill(document.createElement('datalist'), l)
export const legend = (...l: ElemArg[]) => fill(document.createElement('legend'), l)
export const meter = (...l: ElemArg[]) => fill(document.createElement('meter'), l)
export const optgroup = (...l: ElemArg[]) => fill(document.createElement('optgroup'), l)
export const output = (...l: ElemArg[]) => fill(document.createElement('output'), l)
export const progress = (...l: ElemArg[]) => fill(document.createElement('progress'), l)
export const dialog = (...l: ElemArg[]) => fill(document.createElement('dialog'), l)
export const menu = (...l: ElemArg[]) => fill(document.createElement('menu'), l)
export const menuitem = (...l: ElemArg[]) => fill(document.createElement('menuitem'), l)
export const summary = (...l: ElemArg[]) => fill(document.createElement('summary'), l)

export const createElement = (name: string, ...l: ElemArg[]): HTMLElement => fill(document.createElement(name), l)


export function listen(event: 'keyup' | 'keydown', handler: (event: KeyboardEvent) => void): Listener
export function listen(event: string, handler: (event: Event) => void): Listener
export function listen(event: string, handler: (event: any) => void): Listener {
	return new Listener(event, handler)
}

export const _style = (props: CSS.Properties) => {
	return new Style(props)
}

export const children = (elem: HTMLElement, ...kids: (string | Rooter | HTMLElement)[]) => {
	while (elem.firstChild) {
		elem.removeChild(elem.firstChild)
	}
	let ensureElement = (e: string | Rooter | HTMLElement): Element => {
		if (typeof e === 'string') {
			return span(e)
		} else if (isRooter(e)) {
			return e.root
		} else {
			return e
		}
	}
	kids.forEach((kid) => elem.appendChild(ensureElement(kid)))
}
