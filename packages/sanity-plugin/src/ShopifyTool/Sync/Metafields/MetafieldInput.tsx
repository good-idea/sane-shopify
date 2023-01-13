import * as React from 'react'
import { nanoid } from 'nanoid'
import { BiTrash } from 'react-icons/bi'
import { Flex, Box, Button, Label, Card, TextInput } from '@sanity/ui'

import {
  Keyed,
  MetafieldConfig,
  MetafieldConfigType,
} from '@sane-shopify/types'

import { useSaneContext } from '../../../Provider'
import { useState } from 'react'

interface MetafieldInputProps {
  metafieldConfig: Keyed<MetafieldConfig>
  type: MetafieldConfigType
  customOnRemove?: (e: any) => void
}

export const MetafieldInput: React.FC<MetafieldInputProps> = ({
  type,
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
    await context.saveMetafield(type, {
      _key: metafieldConfig._key,
      namespace: namespaceValue,
      key: keyValue,
    })
    setIsPending(false)
  }

  const handleRemove = async () => {
    setIsPending(true)
    await context.clearMetafield(type, metafieldConfig._key)
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

type NewMetafieldInputProps = Pick<MetafieldInputProps, 'type'>

export const NewMetafieldInput: React.FC<NewMetafieldInputProps> = ({
  type,
}) => {
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
      type={type}
      metafieldConfig={newField}
      customOnRemove={handleCancelClick}
    />
  ) : (
    <Button text="Add new metafield" onClick={handleAddClick} />
  )
}
