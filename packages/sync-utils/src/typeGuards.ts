import {
  SanityShopifyDocument,
  SanityShopifyProductDocument,
  SanityShopifyCollectionDocument,
  Product,
  Collection,
} from '@sane-shopify/types'

export const isSanityProduct = (
  doc: Partial<SanityShopifyDocument>
): doc is SanityShopifyProductDocument => doc._type === 'shopifyProduct'

export const isSanityCollection = (
  doc: Partial<SanityShopifyDocument>
): doc is SanityShopifyCollectionDocument => doc._type === 'shopifyCollection'

export const isShopifyProduct = (doc: Product | Collection): doc is Product =>
  doc.__typename === 'Product'

export const isShopifyCollection = (
  doc: Product | Collection
): doc is Collection => doc.__typename === 'Collection'
