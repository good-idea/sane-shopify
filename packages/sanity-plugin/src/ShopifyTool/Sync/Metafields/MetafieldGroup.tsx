import * as React from 'react'
import {
  Keyed,
  MetafieldConfig,
  MetafieldConfigType,
} from '@sane-shopify/types'
import { Text, Box } from '@sanity/ui'
import { MetafieldInput, NewMetafieldInput } from './MetafieldInput'

interface MetafieldGroupProps {
  type: MetafieldConfigType
  title: string
  metafields: Keyed<MetafieldConfig>[]
}

export const MetafieldGroup: React.FC<MetafieldGroupProps> = ({
  type,
  title,
  metafields,
}) => {
  return (
    <Box>
      <Box marginBottom={[1, 2, 4]}>
        <Text size={1} weight="semibold">
          {title}
        </Text>
      </Box>
      <Box marginBottom={4}>
        {metafields.map((metafieldConfig) => (
          <MetafieldInput
            key={metafieldConfig._key}
            type={type}
            metafieldConfig={metafieldConfig}
          />
        ))}
        <NewMetafieldInput type={type} />
      </Box>
    </Box>
  )
}
