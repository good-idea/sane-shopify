import * as React from 'react'
import {
  Flex,
  Box,
  Card,
  Stack,
  TabPanel,
  Text,
  studioTheme,
  ThemeProvider,
} from '@sanity/ui'
import { Setup } from './Setup'
import { SyncPane } from './Sync'
import { Provider, useSaneContext } from '../Provider'
import { SaneShopifyConfigDocument } from '@sane-shopify/types'
import { CONFIG_DOC_TYPE } from '@sane-shopify/sync-utils'
import { defaultSanityClient } from '../services/sanity'

const Inner = (props: { children: React.ReactNode }) => {
  const { syncState } = useSaneContext()
  if (!syncState) return null
  const { valid } = syncState.context
  if (syncState.value === 'init') return null

  return (
    <>
      {props.children}
      {valid ? <SyncPane /> : null}
      <Setup />
    </>
  )
}

interface State {
  config: Map<string, SaneShopifyConfigDocument>
  currentConfig: SaneShopifyConfigDocument | undefined
}

const buttonStyles = {
  width: '100%',
  padding: '1.5rem',
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
}

const sidebarStyles = {
  position: 'sticky',
  top: 0,
  left: 0,
  height: 'fit-content',
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

export class ShopifyTool extends React.Component<null, State> {
  public state: State = {
    config: new Map(),
    currentConfig: undefined,
  }

  public subscription

  public sanityClient = defaultSanityClient

  public fetchConfig = async () => {
    const query = '*[_type == $documentType]'

    const params = { documentType: CONFIG_DOC_TYPE }

    this.subscription = this.sanityClient
      .listen(query, params)
      .subscribe(async (update) => {
        await sleep(2000)
        const updatedConfig =
          await this.sanityClient.fetch<SaneShopifyConfigDocument>(
            '*[_id == $id][0]',
            {
              id: update.documentId,
            }
          )
        this.updateConfig([updatedConfig])
      })

    const shopifyConfig = await this.sanityClient.fetch(query, params)
    this.updateConfig(shopifyConfig)
    return shopifyConfig
  }

  public async componentDidMount() {
    const config = await this.fetchConfig()
    if (config && config.length) {
      this.setCurrent(config[0])
    }
  }

  public componentWillUnmount() {
    this.subscription.unsubscribe()
  }

  private isCurrentConfig(config: SaneShopifyConfigDocument): boolean {
    return this.state.currentConfig?.shopName === config.shopName
  }

  private updateConfig(config: SaneShopifyConfigDocument[]) {
    const updatedConfig = config.reduce<Map<string, SaneShopifyConfigDocument>>(
      (prevMap, configDoc) => {
        return new Map(prevMap).set(configDoc.shopName, configDoc)
      },
      this.state.config
    )

    this.setState({
      config: updatedConfig,
    })
  }

  private setCurrent = (config: SaneShopifyConfigDocument | undefined) => {
    this.setState({
      currentConfig: config,
    })
  }

  private setCurrentByShopName = (shopName: string | undefined) => () => {
    this.setCurrent(shopName ? this.state.config.get(shopName) : undefined)
  }

  public render(): React.ReactNode {
    return (
      <ThemeProvider theme={studioTheme}>
        <Flex>
          <Box
            flex={[1, 2]}
            // @ts-ignore
            style={sidebarStyles}
          >
            <Box padding={[2, 3, 4]}>
              <Text size={3}> Sane Shopify </Text>
            </Box>
            <Stack>
              {Array.from(this.state.config).map(([shopName, configDoc]) => (
                <button
                  id={`${shopName}-tab`}
                  aria-controls={`${shopName}-panel`}
                  key={configDoc._id}
                  onClick={this.setCurrentByShopName(shopName)}
                  style={{
                    ...buttonStyles,
                    backgroundColor: !this.isCurrentConfig(configDoc)
                      ? 'transparent'
                      : 'black',
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'left',
                      color: !this.isCurrentConfig(configDoc)
                        ? 'currentColor'
                        : 'white',
                    }}
                    size={1}
                  >
                    {`${configDoc.shopName}.myshopify.com`}
                  </Text>
                </button>
              ))}
              <button
                id={`add-tab`}
                aria-controls={`add-panel`}
                onClick={this.setCurrentByShopName(undefined)}
                style={{
                  ...buttonStyles,
                  backgroundColor:
                    this.state.currentConfig !== undefined
                      ? 'transparent'
                      : 'black',
                }}
              >
                <Text
                  style={{
                    textAlign: 'left',
                    color:
                      this.state.currentConfig !== undefined
                        ? 'currentColor'
                        : 'white',
                  }}
                  size={1}
                >
                  Connect new storefront
                </Text>
              </button>
            </Stack>
          </Box>
          <Card
            flex={[1, 2, 3]}
            paddingY={[2, 3, 4]}
            paddingX={[2, 3, 8]}
            style={{ minHeight: '100vh' }}
          >
            {Array.from(this.state.config).map(([shopName, configDoc]) => (
              <TabPanel
                key={shopName}
                id={`${shopName}-panel`}
                aria-labelledby={`${shopName}-tab`}
                hidden={!this.isCurrentConfig(configDoc)}
              >
                <Provider shopName={shopName}>
                  <Inner>
                    <Box marginBottom={[1, 2, 6]}>
                      <Text size={3}>{shopName}.myshopify.com</Text>
                    </Box>
                  </Inner>
                </Provider>
              </TabPanel>
            ))}
            <TabPanel
              key={this.state.currentConfig?.shopName || 'add'}
              id={`add-panel`}
              aria-labelledby={`add-tab`}
              hidden={this.state.currentConfig !== undefined}
            >
              <Provider shopName={null}>
                <Inner>
                  <Box marginBottom={[1, 2, 6]}>
                    <Text size={3}>Storefront Setup</Text>
                  </Box>
                </Inner>
              </Provider>
            </TabPanel>
          </Card>
        </Flex>
      </ThemeProvider>
    )
  }
}
