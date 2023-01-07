import * as React from 'react'
import { nanoid } from 'nanoid'
import { BiTrash } from 'react-icons/bi'
import { Flex, Box, Button, Label, Card, TextInput } from '@sanity/ui'

import { definitely } from '@sane-shopify/sync-utils'
import { Keyed, MetafieldConfig } from '@sane-shopify/types'

import { SyncPaneSection } from '../../components/SyncPaneSection'
import { useSaneContext } from '../../Provider'
import { useState } from 'react'

interface MetafieldInputProps {
  metafieldConfig: Keyed<MetafieldConfig>
  customOnRemove?: (e: any) => void
}

const MetafieldInput: React.FC<MetafieldInputProps> = ({
  metafieldConfig,
  customOnRemove,
}) => {
  const context = useSaneContext()

  const [isPending, setIsPending] = useState(false)
  const [namespaceValue, setNamespaceValue] = useState(
    metafieldConfig?.namespace || ''
  )
  const [keyValue, setKeyValue] = useState(metafieldConfig?.key || '')

  const hasChanged =
    namespaceValue !== metafieldConfig?.namespace ||
    keyValue !== metafieldConfig?.key
  const isValid = namespaceValue.length > 1 && keyValue.length > 1

  const isDisabled =
    isPending === true || isValid === false || hasChanged === false

  const handleUpdate = async () => {
    setIsPending(true)
    await context.saveMetafield({
      _key: metafieldConfig._key,
      namespace: namespaceValue,
      key: keyValue,
    })
    setIsPending(false)
  }

  const handleRemove = async () => {
    setIsPending(true)
    await context.clearMetafield(metafieldConfig._key)
    setIsPending(false)
  }

  const containerStyle = {
    opacity: isPending ? 0.5 : 1,
    pointerEvents: isPending ? 'none' : 'inherit',
  } as React.CSSProperties

  return (
    <Flex style={containerStyle} marginBottom={2} gap={1}>
      <Box flex={5}>
        <Card padding={1}>
          <Label size={1}>Namespace</Label>
        </Card>
        <TextInput
          value={namespaceValue}
          onChange={(event) => setNamespaceValue(event.currentTarget.value)}
        />
      </Box>
      <Box marginLeft={2} flex={5}>
        <Card padding={1}>
          <Label size={1}>Key</Label>
        </Card>

        <TextInput
          value={keyValue}
          onChange={(event) => setKeyValue(event.currentTarget.value)}
        />
      </Box>
      <Box marginLeft={2}>
        <Card padding={1}>
          <Label size={1}>&nbsp;</Label>
        </Card>
        <Flex gap={2}>
          <Button
            text="Update"
            disabled={isDisabled}
            onClick={handleUpdate}
            tone="primary"
            type="button"
          />
          <Button
            icon={BiTrash}
            aria-label="Remove metafield"
            onClick={customOnRemove || handleRemove}
            mode="ghost"
            type="button"
          />
        </Flex>
      </Box>
    </Flex>
  )
}

const NewMetafieldInput: React.FC = () => {
  const [isActive, setIsActive] = useState(false)

  const handleAddClick = () => setIsActive(true)
  const handleCancelClick = () => setIsActive(false)

  const newField = {
    _key: nanoid(),
    namespace: '',
    key: '',
  }

  return isActive ? (
    <MetafieldInput
      metafieldConfig={newField}
      customOnRemove={handleCancelClick}
    />
  ) : (
    <Button text="Add new metafield" onClick={handleAddClick} />
  )
}

export const Metafields: React.FC = () => {
  const context = useSaneContext()
  const metafields = definitely(context.config?.metafieldsConfig)
  return (
    <SyncPaneSection
      title="Metafields"
      description="Configure which metafields should be fetched from your Shopify data. This configuration will also be used in any webhooks."
    >
      <Box key={context.config?._updatedAt} marginBottom={4}>
        {metafields.map((metafieldConfig) => (
          <MetafieldInput
            key={metafieldConfig._key.concat(context.config?._updatedAt || '')}
            metafieldConfig={metafieldConfig}
          />
        ))}
        <NewMetafieldInput />
      </Box>
    </SyncPaneSection>
  )
}
