import * as dom from '@mjl-/tuit/dom'
import * as tuit from '@mjl-/tuit/tuit'
import App from './app'
import * as sherpa from './sherpa'
import * as sherpadoc from './sherpadoc'
import * as parse from './parse'
import * as example from './example'

class NavItem {
	root: HTMLElement

	looks: {
		section: tuit.Style
		type: tuit.Style
		function: tuit.Style
	}
	looksActive: {
		section: tuit.Style
		type: tuit.Style
		function: tuit.Style
	}

	constructor(app: App, private kind: 'section' | 'type' | 'function', private name: string, fn: () => void) {
		const hover: dom.CSSProperties = { backgroundColor: '#eee' }
		const style: dom.CSSProperties = {
			cursor: 'pointer',
			padding: '0 .35em',
		}
		this.looks = {
			section: app.ensureLooks('nav-section', style, { fontWeight: 'bold', borderRadius: '.25em' }).pseudo(':hover', hover),
			type: app.ensureLooks('nav-type', style, { backgroundColor: 'rgb(232, 235, 232)' }).pseudo(':hover', hover),
			function: app.ensureLooks('nav-function', style, { borderRadius: '.25em' }).pseudo(':hover', hover),
		}

		const active: dom.CSSProperties = {
			color: tuit.primary.fg,
			backgroundColor: tuit.primary.bg,
		}
		const activeHover: dom.CSSProperties = {
			color: tuit.primary.fg,
			backgroundColor: tuit.primary.bgHover,
		}
		this.looksActive = {
			section: app.copyLooks('nav-section-active', this.looks.section, active).pseudo(':hover', activeHover),
			type: app.copyLooks('nav-type-active', this.looks.type, active).pseudo(':hover', activeHover),
			function: app.copyLooks('nav-function-active', this.looks.function, active).pseudo(':hover', activeHover),
		}

		this.root = dom.div(
			this.looks[kind],
			name,
			dom.listen('click', ev => {
				ev.preventDefault()
				fn()
			}),
		)
	}

	select() {
		this.root.className = this.looksActive[this.kind].className
	}

	deselect() {
		this.root.className = this.looks[this.kind].className
	}

	currentState(): tuit.State {
		return [this.kind.substring(0, 1) + '=' + this.name]
	}
}


type SectionMap = { [k: string]: [NavItem, sherpadoc.Section] }
type FunctionMap = { [k: string]: [NavItem, sherpadoc.Function] }
type TypeMap = { [k: string]: [NavItem, sherpadoc.NamedType] }

export default class Docs {
	root: HTMLElement

	content: HTMLElement

	looksTranscript: tuit.Style
	looksDuration: tuit.Style
	looksSubtitle: tuit.Style

	state?: {
		baseURL: string
		sherpaJSON: sherpa.JSON
		sherpadoc: sherpadoc.Section
		selectedNav: NavItem // to track state, and marking active item
		sections: SectionMap	// for opening section by name
		functions: FunctionMap	// for opening function by name
		types: TypeMap	// for opening type by name
		navItems: NavItem[]
		typenameMap: sherpadoc.TypenameMap
	}

	constructor(private app: App) {
		this.looksTranscript = app.ensureLooks('transcript', {
			whiteSpace: 'pre-wrap',
			backgroundColor: '#f8f8f8',
			padding: '1rem',
			borderRadius: '0.25rem',
		})
		this.looksDuration = app.ensureLooks('duration', this.app.looks.title, {
			fontWeight: 'normal',
		})
		this.looksSubtitle = app.ensureLooks('subtitle', {
			fontWeight: 'bold',
			padding: '0.25em 0',
			marginTop: '1.5ex',
			marginBottom: '0.5ex',
		})

		this.content = tuit.box(app, dom._style({ width: '100%' }))
		this.root = tuit.box(
			app,
			{ ui: 'Docs' },
		)
	}

	focus() {
	}

	select(navItem: NavItem, saveState: boolean) {
		if (!this.state) {
			throw Error('Docs not yet initialized')
		}
		this.state.selectedNav.deselect()
		this.state.selectedNav = navItem
		this.state.selectedNav.select()
		if (saveState) {
			this.app.saveState()
		}
	}

