export interface Field {
	jsonType: string
	name: string
	title: string
	preview: (arg0: any) => any
	readOnly: boolean
	type: Field
	validation: (arg0: any) => any
}

export interface SanityInputProps {
	level: number
	onBlur: () => void
	onChange: (PatchEvent) => void
	onFocus: (NextPath) => void
	readOnly?: boolean
	filterField: () => boolean
	type: Field
}
