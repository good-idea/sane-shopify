import * as React from 'react'
import { Stack, Button, Text, Box } from '@sanity/ui'
import { Sync, SyncRenderProps } from './Sync'
import { Progress } from '../../components/Progress'

const SyncPaneBase = ({ error, syncState, syncAll }: SyncRenderProps) => {
  const handleSyncButton = () => syncAll()

  return (
    <Box marginBottom={[1, 2, 6]}>
      <Box marginBottom={[1, 2, 4]}>
        <Text size={1} weight="bold">
          Sync
        </Text>
      </Box>
      <Button
        style={{ width: '100%' }}
        radius={0}
        fontSize={2}
        padding={[2, 2, 4]}
        tone="primary"
        onClick={handleSyncButton}
        disabled={syncState === 'complete' || Boolean(error)}
        mode={syncState === 'syncing' ? 'bleed' : 'default'}
        text={
          syncState === 'syncing'
            ? 'Wait until complete...'
            : 'Sync data from Shopify'
        }
      />
      <Progress />
      {error ? (
        <Stack marginTop={4} space={4}>
          <Text size={1}>Sorry, an error occurred.</Text>
          <Text size={1} style={{ color: 'red' }}>
            {error.message}
          </Text>
          <Text size={1}>Developers, check your console for more details.</Text>
        </Stack>
      ) : null}
    </Box>
  )
}

export const SyncPane = () => (
  <Sync>{(syncProps) => <SyncPaneBase {...syncProps} />}</Sync>
)