	loadSection(d: sherpadoc.Section) {
		if (!this.state) {
			throw new Error('Docs not yet initalized')
		}
		const e = tuit.box(this.app,
			dom._style({
				display: 'flex',
				flexDirection: 'column',
			}),
			dom.div(
				dom._style({
					flexGrow: 1,
				}),
				dom.div(
					dom._style({
						padding: '0 2rem 2rem 2rem',
					}),
					dom.h1(this.app.looks.header, d.Name),
					dom.div(
						this.app.looks.textWrap,
						dom._style({
							maxWidth: '45rem',
						}),
						d.Docs,
					),
				),
			),
		)
		tuit.reveal(this.content, e)
	}

	loadFunction(fd: sherpadoc.Function) {
		if (!this.state) {
			throw new Error('Docs not yet initalized')
		}

		const inputs = fd.Params.map((p, index) => {
			let typewords = p.Typewords
			let isNullable = typewords[0] === 'nullable'
			const value = example.ParamJSON(this.state!.typenameMap, typewords)
			const lines = value.trim().split('\n').length
			if (lines > 1) {
				const e = dom.textarea(
					this.app.looks.formInput,
					isNullable ? {} : { required: '' },
					{ placeholder: value },
					{ rows: '' + lines },
					dom.listen('keyup', () => updateInput(index)),
				)
				e.value = value
				return e
			}
			return dom.input(
				this.app.looks.formInput,
				isNullable ? {} : { required: '' },
				{ value: value },
				{ placeholder: value },
				dom.listen('keyup', () => updateInput(index)),
			)
		})

		// We keep parameters up to date with changes to the input fields.
		const parameters = inputs.map((input, index) => sherpadoc.verifyArg('', JSON.parse(input.value), fd.Params[index].Typewords, true, false, this.state!.typenameMap))

		const parametersValid = inputs.map(() => true)
		const callValid = () => {
			for (const v of parametersValid) {
				if (!v) {
					return false
				}
			}
			return true
		}

		let callBusy = false
		const updateCallButton = () => {
			callButton.disabled = callBusy || !callValid()
		}

		const inputValue = (index: number) => {
			const input = inputs[index]
			const typewords = fd.Params[index].Typewords
			input.className = this.app.looks.formInput.className
			try {
				if (!input.value) {
					throw new Error('missing value')
				}
				const value = JSON.parse(input.value)
				parameters[index] = value
				sherpadoc.verifyArg('', value, typewords, true, false, this.state!.typenameMap)
				parametersValid[index] = true
				updateCallButton()
			} catch (err) {
				input.className = this.app.style.formInputError.className
				parameters[index] = '/* verify: ' + err.message + ' */'
				parametersValid[index] = false
				updateCallButton()
			}
		}
		const join = (l: HTMLElement[], sep: string): (HTMLElement | string)[] => {
			if (l.length === 0) {
				return []
			}
			const r: (HTMLElement | string)[] = [l[0]]
			for (const e of l.slice(1)) {
				r.push(sep)
				r.push(e)
			}
			return r
		}
		const linkedParam = (p: sherpadoc.Arg): HTMLElement => {
			const kids: (HTMLElement | string)[] = []
			if (p.Name) {
				kids.push(p.Name + ' ')
			}
			kids.push(this.linkedType(p.Typewords))
			return dom.span(...kids)
		}
		const linkedSynopsis = dom.div(
			fd.Name,
			'(',
			...join(fd.Params.map(p => linkedParam(p)), ', '),
			')',
			fd.Returns.length > 0 ? ': ' : '',
			fd.Returns.length > 1 ? '(' : '',
			...join(fd.Returns.map(p => linkedParam(p)), ', '),
			fd.Returns.length > 1 ? ')' : '',
		)

		const updateInput = (index: number) => {
			inputValue(index)
			updateRequestBox()
		}
		const updateRequestBox = () => {
			dom.children(requestBox, JSON.stringify({ params: parameters }, null, '\t'))
		}
		const requestBox = dom.div(
			this.looksTranscript,
		)
		updateRequestBox()

		const responseBox = dom.div(
			this.looksTranscript,
		)
		const requestDurationBox = dom.span(
			this.looksDuration,
		)

		const exampleBox = dom.div(
			this.looksTranscript,
			dom._style({
				fontFamily: 'Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace',
				tabSize: example.tabSize,
			}),
		)
		// xxx need to find a better way...
		const badStyle: { [k: string]: string } = exampleBox.style as any
		badStyle['-moz-tab-size'] = '' + example.tabSize

		const exampleVars = fd.Params.map(p => example.VarJS(this.app, this.state!.typenameMap, p.Name, p.Typewords))
		let exampleJS = ''
		exampleJS += this.state!.sherpaJSON.id + '.' + fd.Name + '('
		exampleJS += fd.Params.map(p => p.Name).join(', ')
		exampleJS += ')\n'
		exampleJS += '.then(function(result) {\n'
		exampleJS += '\tconsole.log("success", result);\n'
		exampleJS += '}, function(err) {\n'
		exampleJS += '\tconsole.log("error", err);\n'
		exampleJS += '\talert(err.message);\n'
		exampleJS += '});\n'
		dom.children(exampleBox, ...exampleVars, exampleJS)

		const callButton = dom.button(
			this.app.looks.btnPrimary,
			{ type: 'submit' },
			'call',
		)
		let aborter: AbortController
		const cancelButton = dom.button(
			this.app.looks.btnDanger,
			{ type: 'button' },
			'cancel',
			dom.listen('click', ev => {
				aborter.abort()
			}),
		)
		cancelButton.disabled = true

		const e = tuit.box(this.app,
			dom._style({
				display: 'flex',
				flexDirection: 'column',
			}),
			dom.div(
				dom._style({
					flexGrow: 1,
				}),
				dom.div(
					dom._style({
						padding: '0 2rem 2rem 2rem',
					}),
					dom.h1(this.app.looks.header, linkedSynopsis),
					dom.div(
						this.app.looks.textWrap,
						dom._style({
							maxWidth: '45rem',
						}),
						fd.Docs,
					),
					dom.br(),
					dom.form(
						dom.listen('submit', ev => {
							ev.preventDefault()
							dom.children(responseBox, '')

							aborter = new AbortController()
							callBusy = true
							updateCallButton()
							cancelButton.disabled = false

							// Update duration while calling is in progress. We update every 100ms for the first 10 seconds, then switch to whole seconds. At the end we show the detailed final count.
							dom.children(requestDurationBox)
							let t0 = new Date()
							let millis = 0
							let intervalID = setInterval(() => {
								millis += 100
								const duration = (millis / 1000).toFixed(1) + 's'
								dom.children(requestDurationBox, duration)
								if (millis >= 10 * 1000) {
									clearInterval(intervalID)
									intervalID = setInterval(() => {
										millis += 1000
										const duration = (millis / 1000).toFixed(0) + 's'
										dom.children(requestDurationBox, duration)
									}, 1000)
								}
							}, 100)

							const url = this.state!.baseURL + fd.Name
							fetch(url, {
								method: 'POST',
								headers: {
									'Accept': 'application/json',
									'Content-Type': 'application/json',
								},
								body: JSON.stringify({ params: parameters }),
								signal: aborter.signal,
							})
								.then(response => {
									if (!response.ok) {
										throw { message: 'http status ' + response.status }
									}
									return response.json()
								})
								.then(json => {
									dom.children(responseBox, JSON.stringify(json, null, '	'))
									if (!json.error) {
										const result = json.result
										if (fd.Returns.length == 1) {
											sherpadoc.verifyArg('result', result, fd.Returns[0].Typewords, true, true, this.state!.typenameMap)
										} else {
											fd.Returns.forEach((arg, index) => {
												sherpadoc.verifyArg('result[' + index + ']', result[index], arg.Typewords, true, true, this.state!.typenameMap)
											})
										}
									}
								})
								.catch(err => {
									dom.children(responseBox, 'call failed: ' + err.message)
								})
								.finally(() => {
									clearInterval(intervalID)
									dom.children(requestDurationBox)
									const t = new Date()
									const duration = ((t.getTime() - t0.getTime()) / 1000).toFixed(3) + 's'
									dom.children(requestDurationBox, duration)

									callBusy = false
									updateCallButton()
									cancelButton.disabled = true
								})
						}),
						...fd.Params.map((p, index) =>
							dom.div(
								dom.label(
									dom.span(
										dom._style({ fontWeight: 'bold' }),
										p.Name,
									),
									' ',
									this.linkedType(p.Typewords),
									dom.div(
										inputs[index],
									),
								),
							),
						),
						dom.div(callButton, ' ', cancelButton),
					),
					dom.br(),
					dom.div(
						dom.h2(this.app.looks.title, 'Request'),
						requestBox,
					),
					dom.br(),
					dom.div(
						dom.h2(this.app.looks.title, 'Response', ' ', requestDurationBox),
						responseBox,
					),
					dom.br(),
					dom.div(
						dom.h2(this.app.looks.title, 'Example'),
						exampleBox,
					),
				),
			),
		)
		tuit.reveal(this.content, e)
	}

