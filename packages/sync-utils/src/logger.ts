import {
  Product,
  Collection,
  SubscriptionCallbacks,
  SanityShopifyDocument,
  SyncOperation,
  SanityPair,
  OperationComplete,
} from '@sane-shopify/types'
import Debug from 'debug'

const log = Debug('sane-shopify:log')

export interface Logger {
  logFetched: (
    fetchedItems: Product | Collection | Array<Product | Collection>
  ) => void
  logSynced: (op: SyncOperation) => void
  logLinked: (sourceDoc: SanityShopifyDocument, pairs: SanityPair[]) => void
  logComplete: (op: OperationComplete | OperationComplete[]) => void
  logArchived: (sourceDoc: SanityShopifyDocument) => void
}

export const createLogger = (cbs: SubscriptionCallbacks = {}): Logger => {
  // Log when items have been initially fetched from Shopify
  const logFetched = (
    fetchedItems: Product | Collection | Array<Product | Collection>
  ) => {
    const shopifyDocuments = Array.isArray(fetchedItems)
      ? fetchedItems
      : [fetchedItems]
    log('fetched initial shopify documents:', shopifyDocuments)
    cbs.onProgress &&
      cbs.onProgress({
        type: 'fetched',
        shopifyDocuments,
      })
  }

  const logSynced = (op: SyncOperation) => {
    log('synced document', op)
    cbs.onProgress && cbs.onProgress(op)
  }

  const logLinked = (sourceDoc: SanityShopifyDocument, pairs: SanityPair[]) => {
    log('linked documents:', pairs)
    cbs.onProgress &&
      cbs.onProgress({
        type: 'link',
        sourceDoc,
        pairs,
      })
  }

  const logArchived = (sourceDoc: SanityShopifyDocument) => {
    log('archived document:', sourceDoc)
    cbs.onProgress &&
      cbs.onProgress({
        type: 'archive',
        sourceDoc,
      })
  }

  const logComplete = (op: OperationComplete | OperationComplete[]) => {
    log('completed sync operations', op)
    const ops = Array.isArray(op) ? op : [op]
    cbs.onComplete && cbs.onComplete(ops, 'completed sync operations')
  }

  return { logFetched, logLinked, logSynced, logComplete, logArchived }
}
