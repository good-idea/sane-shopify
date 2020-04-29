import { SyncUtils, WebhookData } from '@sane-shopify/types'
import { COLLECTION, PRODUCT } from './constants'
import { log, btoa } from './utils'

interface SyncDocumentConfig {
  syncUtils: SyncUtils
  type: typeof COLLECTION | typeof PRODUCT
  onError: (err: Error) => void
}

export const syncDocument = ({
  syncUtils,
  type,
  onError,
}: SyncDocumentConfig) => async ({ id }: WebhookData) => {
  const docType =
    type === COLLECTION ? 'Collection' : type === PRODUCT ? 'Product' : null
  if (!docType) {
    throw new Error(`Cannot sync document of type ${type}`)
  }
  const storefrontId = btoa(`gid://shopify/${docType}/${id}`)
  try {
    await syncUtils.syncItemByID(storefrontId)
    log(`synced item ${storefrontId} (/${docType}/${id})`)
  } catch (err) {
    log(`failed to sync item ${storefrontId} (/${docType}/${id})`)
    log(err)
    onError(err)
  }
}
