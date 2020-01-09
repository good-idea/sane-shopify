import { SanityClientConfig, SanityShopifyDocument, SanityPair } from './sanity'
import {
  ShopifyClientConfig,
  Product,
  Collection,
  ShopifyItem
} from './shopify'

export interface SaneShopifyConfig {
  sanity: SanityClientConfig
  shopify: ShopifyClientConfig
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
