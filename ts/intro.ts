import * as dom from '@mjl-/tuit/dom'
import * as tuit from '@mjl-/tuit/tuit'
import App from './app'

export default class Intro {
	root: HTMLElement

	baseURL: HTMLInputElement

	constructor(app: App) {
		const exampleBaseURL = location.protocol + '//' + location.host + '/1/example/'
		this.root = tuit.middle(
			app,
			dom.div(
				dom._style({
					padding: '2em',
					maxWidth: '45em',
					margin: 'auto',
				}),
				dom.h1(
					app.looks.header,
					'Sherpa',
					dom.small(' – simple http rpc api'),
				),
				dom.form(
					dom.listen('submit', async ev => {
						ev.preventDefault()
						await app.loadBaseURL(this.baseURL.value)
					}),
					this.baseURL = dom.input(
						app.looks.formInput,
						{ placeholder: 'Enter a Sherpa API URL, https://...' },
					),
					dom.div(
						dom._style({
							textAlign: 'right',
						}),
						dom.a(
							app.looks.link,
							{ href: '#' + exampleBaseURL },
							dom.listen('click', async ev => {
								ev.preventDefault()
								try {
									await app.loadBaseURL(exampleBaseURL)
								} catch (e) {
									alert('Error loading baseURL: ' + e.message)
								}
							}),
							'Example',
						),
					),
					dom.br(),
					dom.div(
						dom.button(
							app.looks.btnPrimary,
							{ type: 'submit' },
							'Show documentation!',
						),
					),
					dom.br(),
					dom.br(),
					dom.div(
						dom.a(app.looks.link, { href: 'https://www.ueber.net/who/mjl/sherpa/' }, "sherpa api's"),
						' | ',
						dom.a(app.looks.link, { href: 'https://github.com/mjl-/sherpaweb/' }, "sherpaweb code"),
					),
				),
			),
		)
	}

	focus() {
	}

	loadState(state: tuit.State): Promise<void> {
		return Promise.resolve()
	}

	currentState(): tuit.State {
		return []
	}
}
