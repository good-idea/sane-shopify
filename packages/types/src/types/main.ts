import { SanityClientConfig, SanityShopifyDocument, SanityPair } from './sanity'
import { State } from 'xstate'
import {
  ShopifySecrets,
  Product,
  Collection,
  ShopifyItem,
  TestSecretsResponse,
} from './shopify'

export interface Secrets {
  sanity: SanityClientConfig
  shopify: ShopifySecrets
}

export interface SaneShopifyConfig {
  secrets: Secrets
  onStateChange?: (state: SyncState) => void
}

export interface SyncContext {
  documentsFetched: Array<Product | Collection>
  toSync: Array<Product | Collection>
  syncOperations: SyncOperation[]
  toLink: Array<Product | Collection>
  linkOperations: LinkOperation[]
  error: Error | void
  errorMessage: string | void
  valid: boolean
  ready: boolean
  shopName: string | void
}

export type SyncState = State<SyncContext>

export interface SyncUtils {
  initialize: () => void
  initialState: SyncState
  /* Syncs all items */
  syncAll: (cbs?: SubscriptionCallbacks) => Promise<void>
  /* Syncs all products */
  syncProducts: (cbs?: SubscriptionCallbacks) => Promise<void>
  /* Syncs all collections */
  syncCollections: (cbs?: SubscriptionCallbacks) => Promise<void>
  /* Syncs a product by handle*/
  syncProductByHandle: (
    handle: string,
    cbs?: SubscriptionCallbacks
  ) => Promise<any>
  /* Syncs a collection by handle*/
  syncCollectionByHandle: (
    handle: string,
    cbs?: SubscriptionCallbacks
  ) => Promise<any>
  /* Syncs a collection or product by storefront id */
  syncItemByID: (id: string, cbs?: SubscriptionCallbacks) => Promise<void>
  /* Manage Secrets */
  saveSecrets: (secrets: ShopifySecrets) => Promise<void>
  clearSecrets: () => Promise<void>
  testSecrets: (secrets: ShopifySecrets) => Promise<TestSecretsResponse>
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
