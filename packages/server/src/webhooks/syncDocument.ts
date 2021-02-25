import {
  SyncUtils,
  WebhookData,
  Collection,
  Product,
} from '@sane-shopify/types'
import { COLLECTION, PRODUCT } from './constants'
import { log, btoa } from './utils'

interface SyncDocumentConfig {
  syncUtils: SyncUtils
  type: typeof COLLECTION | typeof PRODUCT
  onError: (err: Error) => void
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const syncDocument = ({
  syncUtils,
  type,
  onError,
}: SyncDocumentConfig) => async ({
  id,
  updated_at,
}: WebhookData): Promise<void> => {
  const docType =
    type === COLLECTION ? 'Collection' : type === PRODUCT ? 'Product' : null
  if (!docType) {
    throw new Error(`Cannot sync document of type ${type}`)
  }
  /* Let the GraphQL Response catch up before we try to fetch the latest info */
  await sleep(10000)
  const storefrontId = btoa(`gid://shopify/${docType}/${id}`)
  try {
    /**
     * Sometimes the graphql response is stale.
     * If the GraphQL item has an updatedAt that is less
     * recent than updated_at from the webhook body,
     * wait a few seconds and try again.
     */

    const fetchUpToDateItem = async (
      retries = 0
    ): Promise<Collection | Product | null> => {
      if (retries >= 5) {
        throw new Error('Could not fetch up to date item after 5 retries')
      }
      const item = await syncUtils.fetchItemById(storefrontId, true)
      if (!item) return null

      if (new Date(item.updatedAt) < new Date(updated_at)) {
        log(
          `GraphQL response was out of date. Waiting to try again... Attempt #${retries}`
        )
        const additionalWait = retries * 1000
        await sleep(3000 + additionalWait)
        return fetchUpToDateItem(retries + 1)
      }
      return item
    }

    const shopifyItem = await fetchUpToDateItem()
    if (!shopifyItem) {
      await syncUtils.syncItemByID(storefrontId)
    } else {
      await syncUtils.syncItem(storefrontId, shopifyItem)
    }

    log(`synced item ${storefrontId} (/${docType}/${id})`)
  } catch (err) {
    log(`failed to sync item ${storefrontId} (/${docType}/${id})`)
    log(err)
    onError(err)
  }
}
