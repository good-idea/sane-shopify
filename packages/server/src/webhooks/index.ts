import { Webhooks, WebhooksConfig } from '@sane-shopify/types'
import { createSyncingClient } from '@sane-shopify/sync-utils'
import { syncDocument } from './syncDocument'
import { COLLECTION, PRODUCT } from './constants'

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const noop = (err: Error) => undefined

export const createWebhooks = ({
  config,
  onError: userOnError,
}: WebhooksConfig): Webhooks => {
  if (!config.secrets.sanity.authToken) {
    throw new Error(
      'You must provide a Sanity client auth token to use the Shopify webhooks. If you only want to use the GraphQL Lambda, use `createGraphQLHandler` instead. To find your Auth token, run `sanity debug --secrets`'
    )
  }

  const syncUtils = createSyncingClient(config)
  const onError = userOnError || noop
  const onCollectionCreate = syncDocument({
    syncUtils,
    type: COLLECTION,
    onError,
  })
  const onCollectionUpdate = syncDocument({
    syncUtils,
    type: COLLECTION,
    onError,
  })
  const onCollectionDelete = syncDocument({
    syncUtils,
    type: COLLECTION,
    onError,
  })
  const onProductCreate = syncDocument({
    syncUtils,
    type: PRODUCT,
    onError,
  })
  const onProductUpdate = syncDocument({ syncUtils, type: PRODUCT, onError })
  const onProductDelete = syncDocument({ syncUtils, type: PRODUCT, onError })

  return {
    onCollectionCreate,
    onCollectionUpdate,
    onCollectionDelete,
    onProductCreate,
    onProductUpdate,
    onProductDelete,
  }
}
