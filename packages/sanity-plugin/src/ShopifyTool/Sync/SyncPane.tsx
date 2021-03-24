import * as React from 'react'
import { Button, Text, Card } from '@sanity/ui'
import { Sync, SyncRenderProps } from './Sync'
import { Progress } from '../../components/Progress'

const SyncPaneBase = ({ syncState, syncAll }: SyncRenderProps) => {
  const handleSyncButton = () => syncAll()
  return (  
    <Card
      marginBottom={[1, 2, 6]}>
      <Card
        marginBottom={[1, 2, 4]}>
        <Text size={1} weight="bold">
          Sync
        </Text>
      </Card>
      <Card
        marginBottom={[1, 2, 4]}>
        <Button
          style={{width: '100%'}}
          radius={0}
          fontSize={2}
          padding={[3, 3, 4]}
          tone="primary"
          onClick={handleSyncButton}
          disabled={syncState === 'complete'}
          mode={syncState === 'syncing' ? 'bleed' : 'default'}
          text={syncState === 'syncing' ? 'Wait until complete...' : 'Sync data from Shopify'}
        />
      </Card>
      <Progress />
    </Card>
  )
}

export const SyncPane = () => (
  <Sync>{(syncProps) => <SyncPaneBase {...syncProps} />}</Sync>
)
