import * as React from 'react'
import { unwindEdges } from '@good-idea/unwind-edges'
import {
  Button,
  Card,
  Label,
  Stack,
  Text,
  ThemeProvider,
  studioTheme,
} from '@sanity/ui'
import { Product } from '@sane-shopify/types'
import { Progress } from './Progress'
import { Provider, useSaneContext } from '../Provider'

interface ShopifySourceProductPreviewProps {
  value?: Product
}

const spacing = {
  marginBottom: '1.5rem',
}

const ShopifySourceProductPreviewInner = ({
  value,
}: ShopifySourceProductPreviewProps) => {
  const { syncState, syncingClient } = useSaneContext()
  if (!syncState) return null
  const { value: syncStateValue } = syncState
  if (!value) return null

  const syncItemByID = syncingClient.syncItemByID

  const {
    title,
    id,
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
    <Card
      key={id || null}
      padding={[3, 3, 4]}
      radius={2}
      shadow={1}
      tone="caution"
    >
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
      <Stack space={[1, 2]} style={spacing}>
        <Label size={1}>Available</Label>
        <Text size={1}>{availableForSale ? 'Yes ✅' : 'No 🚫'}</Text>
      </Stack>
      <Stack space={[1, 2]} style={spacing}>
        <Label size={1}>Variants</Label>
        <Text size={1}>{variantsValue}</Text>
      </Stack>
      {tags.length ? (
        <Stack space={[1, 2]} style={spacing}>
          <Label size={1}>Tags</Label>
          <Text size={1}>{tags.join(', ')}</Text>
        </Stack>
      ) : null}
      {productType ? (
        <Stack space={[1, 2]} style={spacing}>
          <Label size={1}>Description</Label>
          <Text size={1}>{description}</Text>
        </Stack>
      ) : null}
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

export class ShopifySourceProductPreview extends React.Component<ShopifySourceProductPreviewProps> {
  render() {
    const shopName = this.props.value?.shopName
    if (!shopName) return null

    return (
      <Provider shopName={shopName}>
        <ThemeProvider theme={studioTheme}>
          <ShopifySourceProductPreviewInner {...this.props} />
        </ThemeProvider>
      </Provider>
    )
  }
}
