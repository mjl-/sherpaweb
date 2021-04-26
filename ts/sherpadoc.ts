// NOTE: code below is shared between github.com/mjl-/sherpaweb and github.com/mjl-/sherpats.
// KEEP IN SYNC.

export const supportedSherpaVersion = 1

export function isStruct(t: NamedType): t is Struct {
	return 'Fields' in t
}

export function isStrings(t: NamedType): t is Strings {
	return 'Values' in t && typeof t.Values[0].Value === 'string'
}

export function isInts(t: NamedType): t is Ints {
	return 'Values' in t && typeof t.Values[0].Value === 'number'
}

export interface Section {
	Name: string
	Docs: string
	Functions: Function[]
	Sections: Section[]
	Structs: Struct[]
	Ints: Ints[]
	Strings: Strings[]
	Version: string // only for top-level section
	SherpaVersion: number // only for top-level section
	SherpadocVersion: number // only for top-level section
}

export interface Function {
	Name: string
	Docs: string
	Params: Arg[]
	Returns: Arg[]
}

export interface Arg {
	Name: string
	Typewords: string[]
}

export interface Struct {
	Name: string
	Docs: string
	Fields: Field[]
}

export interface Field {
	Name: string
	Docs: string
	Typewords: string[]
}

export interface Ints {
	Name: string
	Docs: string
	Values: {
		Name: string
		Value: number
		Docs: string
	}[]
}

export interface Strings {
	Name: string
	Docs: string
	Values: {
		Name: string
		Value: string
		Docs: string
	}[]
}

export type NamedType = Struct | Strings | Ints
export type TypenameMap = { [k: string]: NamedType }

// verifyArg typechecks "v" against "typewords", returning a new (possibly modified) value for JSON-encoding.
// toJS indicate if the data is coming into JS. If so, timestamps are turned into JS Dates. Otherwise, JS Dates are turned into strings.
// allowUnknownKeys configures whether unknown keys in structs are allowed.
// types are the named types of the API.
export const verifyArg = (path: string, v: any, typewords: string[], toJS: boolean, allowUnknownKeys: boolean, types: TypenameMap): any => {
	return new verifier(types, toJS, allowUnknownKeys).verify(path, v, typewords)
}

class verifier {
	constructor(private types: TypenameMap, private toJS: boolean, private allowUnknownKeys: boolean) {
	}

	verify(path: string, v: any, typewords: string[]): any {
		typewords = typewords.slice(0)
		const ww = typewords.shift()

		const error = (msg: string) => {
			if (path != '') {
				msg = path + ': ' + msg
			}
			throw new Error(msg)
		}

		if (typeof ww !== 'string') {
			error('bad typewords')
			return // should not be necessary, typescript doesn't see error always throws an exception?
		}
		const w: string = ww

		const ensure = (ok: boolean, expect: string): any => {
			if (!ok) {
				error('got ' + JSON.stringify(v) +  ', expected ' + expect)
			}
			return v
		}

		switch (w) {
		case 'nullable':
			if (v === null || v === undefined) {
				return null
			}
			return this.verify(path, v, typewords)
		case '[]':
			ensure(Array.isArray(v), "array")
			return v.map((e: any, i: number) => this.verify(path + '[' + i + ']', e, typewords))
		case '{}':
			ensure(v !== null || typeof v === 'object', "object")
			const r: any = {}
			for (const k in v) {
				r[k] = this.verify(path + '.' + k, v[k], typewords)
			}
			return r
		}

		ensure(typewords.length == 0, "empty typewords")
		const t = typeof v
		switch (w) {
		case 'any':
			return v
		case 'bool':
			ensure(t === 'boolean', 'bool')
			return v
		case 'int8':
		case 'uint8':
		case 'int16':
		case 'uint16':
		case 'int32':
		case 'uint32':
		case 'int64':
		case 'uint64':
			ensure(t === 'number' && Number.isInteger(v), 'integer')
			return v
		case 'float32':
		case 'float64':
			ensure(t === 'number', 'float')
			return v
		case 'int64s':
		case 'uint64s':
			ensure(t === 'number' && Number.isInteger(v) || t === 'string', 'integer fitting in float without precision loss, or string')
			return '' + v
		case 'string':
			ensure(t === 'string', 'string')
			return v
		case 'timestamp':
			if (this.toJS) {
				ensure(t === 'string', 'string, with timestamp')
				const d = new Date(v)
				if (d instanceof Date && !isNaN(d.getTime())) {
					return d
				}
				error('invalid date ' + v)
			} else {
				ensure(t === 'object' && v !== null, 'non-null object')
				ensure(v.__proto__ === Date.prototype, 'Date')
				return v.toISOString()
			}
		}

		// We're left with named types.
		const nt = this.types[w]
		if (!nt) {
			error('unknown type ' + w)
		}
		if (v === null || v === undefined) {
			error('bad value ' + v + ' for named type ' + w)
		}

		if (isStruct(nt)) {
			if (typeof v !== 'object') {
				error('bad value ' + v + ' for struct ' + w)
			}

			const r: any = {}
			for (const f of nt.Fields) {
				r[f.Name] = this.verify(path + '.' + f.Name, v[f.Name], f.Typewords)
			}
			// If going to JSON also verify no unknown fields are present.
			if (!this.allowUnknownKeys) {
				const known: { [key: string]: boolean } = {}
				for (const f of nt.Fields) {
					known[f.Name] = true
				}
				Object.keys(v).forEach((k) => {
					if (!known[k]) {
						error('unknown key ' + k + ' for struct ' + w)
					}
				})
			}
			return r
		} else if (isStrings(nt)) {
			if (typeof v !== 'string') {
				error('mistyped value ' + v + ' for named strings ' + nt.Name)
			}
			for (const sv of nt.Values) {
				if (sv.Value === v) {
					return v
				}
			}
			error('unknkown value ' + v + ' for named strings ' + nt.Name)
		} else if (isInts(nt)) {
			if (typeof v !== 'number' || !Number.isInteger(v)) {
				error('mistyped value ' + v + ' for named ints ' + nt.Name)
			}
			for (const sv of nt.Values) {
				if (sv.Value === v) {
					return v
				}
			}
			error('unknkown value ' + v + ' for named ints ' + nt.Name)
		} else {
			throw new Error('unexpected named type ' + nt)
		}
	}
}
