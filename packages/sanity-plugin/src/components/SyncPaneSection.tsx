import * as React from 'react'
import { Box, Text } from '@sanity/ui'

interface SyncPaneSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

export const SyncPaneSection: React.FC<SyncPaneSectionProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <Box marginBottom={7}>
      <Box marginBottom={[1, 2, 4]}>
        <Text size={2} weight="bold">
          {title}
        </Text>
      </Box>
      {description ? (
        <Box marginBottom={[1, 2, 4]}>
          <Text size={1}>{description}</Text>
        </Box>
      ) : null}
      {children}
    </Box>
  )
}
