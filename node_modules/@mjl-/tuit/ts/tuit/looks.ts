import * as dom from '../dom'

export const success = {
	fg: '#fff',
	bg: '#28a745',
	bgHover: '#218838',
	bgActive: '#1e7e34',
	border: '#28a745',
	borderHover: '#1e7e34',
	borderActive: '#1c7430',
}
export const danger = {
	fg: '#fff',
	bg: '#dc3545',
	bgHover: '#c82333',
	bgActive: '#bd2130',
	border: '#dc3545',
	borderHover: '#bd2130',
	borderActive: '#b21f2d',
}
export const primary = {
	fg: '#fff',
	bg: '#007bff',
	bgHover: '#0069d9',
	bgActive: '#0062cc',
	border: '#007bff',
	borderHover: '#0062cc',
	borderActive: '#005cbf',
}
export const secondary = {
	fg: '#fff',
	bg: '#6c757d',
	bgHover: '#5a6268',
	bgActive: '#545b62',
	border: '#6c757d',
	borderHover: '#545b62',
	borderActive: '#4e555b',
}
export const light = {
	fg: '#212529',
	bg: '#f8f9fa',
	bgHover: '#e2e6ea',
	bgActive: '#dae0e5',
	border: '#f8f9fa',
	borderHover: '#dae0e5',
	borderActive: '#d3d9df',
}


export class Style {
	readonly propsList: dom.CSSProperties[]
	pseudoStyles: { name: string, propsList: dom.CSSProperties[] }[]

	constructor(readonly sheet: CSSStyleSheet, private readonly selectorPrefix: string, readonly className: string, ...styles: (Style | dom.CSSProperties)[]) {
		this.propsList = []
		this.pseudoStyles = []
		for (const style of styles) {
			if (style instanceof Style) {
				for (const props of style.propsList) {
					this.propsList.push(props)
				}
			} else {
				this.propsList.push(style)
			}
		}

		this.add('.' + className, this.propsList)
	}

	pseudo(pseudo: string, ...propsList: dom.CSSProperties[]): this {
		this.add('.' + this.className + pseudo, propsList)
		this.pseudoStyles.push({ name: pseudo, propsList: propsList })
		return this
	}

	private add(selector: string, propsList: dom.CSSProperties[]) {
		const selectorText = this.selectorPrefix + selector
		const index = this.sheet.cssRules.length
		this.sheet.insertRule(selectorText + ' {}', index)
		const st = (this.sheet.cssRules[index] as CSSStyleRule).style as any // xxx
		for (const props of propsList) {
			for (const key in <object>props) {
				st[key] = (<any>props)[key] // xxx probably not always correct, eg for array values
			}
		}
	}
}

export class Looks {
	uniqueID: string
	selectorPrefix: string
	style: HTMLStyleElement

	header: Style
	title: Style
	inlineTitle: Style
	formInput: Style
	textarea: Style
	tableInputSmall: Style
	searchInput: Style
	searchInputFiltered: Style
	searchInputNoresults: Style
	btnSuccess: Style
	btnDanger: Style
	btnPrimary: Style
	btnSecondary: Style
	btnLight: Style
	groupBtnSuccess: Style
	groupBtnDanger: Style
	groupBtnPrimary: Style
	groupBtnSecondary: Style
	groupBtnLight: Style
	cell: Style
	headerCell: Style
	dayHeaderCell: Style
	spin: Style
	box: Style
	listItem: Style
	listItemSelected: Style
	listItemPrimary: Style
	listItemSecondary: Style
	listItemSelectedPrimary: Style
	listItemSelectedSecondary: Style
	boxPadding: Style
	boxMargin: Style
	boxPaddingLast: Style
	boxMarginLast: Style
	checkmarkSuccess: Style
	textWrap: Style
	alertDanger: Style
	link: Style

