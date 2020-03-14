import { Product, Collection, ShopifyItem } from './shopify'
import { LinkOperation, SyncOperation } from './main'

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

interface SanityReference {
  _key: string
  _ref: string
  _type: 'reference'
}

interface SanityShopifyDocumentNode extends SanityDocument {
  shopifyId: string
}

export interface SanityShopifyProductDocument
  extends SanityShopifyDocumentNode {
  _type: 'shopifyProduct'
  title: string
  handle: string
  sourceData: Product
  collections: SanityShopifyDocumentNode[]
}

export interface SanityShopifyCollectionDocument
  extends SanityShopifyDocumentNode {
  _type: 'shopifyCollection'
  title: string
  handle: string
  sourceData: Collection
  products: SanityShopifyDocumentNode[]
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
}

export interface SanityUtils {
  syncSanityDocument: (item: Product | Collection) => Promise<SyncOperation>
  syncRelationships: (
    from: SanityShopifyDocument,
    to: SanityShopifyDocument | SanityShopifyDocument[]
  ) => Promise<LinkOperation>
  fetchRelatedDocs: (related: ShopifyItem[]) => Promise<RelatedPairPartial[]>
  fetchAllSanityDocuments: () => Promise<SanityShopifyDocument[]>
  documentByShopifyId: (shopifyId: string) => Promise<SanityShopifyDocument>
}

// TODO: This kept coming up as undefined in the test store..
// export enum OperationType {
//   Create = 'create',
//   Update = 'update',
//   Delete = 'delete',
//   Skip = 'skip',
//   Link = 'link'
// }

export interface SanityClient {
  fetch: <ExpectedResult = SanityDocument | SanityDocument[]>(
    query: string,
    params?: object
  ) => Promise<ExpectedResult>
  createIfNotExists: <ExpectedResult = SanityDocument>(
    doc: SanityDocument
  ) => Promise<ExpectedResult>
  create: <ExpectedResult = SanityDocument>(
    input: object
  ) => Promise<ExpectedResult>
  patch: <ExpectedResult = SanityDocument>(id: string) => Patch<ExpectedResult>
}

export interface RelatedPair {
  shopifyNode: ShopifyItem
  sanityDocument: SanityShopifyDocument
}

export interface RelatedPairPartial {
  shopifyNode: ShopifyItem | null
  sanityDocument: SanityShopifyDocument | null
}
