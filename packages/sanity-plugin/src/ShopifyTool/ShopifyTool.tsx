import * as React from 'react'
import { ClientContextValue } from '../Provider'
import { SyncPane } from './Sync'
import { Setup } from './Setup'

interface Props {
  clientProps: ClientContextValue
  inputProps: any
}

export const ShopifyTool = () => {
  return (
    <div style={{ margin: '0 auto', maxWidth: '920px' }}>
      <SyncPane />
      <Setup />
    </div>
  )
}
