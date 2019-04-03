import { testSecrets } from './ClientContext/utils'
import { ShopifyClient } from './ClientContext/shopifyClient'

/**
 * Client Context
 */

export interface Secrets {
	storefrontName: string
	storefrontApiKey: string
}

interface SecretUtils {
	saveSecrets: (Secrets) => Promise<boolean>
	testSecrets: typeof testSecrets
}

export interface ClientContextValue extends SecretUtils {
	secrets: Secrets
	valid: boolean
	ready: boolean
	client: ShopifyClient
}

/**
 * Sanity Types
 */

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
