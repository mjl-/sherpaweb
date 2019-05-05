export const supportedSherpaVersion = 1

export type NamedType = Struct | Strings | Ints

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
