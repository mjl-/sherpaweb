import * as dom from '../dom'
import * as looks from './looks'

export interface Focuser {
	focus(): void
}

export type UI = dom.Rooter & Focuser

export type StateWord = (string | StateArray)
export type State = StateWord[]
export interface StateArray extends Array<StateWord> { }

// Most UIs are "Staters": they can load a state and return their current state.
// The state comes from the location.hash. UIs that deal with state should call StateSaver.saveState when their state has changed.
export interface Stater {
	loadState: (state: State) => Promise<void>	// Called (at most) once, usually right after creation of the UI. The promise must always resolve, after any child UIs have resolved.
	currentState: () => State	// Return current state, including state of the children.
}

export interface StateSaver {
	// UIs must call this function after user interaction. eg after selecting a new item from the list, opening a different tab.
	// But only if those interactions cause the state to change.
	saveState: () => void
}

export interface Saver {
	save: (spinBox: HTMLElement, disabler: { disabled: boolean } | null, msg: string, fn: () => Promise<void>) => void
}

export interface Loader {
	load: (elem: HTMLElement, fn: () => [Aborter, Promise<HTMLElement[]>], loaded?: () => void) => void
}

export interface Looker {
	looks: looks.Looks
	ensureLooks: (className: string, ...styles: (looks.Style | dom.CSSProperties)[]) => looks.Style
	copyLooks: (className: string, ...styles: (looks.Style | dom.CSSProperties)[]) => looks.Style
}

export interface Aborter {
	abort?: () => void
}