	linkedType(typewords: string[]): HTMLElement {
		const kids: (HTMLElement | string)[] = []
		for (const t of typewords) {
			const td = this.state!.types[t]
			if (!td) {
				switch (t) {
					case 'nullable':
						kids.push('null or ')
						break
					default:
						kids.push(t)
				}
				continue
			}
			kids.push(
				dom.a(
					this.app.looks.link,
					{ href: '' },
					dom.listen('click', async e => {
						e.preventDefault()
						await this.openType(t)
						this.app.saveState()
					}),
					t,
				),
			)
		}
		return dom.span(...kids)
	}

	loadType(td: sherpadoc.NamedType) {
		if (!this.state) {
			throw new Error('Docs not yet initalized')
		}
		const usedParam: sherpadoc.Function[] = []
		const usedReturn: sherpadoc.Function[] = []
		const usedType: sherpadoc.Struct[] = []

		const usedInArgs = (args: sherpadoc.Arg[]): boolean => {
			for (const arg of args) {
				for (const w of arg.Typewords) {
					if (td.Name === w) {
						return true
					}
				}
			}
			return false
		}
		const usedInFields = (fl: sherpadoc.Field[]) => {
			for (const f of fl) {
				for (const s of f.Typewords) {
					if (s === td.Name) {
						return true
					}
				}
			}
			return false
		}
		const walkSection = (d: sherpadoc.Section) => {
			for (const f of d.Functions) {
				if (usedInArgs(f.Params)) {
					usedParam.push(f)
				}
				if (usedInArgs(f.Returns)) {
					usedReturn.push(f)
				}
			}
			for (const t of d.Structs) {
				if (usedInFields(t.Fields)) {
					usedType.push(t)
				}
			}
			for (const dd of d.Sections) {
				walkSection(dd)
			}
		}
		walkSection(this.state.sherpadoc)


		const makeFunctionUse = (title: string, functions: sherpadoc.Function[]) => {
			if (functions.length === 0) {
				return ''
			}
			return dom.div(
				dom._style({
					display: 'inline-block',
					verticalAlign: 'top',
					marginRight: '2rem'
				}),
				dom.h2(this.looksSubtitle, title),
				dom.ul(
					...functions.map(f =>
						dom.li(
							dom.a(
								this.app.looks.link,
								{ href: '' },
								dom.listen('click', async ev => {
									ev.preventDefault()
									await this.openFunction(f.Name)
									this.app.saveState()
								}),
								f.Name,
							),
						)
					),
				)
			)
		}
		const makeTypeUse = (title: string, types: sherpadoc.Struct[]) => {
			if (types.length === 0) {
				return ''
			}
			return dom.div(
				dom._style({
					display: 'inline-block',
					verticalAlign: 'top',
					marginRight: '2rem'
				}),
				dom.h2(this.looksSubtitle, title),
				dom.ul(
					...types.map(t =>
						dom.li(
							dom.a(
								this.app.looks.link,
								{ href: '' },
								dom.listen('click', async ev => {
									ev.preventDefault()
									await this.openType(t.Name)
									this.app.saveState()
								}),
								t.Name,
							),
						)
					),
				)
			)
		}

		const exampleBox = dom.div(
			this.looksTranscript,
			dom._style({
				fontFamily: 'Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace',
				tabSize: example.tabSize,
			}),
			example.TypeJS(this.app, this.state!.typenameMap, example.lowerName(td.Name), td)
		)
		// xxx need to find a better way...
		const badStyle: { [k: string]: string } = exampleBox.style as any
		badStyle['-moz-tab-size'] = '' + example.tabSize

		const e = tuit.box(this.app,
			dom._style({
				display: 'flex',
				flexDirection: 'column',
			}),
			dom.div(
				dom._style({
					flexGrow: 1,
				}),
				dom.div(
					dom._style({
						padding: '0 2rem 2rem 2rem',
					}),
					dom.h1(this.app.looks.header, td.Name),
					dom.div(
						this.app.looks.textWrap,
						dom._style({
							marginBottom: '2rem',
							maxWidth: '45rem',
						}),
						td.Docs,
					),
					dom.h1(this.app.looks.title, 'Example'),
					exampleBox,
					dom.br(),
					makeFunctionUse('Parameter for...', usedParam),
					makeFunctionUse('Returned by...', usedReturn),
					makeTypeUse('Used in type...', usedType),
				),
			),
		)
		tuit.reveal(this.content, e)
	}

