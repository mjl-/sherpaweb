import * as sherpa from './sherpa'
import * as sherpadoc from './sherpadoc'

export const section = (v: any): sherpadoc.Section => parseSection(v)
export const JSON = (v: any): sherpa.JSON => parseJSON(v)


function parseError(path: string, msg: string) {
	throw new Error('invalid sherpadoc at ' + path + ': ' + msg)
}

type basicType = 'null' | 'undefined' | 'string' | 'number' | 'array' | 'struct' | 'other'
function basicTypeName(v: any): basicType {
	const t = typeof v
	if (v === null || t === 'undefined') {
		return 'null'
	} else if (t === 'string' || t === 'number') {
		return t
	} else if (Array.isArray(v)) {
		return 'array'
	} else if (t === 'object') {
		return 'struct'
	}
	return 'other'
}

function checkEach(path: string, v: any, field: string, fn: (path: string, v: any) => void): void {
	const l = v[field]
	if (!Array.isArray(l)) {
		parseError(path, 'expected array')
	}
	path += '.' + field
	for (const index in l) {
		fn(path + '[' + index + ']', l[index])
	}
}

function checkObject(path: string, v: any, pairs: [string, basicType][]): void {
	if (typeof v !== 'object') {
		parseError(path, 'not a struct object')
	}
	if (v === null) {
		parseError(path, 'not a struct object, but null')
	}
	for (const [field, expectedType] of pairs) {
		const haveType = basicTypeName(v[field])
		if (haveType !== expectedType) {
			parseError(path + '.' + field, 'wrong type ' + haveType + ', expected ' + expectedType)
		}
	}
}

function checkString(path: string, v: any) {
	const t = typeof v
	if (t !== 'string') {
		parseError(path, 'expected string, saw ' + t)
	}
}

function makePath(path: string, field: string, index: number, name: string): string {
	return path + '.' + field + '[' + index + ' (' + name + ')]'
}

// NOTE: sherpaweb/ts/parse.ts and sherpadoc/check.go contain the same checking.
// The code is very similar. Best keep it in sync and modify the implementations in tandem.
class checker {
	constructor(private types: { [name: string]: boolean } = {}, private functions: { [name: string]: boolean } = {}) {
	}

	markIdent(path: string, ident: string) {
		if (this.types[ident]) {
			parseError(path, 'duplicate type ' + ident)
		}
		this.types[ident] = true
	}

	walkTypeNames(path: string, sec: sherpadoc.Section) {
		sec.Structs.forEach((t, i) => {
			this.markIdent(makePath(path, 'Structs', i, t.Name), t.Name)
		})
		sec.Ints.forEach((t, i) => {
			const npath = makePath(path, 'Ints', i, t.Name)
			this.markIdent(npath, t.Name)
			t.Values.forEach((v, j) => {
				this.markIdent(makePath(npath, 'Values', j, v.Name), v.Name)
			})
		})
		sec.Strings.forEach((t, i) => {
			const npath = makePath(path, 'Strings', i, t.Name)
			this.markIdent(npath, t.Name)
			t.Values.forEach((v, j) => {
				this.markIdent(makePath(npath, 'Values', j, v.Name), v.Name)
			})
		})
		sec.Sections.forEach((subsec, i) => {
			this.walkTypeNames(makePath(path, 'Sections', i, subsec.Name), subsec)
		})
	}

	walkFunctionNames(path: string, sec: sherpadoc.Section) {
		sec.Functions.forEach((fn, i) => {
			const npath = makePath(path, 'Functions', i, fn.Name)
			if (this.functions[fn.Name]) {
				parseError(npath, 'duplicate function name ' + fn.Name)
			}
			this.functions[fn.Name] = true

			const paramNames: { [name: string]: boolean } = {}
			fn.Params.forEach((arg, i) => {
				if (paramNames[arg.Name]) {
					parseError(makePath(npath, 'Params', i, arg.Name), 'duplicate parameter name')
				}
				paramNames[arg.Name] = true
			})

			const returnNames: { [name: string]: boolean } = {}
			fn.Returns.forEach((arg, i) => {
				if (returnNames[arg.Name]) {
					parseError(makePath(npath, 'Returns', i, arg.Name), 'duplicate return name')
				}
				returnNames[arg.Name] = true
			})
		})
		sec.Sections.forEach((subsec, i) => {
			this.walkFunctionNames(makePath(path, 'Sections', i, subsec.Name), subsec)
		})
	}

