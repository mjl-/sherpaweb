import * as dom from '@mjl-/tuit/dom'
import * as sherpadoc from './sherpadoc'
import App from './app'

function exampleObject(typenameMap: { [name: string]: sherpadoc.NamedType }, type: string[]): any {
	const checkDone = () => {
		if (type.length !== 0) {
			throw new Error('leftover token in type')
		}
	}
	if (type.length === 0) {
		throw new Error('empty type')
	}
	let t = type.shift()
	if (t === 'nullable') {
		t = type.shift()
	}
	if (!t) {
		throw new Error('empty type after nullable')
	}
	switch (t) {
		case 'bool':
			checkDone()
			return false
		case 'int8':
		case 'uint8':
		case 'int16':
		case 'uint16':
		case 'int32':
		case 'uint32':
		case 'int64':
		case 'uint64':
			checkDone()
			return 0
		case 'int64s':
		case 'uint64s':
			checkDone()
			return '0'
		case 'float32':
		case 'float64':
			checkDone()
			return 0.0
		case 'string':
			checkDone()
			return ''
		case 'timestamp':
			checkDone()
			return new Date().toISOString()
		case 'any':
			checkDone()
			return 'any'
		case '[]':
			const r1 = [exampleObject(typenameMap, type)]
			checkDone()
			return r1
		case '{}':
			const r2 = { key1: exampleObject(typenameMap, type) }
			checkDone()
			return r2
		default:
			if (!/[a-zA-Z][a-zA-Z0-9]*/.test(t)) {
				throw new Error('unknown keyword in type')
			}

			checkDone()
			const tt = typenameMap[t]
			if (!tt) {
				throw new Error('identifier for unknown type ' + t)
			}

			if (sherpadoc.isStruct(tt)) {
				const r3: { [k: string]: any } = {}
				for (const f of tt.Fields) {
					r3[f.Name] = exampleObject(typenameMap, f.Typewords.slice(0))
				}
				return r3
			} else if (sherpadoc.isStrings(tt) || sherpadoc.isInts(tt)) {
				return tt.Values[0].Value
			} else {
				throw new Error('unknown named type: ' + JSON.stringify(tt))
			}
	}
}

export function ParamJSON(typenameMap: { [name: string]: sherpadoc.NamedType }, type: string[]): string {
	const o = exampleObject(typenameMap, type.slice(0))
	return JSON.stringify(o, null, '\t')
}

// Wrap line on space-boundary, keep lines at most maxLength characters.
const wrap = (text: string, maxLength: number): string[] => {
	const r: string[] = []
	let line = ''
	text.split(' ').forEach((w) => {
		if (line === '' || line.length + 1 + w.length < maxLength) {
			if (line !== '') {
				line += ' '
			}
			line += w
		} else {
			r.push(line)
			line = w
		}
	})
	if (line !== '') {
		r.push(line)
	}
	return r
}

const tabSize = 4;

const formatComment = (text: string, indent: string): string => {
	text = text.trim()
	if (!text) {
		return ''
	}
	let r = ''
	const maxLength = Math.max(40, 100 - indent.replace(/\t/g, ' '.repeat(tabSize)).length - '// '.length)
	text.split('\n').forEach((line) => {
		wrap(line, maxLength).forEach((line) => {
			r += indent + '// ' + line + '\n'
		})
	})
	return r
}

