import * as React from 'react'
import { Sync, SyncRenderProps } from './Sync'
import Button from 'part:@sanity/components/buttons/default'
import Fieldset from 'part:@sanity/components/fieldsets/default'

interface Props extends SyncRenderProps {}

const SyncPaneBase = ({ loading, fetchedProducts, productsSynced, fetchedCollections, collectionsSynced, syncAll }: Props) => {
  const handleSyncButton = () => syncAll()
  if (loading) return <p>'Loading...'</p>

  return (
    <Fieldset legend="Sync" level={1}>
      {fetchedCollections.length ? (
        <p>
          synced {collectionsSynced.length}/{fetchedCollections.length} products
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
