import * as React from 'react'
import { ClientContextValue } from '../Provider'
import { Setup } from './Setup'
import { SyncPane } from './Sync'
import { Provider, useSaneContext } from '../Provider'

interface Props {
  clientProps: ClientContextValue
  inputProps: any
}

const Inner = () => {
  const { syncState } = useSaneContext()
  if (!syncState) return null
  const { valid } = syncState.context
  if (syncState.value === 'init') return null
  return (
    <div style={{ margin: '0 auto', padding: '20px', maxWidth: '920px' }}>
      {valid ? <SyncPane /> : null}
      <Setup />
    </div>
  )
}

export const ShopifyTool = () => (
  <Provider>
    <Inner />
  </Provider>
)
