import { ShopifyClient } from '@sane-shopify/types'
import { testSecrets } from './Provider/utils'

/**
 * Sanity Config
 */

export interface SanityField {
  title: string
  name: string
  type: string
  fields?: [SanityField]
}

export interface SanityDocumentConfig {
  fields?: SanityField[]
  [key: string]: any
}

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
  shopifyClient: ShopifyClient
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

export interface Field {
  jsonType: string
  name: string
  title: string
  options: object
  preview: (arg0: any) => any
  readOnly: boolean
  type: Field
  validation: (arg0: any) => any
}

type PatchEvent = any
type NextPath = any

export interface SanityInputProps {
  level: number
  onBlur: () => void
  onChange: (event: PatchEvent) => void
  onFocus: (nextPath: NextPath) => void
  readOnly?: boolean
  filterField: () => boolean
  type: Field
}
