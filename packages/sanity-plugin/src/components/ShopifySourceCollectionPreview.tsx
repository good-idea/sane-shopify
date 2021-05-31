import * as React from 'react'
import {
  Button,
  Card,
  Label,
  Stack,
  Text,
  ThemeProvider,
  studioTheme,
} from '@sanity/ui'
import { Collection } from '@sane-shopify/types'
import { Progress } from './Progress'
import { Provider, useSaneContext } from '../Provider'

interface ShopifySourceCollectionPreviewProps {
  value?: Collection
}

const spacing = {
  marginBottom: '1.5rem',
}

const ShopifySourceCollectionPreviewInner = ({
  value,
}: ShopifySourceCollectionPreviewProps) => {
  const { syncState, syncingClient } = useSaneContext()
  if (!syncState) return null
  const { value: syncStateValue } = syncState
  if (!value) return null

  const syncItemByID = syncingClient
    ? syncingClient.syncItemByID
    : () => undefined
  const { title, id, description } = value

  const reSync = async () => {
    syncItemByID(id)
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
    <Card padding={[3, 3, 4]} radius={2} shadow={1} tone="caution">
      <Stack space={[2, 3]} style={spacing}>
        <Label size={1}> Shopify Source Data </Label>
        <Text size={1}> Read-only. Synced from product data in Shopify </Text>
      </Stack>
      <Stack space={[1, 2]} style={spacing}>
        <Label size={1}>Title</Label>
        <Text size={1}>{title}</Text>
      </Stack>
      <Stack space={[1, 2]} style={spacing}>
        <Label size={1}>Description</Label>
        <Text size={1}>{description}</Text>
      </Stack>
      <Button
        tone="primary"
        radius={0}
        padding={[2, 3]}
        fontSize={1}
        disabled={buttonDisabled}
        onClick={reSync}
        text="Sync from Shopify"
      />
      <Progress />
    </Card>
  )
}

export class ShopifySourceCollectionPreview extends React.Component<ShopifySourceCollectionPreviewProps> {
  render() {
    const shopName = this.props.value?.shopName
    if (!shopName) return null

    return (
      <ThemeProvider theme={studioTheme}>
        <Provider shopName={shopName}>
          <ShopifySourceCollectionPreviewInner {...this.props} />
        </Provider>
      </ThemeProvider>
    )
  }
}
