import { Webhooks, WebhooksConfig } from '@sane-shopify/types'
import { createSyncingClient } from '@sane-shopify/sync-utils'
import { syncDocument } from './syncDocument'
import { NodeType, OperationType } from './constants'

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const noop = (_: Error) => undefined

export const createWebhooks = (config: WebhooksConfig): Webhooks => {
  if (!config.secrets.sanity.authToken) {
    throw new Error(
      'You must provide a Sanity client auth token to use the Shopify webhooks. If you only want to use the GraphQL Lambda, use `createGraphQLHandler` instead. To find your Auth token, run `sanity debug --secrets`'
    )
  }

  const syncUtils = createSyncingClient(config)
  const onError = config.onError || noop
  const onCollectionCreate = syncDocument({
    syncUtils,
    type: NodeType.Collection,
    onError,
    operationType: OperationType.Create,
  })
  const onCollectionUpdate = syncDocument({
    syncUtils,
    type: NodeType.Collection,
    onError,
    operationType: OperationType.Update,
  })
  const onCollectionDelete = syncDocument({
    syncUtils,
    type: NodeType.Collection,
    onError,
    operationType: OperationType.Delete,
  })
  const onProductCreate = syncDocument({
    syncUtils,
    type: NodeType.Product,
    onError,
    operationType: OperationType.Create,
  })
  const onProductUpdate = syncDocument({
    syncUtils,
    type: NodeType.Product,
    onError,
    operationType: OperationType.Update,
  })
  const onProductDelete = syncDocument({
    syncUtils,
    type: NodeType.Product,
    onError,
    operationType: OperationType.Delete,
  })

  return {
    onCollectionCreate,
    onCollectionUpdate,
    onCollectionDelete,
    onProductCreate,
    onProductUpdate,
    onProductDelete,
  }
}
