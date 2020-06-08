import { SanityClient as _SanityClient } from '@sanity/client'
import {
  Product,
  Collection,
  ShopifyItem,
  Variant,
  ShopifySecrets,
} from './shopify'
import { LinkOperation, SyncOperation } from './main'

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

export interface SanityDocument {
  _id: string
  _type: string
  [key: string]: any
}

export type SanityArray<T> = Array<T & { _key: string }>

interface SanityReference {
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

interface SanityShopifyProductOptionValue {
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
  minVariantPrice: number
  maxVariantPrice: number
  sourceData: Product
  collections: SanityShopifyCollectionDocument[]
  collectionKeys?: string[]
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
  productKeys?: string[]
}

export type SanityShopifyDocument =
  | SanityShopifyProductDocument
  | SanityShopifyCollectionDocument

interface Patch<ExpectedResult = any> {
  set: (
    document: object
  ) => {
    commit: () => Promise<ExpectedResult>
  }
  unset: (
    document: object
  ) => {
    commit: () => Promise<ExpectedResult>
  }
}

export interface SanityFetchParams {
  types?: string[]
}

export interface SanityUtils {
  syncSanityDocument: (item: Product | Collection) => Promise<SyncOperation>
  syncRelationships: (
    from: SanityShopifyDocument,
    to: SanityShopifyDocument | SanityShopifyDocument[]
  ) => Promise<LinkOperation>
  removeRelationships: (
    from: SanityShopifyDocument,
    toRemove: SanityShopifyDocument | SanityShopifyDocument[]
  ) => Promise<null>
  fetchRelatedDocs: (related: ShopifyItem[]) => Promise<RelatedPairPartial[]>
  fetchAllSanityDocuments: (
    params?: SanityFetchParams
  ) => Promise<SanityShopifyDocument[]>
  documentByShopifyId: (shopifyId: string) => Promise<SanityShopifyDocument>
  documentByHandle: (
    handle: string,
    type: string
  ) => Promise<SanityShopifyDocument>
  archiveSanityDocument: (
    doc: SanityShopifyDocument
  ) => Promise<SanityShopifyDocument>
  saveSecrets: (secrets: ShopifySecrets) => Promise<void>
  clearSecrets: () => Promise<void>
  fetchSecrets: () => Promise<ShopifySecrets>
}

// TODO: This kept coming up as undefined in the test store..
// export enum OperationType {
//   Create = 'create',
//   Update = 'update',
//   Delete = 'delete',
//   Skip = 'skip',
//   Link = 'link'
// }

export interface RelatedPair {
  shopifyNode: ShopifyItem
  sanityDocument: SanityShopifyDocument
}

export interface RelatedPairPartial {
  shopifyNode: ShopifyItem | null
  sanityDocument: SanityShopifyDocument | null
}
