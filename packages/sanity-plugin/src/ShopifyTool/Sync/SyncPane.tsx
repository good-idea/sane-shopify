import * as React from 'react'
import { Sync, SyncRenderProps } from './Sync'
const Button = require('part:@sanity/components/buttons/default').default
const Fieldset = require('part:@sanity/components/fieldsets/default').default

interface Props extends SyncRenderProps {}

const SyncPaneBase = ({ loading, fetchedProducts, productsSynced, fetchedCollections, collectionsSynced, syncAll }: Props) => {
  const handleSyncButton = () => syncAll()
  return (
    <Fieldset legend="Sync" level={1}>
      {fetchedCollections.length ? (
        <p>
          synced {collectionsSynced.length}/{fetchedCollections.length} collections
        </p>
      ) : null}
      {productsSynced.length ? (
        <p>
          synced {productsSynced.length}/{fetchedProducts.length} products
        </p>
      ) : null}
      <Button loading={loading} color="primary" onClick={handleSyncButton}>
        Sync from Shopify
      </Button>
    </Fieldset>
  )
}

export const SyncPane = () => <Sync>{(syncProps) => <SyncPaneBase {...syncProps} />}</Sync>
