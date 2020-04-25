import * as React from 'react'
import { unwindEdges } from '@good-idea/unwind-edges'
import { Product } from '@sane-shopify/types'
import { Progress } from './Progress'
import { Value } from './shared'
import { Provider, useSaneContext } from '../Provider'

const Button = require('part:@sanity/components/buttons/default').default
const Fieldset = require('part:@sanity/components/fieldsets/default').default

interface ShopifySourceProductPreviewProps {
  value: Product
}

const ShopifySourceProductPreviewInner = ({
  value,
}: ShopifySourceProductPreviewProps) => {
  const { syncState, syncingClient } = useSaneContext()
  if (!syncState) return null
  const { value: syncStateValue } = syncState
  if (!value) return null

  const syncProductByHandle = syncingClient
    ? syncingClient.syncProductByHandle
    : () => undefined
  const {
    title,
    handle,
    tags,
    productType,
    availableForSale,
    description,
    variants: paginatedVariants,
  } = value
  const [variants] = unwindEdges(paginatedVariants)
  const variantsValue = `${variants.length} variant${
    variants.length === 1 ? '' : 's'
  }`

  const reSync = async () => {
    syncProductByHandle(handle)
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
      {tags.length ? <Value label="Tags" value={tags.join(', ')} /> : null}
      {productType ? <Value label="Product Type" value={productType} /> : null}
      <Value label="Available" value={availableForSale ? 'Yes ✅' : 'No 🚫'} />
      <Value label="Variants" value={variantsValue} />
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

export class ShopifySourceProductPreview extends React.Component<
  ShopifySourceProductPreviewProps
> {
  render() {
    return (
      <Provider>
        <ShopifySourceProductPreviewInner {...this.props} />
      </Provider>
    )
  }
}
