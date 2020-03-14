import * as React from 'react'
import { Sync, SyncRenderProps } from './Sync'
import { Progress } from '../../components/Progress'

const Button = require('part:@sanity/components/buttons/default').default
const Fieldset = require('part:@sanity/components/fieldsets/default').default

const SyncPaneBase = ({ syncState, syncAll }: SyncRenderProps) => {
  const handleSyncButton = () => syncAll()
  return (
    <Fieldset legend="Sync" level={1}>
      <Button
        loading={syncState === 'syncing'}
        disabled={syncState === 'complete'}
        color="primary"
        onClick={handleSyncButton}
      >
        Sync from Shopify
      </Button>
      <Progress />
    </Fieldset>
  )
}

export const SyncPane = () => (
  <Sync>{(syncProps) => <SyncPaneBase {...syncProps} />}</Sync>
)
