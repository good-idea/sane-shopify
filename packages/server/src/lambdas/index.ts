import { Handler, APIGatewayEvent } from 'aws-lambda'
import { SaneShopifyConfig } from '@sane-shopify/types'
import { createSyncingClient } from '@sane-shopify/sync-utils'

interface SaneLambdas {
  productCreate: Handler
  productUpdate: Handler
  productDelete: Handler
  collectionCreate: Handler
  collectionUpdate: Handler
  collectionDelete: Handler
}

const createEventHandlers = (resolve, reject) => ({
  onComplete: (payload: any) =>
    resolve({
      statusCode: 200,
      body: JSON.stringify(payload),
    }),
  onError: (err: Error) => {
    reject(err)
  },
})

export const createLambdas = (config: SaneShopifyConfig): SaneLambdas => {
  if (!config.secrets.sanity.authToken)
    throw new Error(
      'You must provide a Sanity client auth token to use the Shopify webhooks. If you only want to use the GraphQL Lambda, use `createGraphQLHandler` instead. To find your Auth token, run `sanity debug --secrets`'
    )
  const client = createSyncingClient(config)

  const productCreateOrUpdate = (event: APIGatewayEvent) =>
    new Promise((resolve, reject) => {
      if (!event.body) {
        resolve()
        return
      }
      const nodeInfo = JSON.parse(event.body)
      const { handle } = nodeInfo

      if (!handle) {
        resolve()
        return
      }

      const handlers = createEventHandlers(resolve, reject)
      client.syncProductByHandle(handle, handlers)
    })

  const productDelete = async (event: APIGatewayEvent) => {
    throw new Error('not yet implemented')
  }

  const collectionCreateOrUpdate = (event: APIGatewayEvent) =>
    new Promise((resolve, reject) => {
      if (!event.body) {
        resolve()
        return
      }
      const nodeInfo = JSON.parse(event.body)
      const { handle } = nodeInfo

      if (!handle) {
        resolve()
        return
      }

      const handlers = createEventHandlers(resolve, reject)
      client.syncCollectionByHandle(handle, handlers)
    })

  const collectionDelete = async (event: APIGatewayEvent) => {
    throw new Error('not yet implemented')
  }

  return {
    productDelete,
    collectionDelete,
    productCreate: productCreateOrUpdate,
    productUpdate: productCreateOrUpdate,
    collectionCreate: collectionCreateOrUpdate,
    collectionUpdate: collectionCreateOrUpdate,
  }
}