	async openBaseURL(baseURL: string): Promise<void> {
		await tuit.load0(this.app, this.root, 'Opening sherpa API baseURL "' + baseURL + '"', async (aborter: tuit.Aborter): Promise<HTMLElement[]> => {
			return await this.loadBaseURL(baseURL, aborter)
		})
	}

	async loadBaseURL(baseURL: string, aborter: tuit.Aborter): Promise<HTMLElement[]> {
		if (baseURL === '') {
			throw new Error('Empty sherpa API baseURL, please fill in a URL.')
		}
		if (!/^https?:\/\//.test(baseURL)) {
			throw new Error('baseURL must start with https:// or http://.')
		}
		if (!/\/$/.test(baseURL)) {
			baseURL += '/'
		}
		if (location.protocol == 'https:' && /^http:/.test(baseURL)) {
			location.href = 'http://' + location.hostname + '/#' + baseURL
			// not reached
		}
		const loadJSON = async (url: string, filename: string) => {
			url += filename
			const abortctl = new AbortController()
			aborter.abort = () => abortctl.abort()
			let response: Response
			try {
				response = await fetch(url, {
					signal: abortctl.signal,
				})
			} catch (err) {
				throw new Error('Error fetching "' + url + '": ' + err.message + '\n\nCommon causes: no network connectivity, bad URL, server not running, or no CORS configured at URL.');
			}
			if (!response.ok) {
				throw new Error('Error fetching "' + url + '": HTTP	 status ' + response.status)
			}
			return await response.json()
		}

		const sherpaJSON: sherpa.JSON = parse.JSON(await loadJSON(baseURL, 'sherpa.json'))
		if (sherpaJSON.sherpaVersion !== sherpadoc.supportedSherpaVersion) {
			throw new Error('unsupported sherpaVersion ' + sherpaJSON.sherpaVersion + ', expecting ' + sherpadoc.supportedSherpaVersion)
		}
		const sherpadocResp = await loadJSON(baseURL, '_docs')
		if (sherpadocResp.error) {
			throw sherpadocResp.error
		}
		const doc: sherpadoc.Section = parse.section(sherpadocResp.result)

		const sections: SectionMap = {}
		const types: TypeMap = {}
		const functions: FunctionMap = {}

		const typenameMap: sherpadoc.TypenameMap = {}
		const gatherTypenames = (d: sherpadoc.Section) => {
			for (const t of d.Structs) {
				typenameMap[t.Name] = t
			}
			for (const t of d.Strings) {
				typenameMap[t.Name] = t
			}
			for (const t of d.Ints) {
				typenameMap[t.Name] = t
			}
			for (const dd of d.Sections) {
				gatherTypenames(dd)
			}
		}
		gatherTypenames(doc)


		const navItems: NavItem[] = []
		const makeNav = (d: sherpadoc.Section): [HTMLElement, NavItem] => {
			const sectionTitle = new NavItem(this.app, 'section', d.Name, () => {
				this.select(sectionTitle, true)
				this.loadSection(d)
			})
			navItems.push(sectionTitle)
			const nav = dom.div(
				this.app.looks.boxPadding,
				sectionTitle,
				...([...d.Structs, ...d.Strings, ...d.Ints]).map(t => {
					const e = new NavItem(this.app, 'type', t.Name, () => {
						this.select(e, true)
						this.loadType(t)
					})
					types[t.Name] = [e, t]
					navItems.push(e)
					return e
				}),
				...d.Functions.map(f => {
					const e = new NavItem(this.app, 'function', f.Name, () => {
						this.select(e, true)
						this.loadFunction(f)
					})
					functions[f.Name] = [e, f]
					navItems.push(e)
					return e
				}),
				...d.Sections.map(s => {
					const [nav] = makeNav(s)
					return nav
				})
			)
			sections[d.Name] = [sectionTitle, d]
			return [nav, sectionTitle]
		}

		const [nav, sectionItem] = makeNav(doc)
		const navBox = tuit.box(
			this.app,
			dom._style({ minWidth: '10rem' }),
			nav,
			dom.div(
				dom._style({ padding: '2em .5em .5em .5em', fontSize: '.9em' }),
				dom.div(dom.a(this.app.looks.link, { href: 'https://www.sherpadoc.org/' }, 'sherpadoc.org')),
				dom.div(dom.a(this.app.looks.link, { href: 'https://github.com/mjl-/sherpaweb' }, 'sherpaweb code')),
				dom.div(sherpaJSON.version),
			),
		)

		const top = dom.div(
			this.app.looks.boxPadding,
			dom.div(
				dom._style({
					float: 'left',
				}),
				dom.a(
					this.app.looks.link,
					dom._style({
						textDecoration: 'none',
					}),
					{ href: '' },
					'←',
					dom.listen('click', async (e) => {
						e.preventDefault()
						location.href = '/'
					}),
				),
			),
			dom.div(
				dom._style({
					borderBottom: '1px solid #ccc',
					textAlign: 'center',
				}),
				dom.h1(
					dom._style({
						marginBottom: 0,
					}),
					this.app.looks.title,
					baseURL,
					' - ',
					sherpaJSON.version,
				),
			),
		)
		const ui = tuit.box(this.app,
			top,
			tuit.box(
				this.app,
				new tuit.Split(this.app, navBox, this.content).root,
			),
		)

		this.state = {
			baseURL: baseURL,
			sherpaJSON: sherpaJSON,
			sherpadoc: doc,
			selectedNav: sectionItem,
			sections: sections,
			types: types,
			functions: functions,
			navItems: navItems,
			typenameMap: typenameMap,
		}

		return [ui]
	}

