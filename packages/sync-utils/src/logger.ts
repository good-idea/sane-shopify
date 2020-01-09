import {
  Product,
  Collection,
  SubscriptionCallbacks,
  SyncOperation,
  SanityPair,
  OperationComplete
} from '@sane-shopify/types'
import Debug from 'debug'

const log = Debug('sane-shopify')

interface Logger {
  logFetched: (
    fetchedItems: Product | Collection | Array<Product | Collection>
  ) => void
  logSynced: (op: SyncOperation) => void
  logLinked: (pairs: SanityPair[]) => void
  logComplete: (op: OperationComplete | OperationComplete[]) => void
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
    cbs.onProgress({
      type: 'fetched',
      shopifyDocuments
    })
  }

  const logSynced = (op: SyncOperation) => {
    log('synced document', op)
    cbs.onProgress(op)
  }

  const logLinked = (pairs: SanityPair[]) => {
    log('linked documents:', pairs)
    cbs.onProgress({
      type: 'link',
      pairs
    })
  }

  const logComplete = (op: OperationComplete | OperationComplete[]) => {
    log('completed sync operations', op)
    const ops = Array.isArray(op) ? op : [op]
    cbs.onComplete(ops, 'completed sync operations')
  }

  return { logFetched, logLinked, logSynced, logComplete }
}
