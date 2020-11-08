import { SanityClient as _SanityClient } from '@sanity/client'
import { Product, Collection, ShopifyItem, Variant } from './shopify'

export type SanityClient = _SanityClient

export interface SanityPair {
  from: SanityShopifyDocument
  to: SanityShopifyDocument
}

/**
 * Types that are shared between the plugin, the hooks server, and the syncing client.
 *
 * Types for the Sanity Desk Tool should go in the sanity-plugin directory.
 */
export interface SanityClientConfig {
  projectId: string
  dataset: string
  authToken?: string
}

export enum SaneShopifyDocumentType {
  Product = 'shopifyProduct',
  Collection = 'shopifyCollection',
}

export interface SanityDocument {
  _id: string
  _type: SaneShopifyDocumentType
  [key: string]: any
}

export type SanityArray<T> = Array<T & { _key: string }>

export interface SanityReference {
  _key: string
  _ref: string
  _type: 'reference'
}

export type SanityShopifyDocumentPartial =
  | SanityShopifyProductDocumentPartial
  | SanityShopifyCollectionDocumentPartial

export type SanityShopifyProductDocumentPartial = Omit<
  SanityShopifyProductDocument,
  '_id' | 'collections'
>
export type SanityShopifyCollectionDocumentPartial = Omit<
  SanityShopifyCollectionDocument,
  '_id' | 'products'
>

export interface SanityShopifyProductOptionValue {
  _key: string
  value: string
}

export interface SanityShopifyProductOption {
  shopifyOptionId: string
  name: string
  values: SanityArray<SanityShopifyProductOptionValue>
}

export interface SanityShopifyProductVariant {
  shopifyVariantID: string
  title: string
  sourceData: Variant
}

export interface SanityShopifyProductDocument {
  _id: string
  _rev?: string
  _type: string
  _ref?: string
  _key?: string
  shopifyId: string
  title: string
  handle: string
  archived?: boolean
  minVariantPrice?: number
  maxVariantPrice?: number
  sourceData: Product
  collections: SanityShopifyCollectionDocument[]
  collectionKeys?: SanityReference[]
  options: SanityArray<SanityShopifyProductOption>
  variants: SanityArray<SanityShopifyProductVariant>
}

export interface SanityShopifyCollectionDocument {
  _id: string
  _rev?: string
  _type: string
  _ref?: string
  _key?: string
  shopifyId: string
  title: string
  handle: string
  archived?: boolean
  sourceData: Collection
  products: SanityShopifyProductDocument[]
  productKeys?: SanityReference[]
}

export type SanityShopifyDocument =
  | SanityShopifyProductDocument
  | SanityShopifyCollectionDocument

export interface SanityFetchParams {
  types?: string[]
}

export interface RelatedPair {
  shopifyNode: ShopifyItem
  sanityDocument: SanityShopifyDocument
}

export interface RelatedPairPartial {
  shopifyNode: ShopifyItem | null
  sanityDocument: SanityShopifyDocument | null
}
