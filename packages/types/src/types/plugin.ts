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

export interface SaneShopifyPluginConfig {
  product?: SanityDocumentConfig
  productVariant?: SanityDocumentConfig
  productOption?: SanityDocumentConfig
  productOptionValue?: SanityDocumentConfig
  collection?: SanityDocumentConfig
}
