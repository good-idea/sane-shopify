import * as React from 'react'
import { Sync, SyncRenderProps } from './Sync'

/* tslint:disable */
const Button = require('part:@sanity/components/buttons/default').default
const Fieldset = require('part:@sanity/components/fieldsets/default').default
/* tslint:enable */

const SyncPaneBase = ({
  syncState,
  fetchedProducts,
  productsSynced,
  fetchedCollections,
  collectionsSynced,
  syncAll
}: SyncRenderProps) => {
  const handleSyncButton = () => syncAll()
  return (
    <Fieldset legend="Sync" level={1}>
      {fetchedCollections.length ? (
        <p>
          synced {collectionsSynced.length}/{fetchedCollections.length}{' '}
          collections
        </p>
      ) : null}
      {fetchedProducts.length ? (
        <p>
          synced {productsSynced.length}/{fetchedProducts.length} products
        </p>
      ) : null}
      {syncState === 'complete' ? (
        <p>
          Syncing complete! <span aria-label="Party Emoji">🎉</span>
        </p>
      ) : null}
      {syncState === 'syncing' ? (
        <p>
          This will take a few minutes. Do not navigate away from this tab until
          syncing is complete.
        </p>
      ) : null}
      <Button
        loading={syncState === 'syncing'}
        disabled={syncState === 'complete'}
        color="primary"
        onClick={handleSyncButton}
      >
        Sync from Shopify
      </Button>
    </Fieldset>
  )
}

export const SyncPane = () => (
  <Sync>{(syncProps) => <SyncPaneBase {...syncProps} />}</Sync>
)
