import * as dom from '../dom'
import * as types from './types'
import * as form from './form'
import * as fns from './fns'

export class FormNew<Item> implements types.UI, types.Stater {
	root: HTMLElement

	fieldValues: form.FieldValue[]

	constructor(
		app: dom.Rooter & types.Saver & types.Loader & types.Looker & types.StateSaver,
		objectName: string,
		fields: form.Field[],
		create: (object: Item) => Promise<void>,
	) {
		const spinBox = dom.span()
		let fieldset: HTMLFieldSetElement
		this.fieldValues = []
		this.root = fns.box(
			app,
			{ ui: 'FormNew' },
			dom.div(
				app.looks.boxPaddingLast,
				dom.h1(
					app.looks.title,
					'New ' + objectName
				),
				dom.form(
					dom.listen('submit', ev => {
						ev.preventDefault()
						// xxx see if we can make this more typesafe
						const object: any = {}
						this.fieldValues.forEach((fv, index) => object[fields[index].name] = fv.value())
						app.save(spinBox, fieldset, 'adding ' + objectName, () => create(object as Item))
					}),
					fieldset = dom.fieldset(
						dom.div(
							...fields.map(f => {
								const fv = form.makeFieldValue(app, f)
								this.fieldValues.push(fv)
								return fv.element
							}),
						),
						dom.button(
							app.looks.btnSuccess,
							{ type: 'submit' },
							'Create ' + objectName,
						),
						spinBox,
					),
				),
			),
		)
	}

	focus() {
		for (const fv of this.fieldValues) {
			if (fv.focusable) {
				fv.focusable.focus()
				return
			}
		}
	}

	loadState(state: types.State): Promise<void> {
		return Promise.resolve()
	}

	currentState(): types.State {
		return []
	}
}
