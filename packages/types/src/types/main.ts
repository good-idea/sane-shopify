import { SanityClientConfig, SanityShopifyDocument, SanityPair } from './sanity'
import {
  ShopifySecrets,
  Product,
  Collection,
  ShopifyItem,
  TestSecretsResponse,
  ShopifyUtils,
  ShopifyConfig,
} from './shopify'
import { SyncMachineState } from './syncState'

export interface SaneShopifyConfigDocument extends ShopifySecrets {
  _id: string
  _type: string
}

export type UpdateConfigDocumentArgs = Partial<
  Omit<SaneShopifyConfigDocument, '_id' | '_type'>
>

export interface Secrets {
  sanity: SanityClientConfig
  shopify: ShopifySecrets
}

export interface SaneShopifyConfig {
  secrets: Secrets
  shopifyConfig?: ShopifyConfig
  onStateChange?: (state: SyncMachineState) => void
}

export interface SyncUtils {
  initialize: (secrets: ShopifySecrets) => void
  initialState: SyncMachineState
  /* Syncs all items */
  syncAll: (cbs?: SubscriptionCallbacks) => Promise<void>
  /* Syncs all products */
  syncProducts: (cbs?: SubscriptionCallbacks) => Promise<void>
  /* Syncs all collections */
  syncCollections: (cbs?: SubscriptionCallbacks) => Promise<void>
  /* fetches a collection or product by storefront id */
  fetchItemById: ShopifyUtils['fetchItemById']
  // fetchItemById: (id: string) => Promise<Product | Collection | null>
  /* Syncs a collection or product */
  syncItem: (
    originalId: string,
    item: Product | Collection | null,
    cbs?: SubscriptionCallbacks
  ) => Promise<void>
  /* Syncs a collection or product by storefront id */
  syncItemByID: (id: string, cbs?: SubscriptionCallbacks) => Promise<void>
  /* Manage Secrets */
  saveConfig: (
    shopName: string,
    config: UpdateConfigDocumentArgs
  ) => Promise<void>
  testConfig: (secrets: ShopifySecrets) => Promise<TestSecretsResponse>
  clearConfig: (shopName: string) => Promise<void>
}

export interface SyncOperation {
  type: 'create' | 'update' | 'delete' | 'skip'
  sanityDocument: SanityShopifyDocument
  shopifySource: Product | Collection
}

export interface OperationComplete {
  type: 'complete'
  sanityDocument: SanityShopifyDocument
  shopifySource: Product | Collection
}

interface SyncResult<OperationType> {
  operation: OperationType
  related: ShopifyItem[]
}

export type SyncOperationResult = SyncResult<SyncOperation>

export interface LinkOperation {
  type: 'link'
  sourceDoc: SanityShopifyDocument
  pairs: SanityPair[]
}

export interface FetchOperation {
  type: 'fetched'
  shopifyDocuments: Array<Collection | Product>
}

export interface ArchiveOperation {
  type: 'archive'
  sourceDoc: SanityShopifyDocument
}

export type Operation =
  | SyncOperation
  | LinkOperation
  | FetchOperation
  | ArchiveOperation

export interface SubscriptionCallbacks {
  onProgress?: (operation: Operation, message?: string) => void
  onError?: (err: Error) => void
  onComplete?: (ops: OperationComplete[], message?: string) => void
}