function typeJS0(app: App, typenameMap: { [name: string]: sherpadoc.NamedType }, typewords: string[], firstIndent: string, laterIndent: string): (HTMLElement | string)[] {
	const origTypewords = JSON.stringify(typewords)
	let r: (HTMLElement | string)[] = [firstIndent]
	if (typewords.length === 0) {
		throw new Error('invalid empty typewords')
	}
	if (typewords[0] === 'nullable') {
		typewords.shift()
		// xxx should mark this as nullable?
	}
	if (typewords.length === 0) {
		throw new Error('invalid empty nullable typewords')
	}
	const t = typewords.shift()
	switch (t) {
		case 'any':
			r.push('"..."')
			break
		case 'bool':
			r.push('false')
			break
		case 'int8':
		case 'uint8':
		case 'int16':
		case 'uint16':
		case 'int32':
		case 'uint32':
		case 'int64':
		case 'uint64':
			r.push('0')
			break
		case 'int64s':
		case 'uint64s':
			r.push('"0"')
			break
		case 'float32':
		case 'float64':
			r.push('0.0')
			break
		case 'string':
			r.push('""')
			break
		case 'timestamp':
			r.push(JSON.stringify(new Date().toISOString()))
			break
		case '[]':
			{
				r.push('[\n')
				const indent = laterIndent + '\t'
				r.push(...typeJS0(app, typenameMap, typewords, indent, indent), '\n')
				r.push(laterIndent + ']')
			}
			break
		case '{}':
			{
				r.push('{\n')
				const indent = laterIndent + '\t'
				r.push(indent, '"key1": ', ...typeJS0(app, typenameMap, typewords, '', indent), '\n')
				r.push(laterIndent + '}')
			}
			break
		default:
			if (!t || !/[a-zA-Z][a-zA-Z0-9]*/.test(t)) {
				throw new Error('invalid field type: ' + origTypewords)
			}

			const td = typenameMap[t]
			if (!td) {
				throw new Error('unknown type')
			}

			if (sherpadoc.isStruct(td)) {
				r.push('{\n')
				const indent = laterIndent + '\t'

				const maxFieldNameLength = Math.max(...td.Fields.map(f => f.Name.length))
				const maxValueLength = 'false,	'.length

				for (let i = 0; i < td.Fields.length; i++) {
					const f = td.Fields[i]
					const isLast = i >= td.Fields.length - 1

					const inline = isInline(f.Typewords)
					const continueIndent = inline ? ' '.repeat(maxFieldNameLength - f.Name.length) : ''
					const value = typeJS0(app, typenameMap, f.Typewords.slice(0), continueIndent, indent)

					const comment = formatComment(f.Docs, indent)
					const multilineComment = comment.trim().split('\n').length > 1
					const commentBefore = multilineComment || !inline
					let commentPrefix = ''
					if (commentBefore) {
						r.push('\n', dom.span(app.style.comment, comment))
					} else {
						commentPrefix = ' '.repeat(maxValueLength - ParamJSON(typenameMap, f.Typewords.slice(0)).length - 1)
					}
					r.push(indent, '"', f.Name, '": ', ...value)
					if (!isLast) {
						r.push(',')
						commentPrefix += ' '
					}
					if (!commentBefore) {
						r.push(commentPrefix, dom.span(app.style.comment, comment || '\n'))
					} else {
						r.push('\n')
					}
				}
				r.push(laterIndent + '}')
			} else if (sherpadoc.isStrings(td)) {
				r.push(JSON.stringify(td.Values[0].Value))
				r.push('  /* or: ')
				r.push(td.Values.slice(1).map(v => JSON.stringify(v.Value)).join(', '))
				r.push(' */')
			} else if (sherpadoc.isInts(td)) {
				r.push(JSON.stringify(td.Values[0].Value))
				r.push('  /* (' + td.Values[0].Name + '), or: ')
				r.push(td.Values.slice(1).map(v => JSON.stringify(v.Value) + ' (' + v.Name + ')').join(', '))
				r.push(' */')
			} else {
				throw new Error('unknown named type: ' + JSON.stringify(td))
			}
	}
	if (typewords.length !== 0) {
		throw new Error('leftover tokens in type: ' + origTypewords)
	}
	return r
}

export const lowerName = (s: string): string => s.substring(0, 1).toLowerCase() + s.substring(1)

export function TypeJS(app: App, typenameMap: { [name: string]: sherpadoc.NamedType }, varName: string, td: sherpadoc.NamedType): HTMLElement {
	return dom.div(
		dom.span(app.style.comment, formatComment(td.Docs, '')),
		'var ', varName, ' = ', ...typeJS0(app, typenameMap, [td.Name], '', ''),
		'\n\n',
	)
}

const basicTypes = [
	'any',
	'string',
	'bool',
	'int8',
	'uint8',
	'int16',
	'uint16',
	'int32',
	'uint32',
	'int64',
	'uint64',
	'int64s',
	'uint64s',
	'timestamp',
]

export function isInline(type: string[]): boolean {
	let t = type[0]
	if (t === 'nullable') {
		t = type[1]
	}

	for (const v of basicTypes) {
		if (t === v) {
			return true
		}
	}
	return false
}

function isIdentifier(token: string): boolean {
	for (const v of basicTypes) {
		if (v === token) {
			return false
		}
	}
	switch (token) {
		case '[]':
		case '{}':
			return false
	}
	return !!token && /[a-zA-Z][a-zA-Z0-9]*/.test(token)
}

export function VarJS(app: App, typenameMap: { [name: string]: sherpadoc.NamedType }, varName: string, type: string[]): HTMLElement {
	let t = type[0]
	if (t === 'nullable') {
		t = type[1]
	}
	if (t && isIdentifier(t)) {
		const tt = typenameMap[t]
		if (!tt) {
			throw new Error('unknown identifier for type')
		}
		return TypeJS(app, typenameMap, varName, tt)
	}
	return dom.div(
		dom.span('var '),
		dom.span(varName),
		dom.span(' = '),
		dom.span(ParamJSON(typenameMap, type) + ';\n\n'),
	)
}
