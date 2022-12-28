import {
  SyncUtils,
  OrderWebhookData,
  Collection,
  Product,
} from '@sane-shopify/types'
import { OperationType } from './constants'
import { log, getStorefrontId } from './utils'

interface SyncOrderConfig {
  syncUtils: SyncUtils
  onError: (err: Error) => void
  operationType: OperationType
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const syncOrder =
  ({ syncUtils, onError, operationType }: SyncOrderConfig) =>
  async ({ updated_at, line_items }: OrderWebhookData): Promise<void> => {
    /* Let the GraphQL Response catch up before we try to fetch the latest info */
    await sleep(4000)
    /**
     * Sometimes the graphql response is stale.
     * If the GraphQL item has an updatedAt that is less
     * recent than updated_at from the webhook body,
     * wait a few seconds and try again.
     */

    const fetchUpToDateItem = async (
      storefrontId: string,
      retries = 0
    ): Promise<Collection | Product | null> => {
      if (retries >= 5) {
        throw new Error('Could not fetch up to date item after 5 retries')
      }
      const item = await syncUtils.fetchItemById(storefrontId, true)
      if (!item) return null

      if (
        new Date(item.updatedAt).getTime() <
        new Date(updated_at).getTime() + 3 * 60 * 1000
      ) {
        log(
          `GraphQL response was out of date. Waiting to try again... Attempt #${retries}`
        )
        const additionalWait = retries * 1000
        await sleep(3000 + additionalWait)
        return fetchUpToDateItem(storefrontId, retries + 1)
      }
      return item
    }

    await Promise.all(
      line_items.map(async (product) => {
        const storefrontId = getStorefrontId(product.id, 'Product')
        try {
          fetchUpToDateItem(storefrontId)
          await syncUtils.syncItemByID(storefrontId)

          log(
            `[${operationType}] Synced item ${storefrontId} (/Product/${storefrontId})`
          )
        } catch (err) {
          const error =
            err instanceof Error
              ? err
              : new Error(
                  `Failed to ${operationType} item ${storefrontId} (/Product/${storefrontId})`
                )
          log(
            `Failed to ${operationType} item ${storefrontId} (/Product/${storefrontId})`
          )
          log(error)
          onError(error)
        }
      })
    )
  }
