import * as React from 'react'
import { 
  Flex, 
  Card,
  Stack,
  TabPanel,
  Text,
  Heading,
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

const Inner = ({ children }) => {
  const { syncState } = useSaneContext()
  if (!syncState) return null
  const { valid } = syncState.context
  if (syncState.value === 'init') return null

  return (
    <>
      {children}
      {valid ? <SyncPane /> : null}
      <Setup />
    </>
  )
}

interface State {
  secrets: ShopifySecrets[],
  id: string | null
}

const buttonStyles = {
  width: '100%', 
  padding: '1.5rem', 
  border: 'none', 
  outline: 'none',
  cursor: 'pointer'
}

const sidebarStyles = {
  position: 'sticky',
  top: 0,
  left: 0,
  height: 'fit-content'
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

export class ShopifyTool extends React.Component<null, State> {
  public state: State = {
    secrets: [],
    id: null
  }

  public subscription

  public sanityClient = defaultSanityClient

  public fetchSecrets = async (query: string, params: object) => {     
    const shopifySecrets = await this.sanityClient.fetch(query, params)
    this.updateSecrets(shopifySecrets)
  }

  public componentDidMount() {
    const query = '*[_type == $documentType]'
    const params = { documentType: KEYS_TYPE }

    this.subscription = this.sanityClient.listen(query, params)
      .subscribe(async () => {
        await sleep(2000)
        this.fetchSecrets(query, params)
      })

    // first time call
    this.fetchSecrets(query, params)
  }

  public componentWillUnmount() {
    this.subscription.unsubscribe()
  }

  private updateSecrets(shopifySecrets: ShopifySecrets[]) {
    console.log('update secrets...', shopifySecrets)
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
            flex={[1, 2]}
            // @ts-ignore
            style={sidebarStyles}
            tone="transparent"
          >
            <Card
              padding={[2, 3, 4]}
              tone="transparent"
            >
              <Heading as="h3" size={1}> Sane Shopify </Heading>
            </Card>
            <Stack>
              { this.state.secrets.map(secret => (
                <button
                  id={`${secret.shopName}-tab`}
                  aria-controls={`${secret.shopName}-panel`}
                  key={secret._id}
                  onClick={() =>this.setCurrent(secret)}
                  style={{ ...buttonStyles, backgroundColor: secret._id !== this.state.id ? 'transparent' : 'black' }}>
                  <Text 
                    style={{ 
                      textAlign: 'left',
                      color: secret._id !== this.state.id ? 'currentColor' : 'white',
                    }}
                    size={1}
                  >
                    {`${secret.shopName}.myshopify.com`}
                  </Text>
                </button>
              )) }
              <button
                id={`add-tab`}
                aria-controls={`add-panel`}
                onClick={() =>this.setCurrent(undefined) }
                style={{ ...buttonStyles, backgroundColor: this.state.id !== null ? 'transparent' : 'black' }}>
                <Text 
                  style={{ 
                    textAlign: 'left',
                    color: this.state.id !== null ? 'currentColor' : 'white',
                  }}
                  size={1}
                >
                  Connect new storefront
                </Text>
              </button>
            </Stack>
          </Card>
          <Card 
            flex={[1, 2, 3]} 
            padding={[2, 3, 6]}
            style={{ height: '100vh' }}
          >
            { this.state.secrets.map(secret => (
              <TabPanel
                key={secret._id}
                id={`${secret.shopName}-panel`}
                aria-labelledby={`${secret.shopName}-tab`}
                hidden={this.state.id !== secret._id}>
                <Provider
                  secretKey={secret._id}>
                  <Tracker>
                    <Inner>
                      <Card paddingBottom={[1, 2, 5]}>
                        <Heading as="h1" size={1} weight="regular"> 
                          {secret.shopName}.myshopify.com
                        </Heading>
                      </Card>
                    </Inner>
                  </Tracker>
                </Provider>
              </TabPanel>
            )) }
            <TabPanel
              key={this.state?.id || 'add'}
              id={`add-panel`}
              aria-labelledby={`add-tab`}
              hidden={this.state.id !== null}>
              <Provider secretKey={null}>
                <Tracker>
                  <Inner>
                    <Card paddingBottom={[1, 2, 5]}>
                      <Heading as="h1" size={1} weight="regular"> 
                        Storefront Setup
                      </Heading>
                    </Card>
                  </Inner>
                </Tracker>
              </Provider>
              </TabPanel>
          </Card>
        </Flex>
      </ThemeProvider>
    )
  }
}
