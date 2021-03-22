import * as React from 'react'
import { Tracker } from '@sanity/base/lib/change-indicators'
import { Setup } from './Setup'
import { SyncPane } from './Sync'
import { Provider, useSaneContext } from '../Provider'
import { ShopifySecrets } from '@sane-shopify/types'
import { KEYS_TYPE } from '@sane-shopify/sync-utils'

const defaultSanityClient = require('part:@sanity/base/client')

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

interface State {
  secrets: ShopifySecrets[]
}

export class ShopifyTool extends React.Component<null, State> {
  public state: State = {
    secrets: [],
  }

  public sanityClient = defaultSanityClient

  public fetchSecrets = async (): Promise<ShopifySecrets[]> => {
    const results: ShopifySecrets[] = await this.sanityClient.fetch(
      `*[_type == "${KEYS_TYPE}"]`
    )
    return results || []
  }

  public async componentDidMount(): Promise<void> {
    const shopifySecrets = await this.fetchSecrets()

    this.setState({
      secrets: [...shopifySecrets, {
        _id: '',
        shopName: '',
        accessToken: '',
      }]
    })
  }

  public render(): React.ReactNode {
    const { secrets } = this.state

    return (
      <>
        {
          secrets.map((secret, order) => (
            <Provider key={order} secretKey={secret._id}>
              <Tracker>
                <Inner />
              </Tracker>
            </Provider>
          ))
        }
      </>
    )
  }
}
