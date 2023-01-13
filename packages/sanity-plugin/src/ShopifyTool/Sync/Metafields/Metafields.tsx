import * as React from 'react'

import { definitely } from '@sane-shopify/sync-utils'

import { SyncPaneSection } from '../../../components/SyncPaneSection'
import { useSaneContext } from '../../../Provider'
import { MetafieldGroup } from './MetafieldGroup'

export const Metafields: React.FC = () => {
  const context = useSaneContext()
  const productMetafields = definitely(context.config?.products?.metafields)
  const productVariantMetafields = definitely(
    context.config?.variants?.metafields
  )
  const collectionMetafields = definitely(
    context.config?.collections?.metafields
  )
  return (
    <SyncPaneSection
      title="Metafields"
      key={context.config?._updatedAt}
      description="Configure which metafields should be fetched from your Shopify data. This configuration will also be used in any webhooks."
    >
      <MetafieldGroup
        title="Product metafields"
        type="products"
        metafields={productMetafields}
      />
      <MetafieldGroup
        title="Product variant metafields"
        type="variants"
        metafields={productVariantMetafields}
      />
      <MetafieldGroup
        title="Collection metafields"
        type="collections"
        metafields={collectionMetafields}
      />
    </SyncPaneSection>
  )
}
