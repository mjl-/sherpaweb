import * as dom from '../dom'
import * as types from './types'
import * as confirm from './confirm'
import * as form from './form'
import * as fns from './fns'

export class FormEdit<Item> implements types.UI, types.Stater {
	root: HTMLElement

	fieldValues: form.FieldValue[]

	constructor(
		app: dom.Rooter & types.Saver & types.Loader & types.Looker & types.StateSaver,
		objectName: string,
		fields: form.Field[],
		item: Item,
		save: (object: Item) => Promise<void>,
		remove: (object: Item) => Promise<void>,
	) {
		const saveSpinBox = dom.span()
		let saveFieldset: HTMLFieldSetElement
		const removeSpinBox = dom.span()
		let removeButton: HTMLButtonElement
		this.fieldValues = []
		this.root = fns.box(
			app,
			{ ui: 'FormEdit' },
			dom.div(
				app.looks.boxPaddingLast,
				dom.div(
					dom.h1(
						app.looks.inlineTitle,
						objectName.substring(0, 1).toUpperCase() + objectName.substring(1),
					),
					' ',
					removeButton = dom.button(
						app.looks.btnDanger,
						dom.listen('click', async ev => {
							const confirmed = await confirm.confirm(app, 'Sure?', 'Are you sure you want to remove this ' + objectName + '?', 'Yes, remove ' + objectName)
							if (confirmed) {
								// xxx see if we can make this more typesafe
								const object: any = {}
								this.fieldValues.forEach((fv, index) => object[fields[index].name] = fv.value())
								app.save(removeSpinBox, removeButton, 'removing ' + objectName, () => remove(object as Item))
							}
						}),
						'remove'
					),
					removeSpinBox,
				),
				dom.form(
					dom.listen('submit', ev => {
						ev.preventDefault()
						// xxx see if we can make this more typesafe
						const object: any = {}
						this.fieldValues.forEach((fv, index) => object[fields[index].name] = fv.value())
						app.save(saveSpinBox, saveFieldset, 'saving ' + objectName, () => save(object as Item))
					}),
					saveFieldset = dom.fieldset(
						dom.div(
							...fields.map(f => {
								const v: any = (<any>item)[f.name]
								const fv = form.makeFieldValue(app, f, v)
								this.fieldValues.push(fv)
								return fv.element
							}),
						),
						dom.button(
							app.looks.btnPrimary,
							{ type: 'submit' },
							'Save ' + objectName,
						),
						saveSpinBox,
					),
				),
			)
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