	async loadState(state: tuit.State): Promise<void> {
		try {
			const w = state.shift()
			if (typeof w !== 'string') {
				throw new Error('Docs: bad state, expected string token')
			}

			if (!this.state || this.state.baseURL !== w) {
				await this.openBaseURL(w)
			}

			const v = state.shift()
			if (typeof v === 'string') {
				if (v.startsWith('s=')) {
					await this.openSection(v.substring(2))
					return
				} else if (v.startsWith('t=')) {
					await this.openType(v.substring(2))
					return
				} else if (v.startsWith('f=')) {
					await this.openFunction(v.substring(2))
					return
				}
			}
			if (!this.state) {
				throw new Error('Docs not yet initialized')
			}
			await this.loadSection(this.state.sherpadoc)
			this.select(this.state.navItems[0], true)
		} catch (err) {
			tuit.reveal(this.content, tuit.middle(this.app, dom.div('error: ' + err.message)))
		}
	}

	currentState(): tuit.State {
		if (!this.state) {
			throw new Error('Docs not yet initialized')
		}
		return [this.state.baseURL, ...this.state.selectedNav.currentState()]
	}

	async openSection(name: string): Promise<sherpadoc.Section> {
		if (!this.state) {
			throw new Error('Docs not yet initialized')
		}
		const tup = this.state.sections[name]
		if (!tup) {
			throw new Error(`cannot find section "${name}"`)
		}
		const [navItem, d] = tup
		this.loadSection(d)
		this.select(navItem, false)
		return Promise.resolve(d)
	}

	openType(name: string): Promise<sherpadoc.NamedType> {
		if (!this.state) {
			throw new Error('Docs not yet initialized')
		}
		const tup = this.state.types[name]
		if (!tup) {
			throw new Error(`cannot find type "${name}"`)
		}
		const [navItem, t] = tup
		this.loadType(t)
		this.select(navItem, false)
		return Promise.resolve(t)
	}

	openFunction(name: string): Promise<sherpadoc.Function> {
		if (!this.state) {
			throw new Error('Docs not yet initialized')
		}
		const tup = this.state.functions[name]
		if (!tup) {
			throw new Error(`cannot find function "${name}"`)
		}
		const [navItem, f] = tup
		this.loadFunction(f)
		this.select(navItem, false)
		return Promise.resolve(f)
	}
}
