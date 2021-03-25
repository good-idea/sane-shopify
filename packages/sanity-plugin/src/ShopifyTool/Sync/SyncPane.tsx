import * as React from 'react'
import { Button, Text, Box } from '@sanity/ui'
import { Sync, SyncRenderProps } from './Sync'
import { Progress } from '../../components/Progress'

const SyncPaneBase = ({ syncState, syncAll }: SyncRenderProps) => {
  const handleSyncButton = () => syncAll()
  return (  
    <Box marginBottom={[1, 2, 6]}>
      <Box marginBottom={[1, 2, 4]}>
        <Text size={1} weight="bold">
          Sync
        </Text>
      </Box>
      <Button
        style={{width: '100%'}}
        radius={0}
        fontSize={2}
        padding={[2, 2, 4]}
        tone="primary"
        onClick={handleSyncButton}
        disabled={syncState === 'complete'}
        mode={syncState === 'syncing' ? 'bleed' : 'default'}
        text={syncState === 'syncing' ? 'Wait until complete...' : 'Sync data from Shopify'}
      />
      <Progress />
    </Box>
  )
}

export const SyncPane = () => (
  <Sync>{(syncProps) => <SyncPaneBase {...syncProps} />}</Sync>
)
