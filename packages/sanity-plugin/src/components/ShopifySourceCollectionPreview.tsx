import * as React from 'react'
import { Collection } from '@sane-shopify/types'
import { Progress } from './Progress'
import { Value } from './shared'
import { Provider, useSaneContext } from '../Provider'

const Button = require('part:@sanity/components/buttons/default').default
const Fieldset = require('part:@sanity/components/fieldsets/default').default

interface ShopifySourceCollectionPreviewProps {
  value: Collection
}

const ShopifySourceCollectionPreviewInner = ({
  value,
}: ShopifySourceCollectionPreviewProps) => {
  const { syncState, syncingClient } = useSaneContext()
  if (!syncState) return null
  const { value: syncStateValue } = syncState
  if (!value) return null

  const syncCollectionByHandle = syncingClient
    ? syncingClient.syncCollectionByHandle
    : () => undefined
  const { title, handle, description } = value

  const reSync = async () => {
    syncCollectionByHandle(handle)
  }

  if (syncState.context.error)
    return (
      <p style={{ color: 'red' }}>
        Sane Shopify has not been configured, or the keys need to be updated.
        Navigate to the Shopify tab to update your configuration.
      </p>
    )

  const buttonDisabled =
    syncStateValue === 'complete' || syncStateValue === 'sync'

  return (
    <Fieldset
      legend="Shopify Source Data"
      description="Read-only. Synced from product data in Shopify"
    >
      <Value label="Title" value={title} />
      <hr />
      <Value label="Description" value={description} />
      <hr />
      <Button color="primary" disabled={buttonDisabled} onClick={reSync}>
        Sync from Shopify
      </Button>
      <Progress />
    </Fieldset>
  )
}

export class ShopifySourceCollectionPreview extends React.Component<
  ShopifySourceCollectionPreviewProps
> {
  render() {
    return (
      <Provider>
        <ShopifySourceCollectionPreviewInner {...this.props} />
      </Provider>
    )
  }
}
