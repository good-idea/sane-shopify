import { SanityDocument } from '@sanity/client'
import { ShopifyClient, SaneShopifyConfig } from '@sane-shopify/types'

/**
 * Client Context
 */

export interface ClientContextValue {
  secrets: SaneShopifyConfig
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

export interface IResolverProps<
  T extends Record<string, any> = Record<string, any>
> {
  id: string
  type: string
  liveEdit: boolean
  draft?: SanityDocument<T>
  published?: SanityDocument<T>
  onComplete?: () => void
}
