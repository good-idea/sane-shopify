interface FieldType {
	jsonType: string
	name: string
	title: string
	preview: (arg0: any) => any
	readOnly: boolean
	type: FieldType
	validation: (arg0: any) => any
	options: any
}

interface Field {
	name: string
	fieldset?: any
	type: FieldType
}

export interface SanityInputProps {
	level: number
	onBlur: () => void
	onChange: (PatchEvent) => void
	onFocus: (NextPath) => void
	readOnly?: boolean
	filterField: () => boolean
	type: FieldType
}
