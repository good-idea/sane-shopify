import { testSecrets } from '../Provider/utils'
import { ShopifyClient } from '../Provider/shopifyClient'
import { Field } from './sanity'

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

export interface ShopifySelectorInputOptions {
	collections: boolean
	products: boolean
}

export interface ShopifyField extends Field {
	options: ShopifySelectorInputOptions
}
