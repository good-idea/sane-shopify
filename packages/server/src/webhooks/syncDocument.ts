import {
  SyncUtils,
  ProductOrCollectionWebhookData,
  Collection,
  Product,
} from '@sane-shopify/types'
import { NodeType, OperationType } from './constants'
import { log, getStorefrontId } from './utils'

interface SyncDocumentConfig {
  syncUtils: SyncUtils
  type: typeof NodeType.Collection | typeof NodeType.Product
  onError: (err: Error) => void
  operationType: OperationType
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const syncDocument =
  ({ syncUtils, type, onError, operationType }: SyncDocumentConfig) =>
  async ({ id, updated_at }: ProductOrCollectionWebhookData): Promise<void> => {
    const docType =
      type === NodeType.Collection
        ? 'Collection'
        : type === NodeType.Product
        ? 'Product'
        : null
    if (!id) {
      throw new Error('You must supply an ID')
    }
    if (!docType) {
      throw new Error(`Cannot sync document ${id} of type ${type}`)
    }

    const storefrontId = getStorefrontId(id, docType)
    try {
      /**
       * Sometimes the graphql response is stale and does not reflect the changes
       * that triggered the webhook.
       * If the GraphQL item has an updatedAt that is less
       * recent than updated_at from the webhook body,
       * wait ten seconds and try again.
       */

      await sleep(10000)
      const fetchUpToDateItem = async (
        retries = 0
      ): Promise<Collection | Product | null> => {
        if (retries >= 5) {
          throw new Error(
            `Could not fetch up to date item after 5 retries (shopifyId: ${id} storefrontId: ${storefrontId})`
          )
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

      /**
       * If we are deleting, then dont' try to fetch the up to date item
       */

      if (operationType === OperationType.Delete) {
        await syncUtils.syncItemByID(storefrontId)
      } else {
        const shopifyItem = await fetchUpToDateItem()
        await syncUtils.syncItem(storefrontId, shopifyItem)
      }

      log(`[${operationType}] Synced item ${storefrontId} (/${docType}/${id})`)
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error(
              `Failed to ${operationType} item ${storefrontId} (/${docType}/${id})`
            )

      log(`Failed to ${operationType} item ${storefrontId} (/${docType}/${id})`)
      log(error)
      onError(error)
    }
  }