	constructor(app: dom.Rooter, private baseClassName: string) {
		this.style = dom.style({ type: 'text/css' })
		document.head.appendChild(this.style) // todo: figure out how to insert this inside mtpt and make it work
		this.uniqueID = ('' + Math.random()).substring(2, 10)
		this.selectorPrefix = '.' + this.baseClassName + '-' + this.uniqueID + ' '


		const addResetRule = (selector: string, props: dom.CSSProperties) => {
			const sheet = this.style.sheet as CSSStyleSheet
			const selectorText = this.selectorPrefix + selector
			const index = sheet.cssRules.length
			sheet.insertRule(selectorText + '{}', index)
			const st = (sheet.cssRules[index] as CSSStyleRule).style as { [k: string]: any }
			for (const key in <object>props) {
				st[key] = <any>((<any>props)[key])
			}
		}

		addResetRule('', {
			color: '#333',
			lineHeight: '1.5',
			fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe types.UI",Roboto,"Helvetica Neue",Arial,sans-serif',
			fontSize: '15px',
		})
		addResetRule('*', {
			margin: '0',
			padding: '0',
			border: '0',
			fontSize: '100%',
			font: 'inherit',
			verticalAlign: 'baseline',
			boxSizing: 'border-box',
		})
		addResetRule('ol', { listStyle: 'none' })
		addResetRule('ul', { listStyle: 'none' })
		addResetRule('table', {
			borderCollapse: 'collapse',
			borderSpacing: '0',
		})


		const createLooks = (className: string, ...styles: (Style | dom.CSSProperties)[]): Style => {
			return this.create(false, className, ...styles)
		}
		const copyLooks = (className: string, ...styles: (Style | dom.CSSProperties)[]): Style => {
			return this.create(true, className, ...styles)
		}

		this.header = createLooks('header', {
			fontWeight: 'normal',
			padding: '.25em 0',
			fontSize: '1.5em',
			fontFamily: 'Palatino, Palatino Linotype, Palatino LT STD, Book Antiqua, Georgia, serif',
		})
		this.title = createLooks('title', {
			fontWeight: 'bold',
			padding: '.25em 0',
			marginBottom: '1.5ex',
		})
		this.inlineTitle = createLooks('inline-title', this.title, { display: 'inline-block' })

		const inputStyle = {
			display: 'block',
			fontSize: '1em',
			padding: '.2em .4em',
			borderRadius: '.25em',
			border: '1px solid #ccc',
			width: '100%',
		}
		this.formInput = createLooks('form-input', inputStyle, {
			marginBottom: '.5em',
			marginTop: '.5em',
		})
		this.tableInputSmall = createLooks('table-input-small', inputStyle, {
			display: 'inline',
			width: '3em',
		})
		this.textarea = createLooks('textarea', {
			display: 'block',
			marginBottom: '.5em',
			fontSize: '1em',
			padding: '.2em .4em',
			borderRadius: '.25em',
			border: '1px solid #ccc',
			marginTop: '.5em',
			width: '100%',
		})

		this.searchInput = createLooks('search-input', {
			display: 'block',
			padding: '.2em .4em',
			borderRadius: '.25em',
			border: '1px solid #ccc',
			width: '100%',
		})
		this.searchInputFiltered = createLooks('search-input-filtered', this.searchInput, { backgroundColor: '#28a74540' })
		this.searchInputNoresults = createLooks('search-input-noresults', this.searchInput, { backgroundColor: '#dc354540' })
		for (const c of [this.searchInput, this.searchInputFiltered, this.searchInputNoresults]) {
			c.pseudo(':focus', { borderColor: '#999' })
		}


		const btnStyle = {
			fontSize: '1em',
			border: 'none',
			padding: '0em .6em .15em',
			cursor: 'pointer',
			borderRadius: '.25em',
		}

		const hex2rgba = (hex: string, alpha: number) => {
			const parse = (o: number) => parseInt(hex.substr(1 + o, 2), 16)
			const [r, g, b] = [parse(0), parse(2), parse(4)]
			return 'rgba(' + [r, g, b].map(v => '' + v).join(', ') + ', ' + alpha + ')'
		}

		const buttonLooks = (name: string, colors: typeof success) => {
			return createLooks(name, btnStyle, {
				color: colors.fg,
				backgroundColor: colors.bg,
				borderColor: colors.border,
			})
				.pseudo(':active', {
					backgroundColor: colors.bgActive,
					borderColor: colors.borderActive,
				})
				.pseudo(':hover', {
					backgroundColor: colors.bgHover,
					borderColor: colors.borderHover,
				})
				.pseudo(':focus', {
					boxShadow: '0 0 0 .2em ' + hex2rgba(colors.bg, .5),
				})
		}

		this.btnSuccess = buttonLooks('btn-success', success)
		this.btnDanger = buttonLooks('btn-danger', danger)
		this.btnPrimary = buttonLooks('btn-primary', primary)
		this.btnSecondary = buttonLooks('btn-secondary', secondary)
		this.btnLight = buttonLooks('btn-light', light)

		this.groupBtnSuccess = copyLooks('group-btn-success', this.btnSuccess)
		this.groupBtnDanger = copyLooks('group-btn-danger', this.btnDanger)
		this.groupBtnPrimary = copyLooks('group-btn-primary', this.btnPrimary)
		this.groupBtnSecondary = copyLooks('group-btn-secondary', this.btnSecondary)
		this.groupBtnLight = copyLooks('group-btn-light', this.btnLight)
		for (const v of [this.groupBtnSuccess, this.groupBtnDanger, this.groupBtnPrimary, this.groupBtnSecondary, this.groupBtnLight]) {
			v.pseudo('', { borderRadius: '0' })
			v.pseudo(':first-child', { borderRadius: '.25em 0 0 .25em' })
			v.pseudo(':last-child', { borderRadius: '0 .25em .25em 0' })
		}


		this.cell = createLooks('cell', {
			verticalAlign: 'top',
			padding: '.25em',
		})
			.pseudo(':first-child', { paddingLeft: 0 })
			.pseudo(':last-child', { paddingRight: 0 })
		this.headerCell = createLooks('header-cell', {
			verticalAlign: 'top',
			padding: '.25em',
			fontWeight: 'bold',
			textAlign: 'left',
		})
			.pseudo(':first-child', { paddingLeft: 0 })
			.pseudo(':last-child', { paddingRight: 0 })

		this.dayHeaderCell = createLooks('day-header-cell', {
			verticalAlign: 'top',
			padding: '.25em',
			backgroundColor: '#eee',
		})
			.pseudo(':first-child', { paddingLeft: 0 })
			.pseudo(':last-child', { paddingRight: 0 })


		const spinRotation = this.uniqueName('rotate')
		this.spin = createLooks('spin', {
			display: 'inline-block',
			animation: spinRotation + ' .55s infinite linear',
			textAlign: 'center',
			height: '.7em',
			width: '.7em',
			verticalAlign: 'middle',
			fontSize: '2em',
			lineHeight: '1',
		})
			.pseudo(':after', { content: '"*"' })

		// xxx include in Style?
		this.addRawRule(`
				@keyframes ` + spinRotation + ` {
					from {
						transform: rotate(0deg);
					}
					to {
						transform: rotate(359deg);
					}
				}
			`)

		this.box = createLooks('box', {
			flex: '1',
			flexDirection: 'column',
			overflowY: 'auto',
			display: 'flex',
			height: '100%',
		})

		this.listItem = createLooks('list-item', {
			cursor: 'pointer',
			padding: '.2em .25em',
			margin: '.2em .5em',
			borderRadius: '.25em',
		})
			.pseudo(':hover', { backgroundColor: '#eee' })
			.pseudo(':focus', { backgroundColor: '#eee' })
		this.listItemSelected = createLooks('listen-item-selected', {
			cursor: 'pointer',
			padding: '.2em .5em .2em .25em',
			margin: '.2em 0 .2em .5em',
			borderRadius: '.25em 0 0 .25em',
			backgroundColor: '#007bff',
		})

		this.listItemPrimary = createLooks('list-item-primar', {})
		this.listItemSecondary = createLooks('list-item-secondary', { color: '#888' })
		this.listItemSelectedPrimary = createLooks('list-item-selected-primary', { color: 'white' })
		this.listItemSelectedSecondary = createLooks('list-item-selected-primary', { color: '#ddd' })

		this.boxPadding = createLooks('box-padding', { padding: '.25em .5em' })
		this.boxMargin = createLooks('box-margin', { margin: '.25em .5em' })
		this.boxPaddingLast = createLooks('box-padding', { padding: '.25em .5em 1em .5em' })
		this.boxMarginLast = createLooks('box-margin', { margin: '.25em .5em 1em .5em' })

		this.checkmarkSuccess = createLooks('checkmark-success', {
			backgroundColor: '#28a745',
			color: 'white',
			display: 'inline-block',
			height: '1.5em',
			width: '1.5em',
			textAlign: 'center',
			borderRadius: '.75em',
			marginLeft: '.5em',
		})
			.pseudo(':after', { content: '"✓"' })

		this.textWrap = createLooks('text-wrap', { whiteSpace: 'pre-wrap' })
		this.alertDanger = createLooks('alert-danger', {
			color: '#721c24',
			backgroundColor: '#f8d7da',
			borderColor: '#f5c6cb',
			position: 'relative',
			padding: '.75em 1.25em',
			marginBottom: '1em',
			border: '1px solid transparent',
		})
		this.link = createLooks('link', {
			color: primary.bg,
		}).pseudo(':hover', {
			color: primary.bgHover,
		})
	}

	create(copy: boolean, className: string, ...styles: (Style | dom.CSSProperties)[]): Style {
		className = className + '-' + this.uniqueID + '-' + this.baseClassName
		const r = new Style(this.style.sheet as CSSStyleSheet, this.selectorPrefix, className, ...styles)
		if (copy) {
			for (const style of styles) {
				if (!(style instanceof Style)) {
					continue
				}
				for (const tup of style.pseudoStyles) {
					r.pseudo(tup.name, ...tup.propsList)
				}
			}
		}
		return r
	}

	uniqueName(name: string) {
		return this.baseClassName + '-' + name + '-' + this.uniqueID
	}

	addRawRule(rule: string) {
		const sheet = this.style.sheet as CSSStyleSheet
		if (!sheet) {
			throw new Error('no sheet in stylesheet?')
		}
		sheet.insertRule(rule, sheet.insertRule(rule, sheet.cssRules.length))
	}
}
