import { SanityClientConfig, SanityShopifyDocument, SanityPair } from './sanity'
import { State } from 'xstate'
import { ShopifySecrets, Product, Collection, ShopifyItem } from './shopify'

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

export type Operation = SyncOperation | LinkOperation | FetchOperation

export interface SubscriptionCallbacks {
  onProgress?: (
    operation: FetchOperation | SyncOperation | LinkOperation,
    message?: string
  ) => void
  onError?: (err: Error) => void
  onComplete?: (ops: OperationComplete[], message?: string) => void
}