	checkTypewords(path: string, tokens: string[], okNullable: boolean) {
		tokens = tokens.slice(0)

		const tt: string | undefined = tokens.shift()
		if (tt === undefined) {
			parseError(path, 'unexpected end of typewords')
			return // should not be needed, but typescript doesn't understand parseError unconditionally throws an exception.
		}
		const t: string = tt
		switch (t) {
			case 'nullable':
				if (!okNullable) {
					parseError(path, 'repeated nullable in typewords')
				}
				if (tokens.length == 0) {
					parseError(path, 'missing typeword after ' + t)
				}
				this.checkTypewords(path, tokens, false)
				break
			case 'any':
			case 'bool':
			case 'int8':
			case 'uint8':
			case 'int16':
			case 'uint16':
			case 'int32':
			case 'uint32':
			case 'int64':
			case 'uint64':
			case 'int64s':
			case 'uint64s':
			case 'float32':
			case 'float64':
			case 'string':
			case 'timestamp':
				if (tokens.length != 0) {
					parseError(path, 'leftover typewords ' + tokens)
				}
				break
			case '[]':
			case '{}':
				if (tokens.length == 0) {
					parseError(path, 'missing typeword after ' + t)
				}
				this.checkTypewords(path, tokens, true)
				break
			default:
				if (!this.types[t]) {
					parseError(path, 'referenced type ' + t + ' does not exist')
				}
				if (tokens.length != 0) {
					parseError(path, 'leftover typewords ' + tokens)
				}
		}
	}

	walkTypewords(path: string, sec: sherpadoc.Section) {
		sec.Structs.forEach((t, i) => {
			const npath = makePath(path, 'Structs', i, t.Name)
			t.Fields.forEach((f, j) => {
				this.checkTypewords(makePath(npath, 'Fields', j, f.Name), f.Typewords, true)
			})
		})
		sec.Functions.forEach((fn, i) => {
			const npath = makePath(path, 'Functions', i, fn.Name)
			fn.Params.forEach((arg, j) => {
				this.checkTypewords(makePath(npath, 'Params', j, arg.Name), arg.Typewords, true)
			})
			fn.Returns.forEach((arg, j) => {
				this.checkTypewords(makePath(npath, 'Returns', j, arg.Name), arg.Typewords, true)
			})
		})
		sec.Sections.forEach((subsec, i) => {
			this.walkTypewords(makePath(path, 'Sections', i, subsec.Name), subsec)
		})
	}
}


function parseSection(v: any): sherpadoc.Section {
	checkSection('', v)

	const doc = v as sherpadoc.Section

	const c = new checker()
	c.walkTypeNames('', doc)
	c.walkFunctionNames('', doc)
	c.walkTypewords('', doc)

	return doc
}

function checkSection(path: string, v: any) {
	checkObject(path, v, [
		['Name', 'string'],
		['Docs', 'string'],
		['Functions', 'array'],
		['Sections', 'array'],
		['Structs', 'array'],
		['Ints', 'array'],
		['Strings', 'array'],
	])
	checkEach(path, v, 'Functions', checkFunction)
	checkEach(path, v, 'Sections', checkSection)
	checkEach(path, v, 'Structs', checkStruct)
	checkEach(path, v, 'Ints', checkInts)
	checkEach(path, v, 'Strings', checkStrings)
}

function checkFunction(path: string, v: any) {
	checkObject(path, v, [
		['Name', 'string'],
		['Docs', 'string'],
		['Params', 'array'],
		['Returns', 'array'],
	])
	checkEach(path, v, 'Params', checkArg)
	checkEach(path, v, 'Returns', checkArg)
}

function checkArg(path: string, v: any) {
	checkObject(path, v, [
		['Name', 'string'],
		['Typewords', 'array'],
	])
	// Contents of typewords are checked in a later stage.
	checkEach(path, v, 'Typewords', checkString)
}

function checkStruct(path: string, v: any) {
	checkObject(path, v, [
		['Name', 'string'],
		['Docs', 'string'],
		['Fields', 'array'],
	])
	checkEach(path, v, 'Fields', checkField)
}

function checkField(path: string, v: any) {
	checkObject(path, v, [
		['Name', 'string'],
		['Docs', 'string'],
		['Typewords', 'array'],
	])
	// Contents of typewords are checked in a later stage.
	checkEach(path, v, 'Typewords', checkString)
}

function checkInts(path: string, v: any) {
	checkObject(path, v, [
		['Name', 'string'],
		['Docs', 'string'],
		['Values', 'array'],
	])
	checkEach(path, v, 'Values', checkIntValue)
}

function checkIntValue(path: string, v: any) {
	checkObject(path, v, [
		['Name', 'string'],
		['Value', 'number'],
		['Docs', 'string'],
	])
}

function checkStrings(path: string, v: any) {
	checkObject(path, v, [
		['Name', 'string'],
		['Docs', 'string'],
		['Values', 'array'],
	])
	checkEach(path, v, 'Values', checkStringValue)
}

function checkStringValue(path: string, v: any) {
	checkObject(path, v, [
		['Name', 'string'],
		['Value', 'string'],
		['Docs', 'string'],
	])
}

function parseJSON(v: any): sherpa.JSON {
	checkJSON('', v)
	return v as sherpa.JSON
}

function checkJSON(path: string, v: any) {
	checkObject(path, v, [
		['id', 'string'],
		['title', 'string'],
		['functions', 'array'],
		['baseurl', 'string'],
		['version', 'string'],
		['sherpaVersion', 'number'],
		['sherpadocVersion', 'number'],
	])
	checkEach(path, v, 'functions', checkString)
}
