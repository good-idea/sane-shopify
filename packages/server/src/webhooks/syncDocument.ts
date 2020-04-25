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
  await syncUtils.syncItemByID(storefrontId).catch((err) => {
    log(err)
    onError(err)
  })
  log(`synced item ${storefrontId}`)
}
