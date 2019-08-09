import { APIGatewayEvent, Context, Handler } from 'aws-lambda'
import { SaneShopifyConfig } from '@sane-shopify/types'
import { createSyncingClient, SyncingClient } from '@sane-shopify/sync-utils'

const eventHandlers = (resolve, reject) => ({
  onComplete: (payload: any) =>
    resolve({
      statusCode: 200,
      body: JSON.stringify(payload)
    }),
  onError: (err: Error) => {
    reject(err)
  }
})

/* Exported for the internal API */
export const createCollectionUpdate = (syncingClient: SyncingClient) => (
  event: APIGatewayEvent,
  context: Context
) =>
  new Promise((resolve, reject) => {
    if (!event.body) return
    const nodeInfo = JSON.parse(event.body)
    const handlers = eventHandlers(resolve, reject)

    syncingClient.syncCollectionByHandle(nodeInfo.handle, handlers)
  })

/* Exported for the module's API */
export const createCollectionUpdateHandler = (config: SaneShopifyConfig) => {
  const syncingClient = createSyncingClient(config)
  return createCollectionUpdate(syncingClient)
}
