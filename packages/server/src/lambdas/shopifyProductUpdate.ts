import { APIGatewayEvent, Context, Handler } from 'aws-lambda'
import { SaneShopifyConfig } from '@sane-shopify/types'
import { createSyncingClient, SyncingClient } from '@sane-shopify/sync-utils'

/* Exported for the internal API */
export const createProductUpdate = (syncingClient: SyncingClient) => (
  event: APIGatewayEvent,
  context: Context
) =>
  new Promise((resolve, reject) => {
    if (!event.body) return
    const nodeInfo = JSON.parse(event.body)
    const handlers = eventHandlers(resolve, reject)

    syncingClient.syncProductByHandle(nodeInfo.handle, handlers)
  })

/* Exported for the module's API */
export const createProductUpdateHandler = (config: SaneShopifyConfig) => {
  const syncingClient = createSyncingClient(config)
  return createProductUpdate(syncingClient)
}
