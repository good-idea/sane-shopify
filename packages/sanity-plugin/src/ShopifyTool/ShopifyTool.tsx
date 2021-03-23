import * as React from 'react'
import { 
  Flex, 
  Card,
  Stack,
  Tab,
  TabPanel,
  studioTheme,
  ThemeProvider
} from '@sanity/ui'
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
    <>
      {valid ? <SyncPane /> : null}
      <Setup />
    </>
  )
}

interface State {
  secrets: ShopifySecrets[],
  id: string | null
}

export class ShopifyTool extends React.Component<null, State> {
  public state: State = {
    secrets: [],
    id: null
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
    const [defaultSecrets] = shopifySecrets

    this.setState({
      secrets: shopifySecrets,
      id: defaultSecrets?._id || null
    })
  }

  private setCurrent(shopifySecrets: ShopifySecrets | undefined) {
    this.setState({
      id: shopifySecrets?._id || null
    })
  }

  public render(): React.ReactNode {
    return (
      <ThemeProvider theme={studioTheme}>
        <Flex>
          <Card
            flex={1}
            style={{
              position: 'sticky',
              top: 0,
              left: 0,
              height: 'fit-content'
            }}
            padding={[2, 3, 4]}
            tone="transparent"
          >
            <Stack space={[2, 3]}>
              { this.state.secrets.map(secret => (
                <Card tone="transparent">
                  <Tab
                    id={`${secret.shopName}-tab`}
                    aria-controls={`${secret.shopName}-panel`}
                    key={secret._id}
                    label={`${secret.shopName}.myshopify.com`}
                    onClick={() =>this.setCurrent(secret)}
                    selected={secret._id === this.state.id}
                    style={{ fontSize: '0.75rem' }}
                  />
                </Card>
              )) }
              <Card tone="transparent">
                <Tab
                  id={`add-tab`}
                  aria-controls={`add-panel`}
                  label={`Add storefront`}
                  onClick={() =>this.setCurrent(undefined) }
                  selected={this.state.id === null}
                  style={{ fontSize: '0.75rem' }}
                />
              </Card>
            </Stack>
          </Card>
          <Card 
            flex={[1, 2, 3]} 
            padding={[2, 3, 4]}>
            { this.state.secrets.map(secret => (
              <TabPanel
                id={`${secret.shopName}-panel`}
                aria-labelledby={`${secret.shopName}-tab`}
                hidden={this.state.id !== secret._id}>
                <Provider
                  secretKey={secret._id}>
                  <Tracker>
                    <Inner />
                  </Tracker>
                </Provider>
              </TabPanel>
            )) }
            <TabPanel
              id={`add-panel`}
              aria-labelledby={`add-tab`}
              hidden={this.state.id !== 'add'}>
              <Provider
                secretKey={''}>
                <Tracker>
                  <Inner />
                </Tracker>
              </Provider>
            </TabPanel>
          </Card>
        </Flex>
      </ThemeProvider>
    )
  }
}
