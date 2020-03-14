import {
  SanityClient,
  ShopifyClient,
  ShopifyClientConfig,
  SyncState
} from '@sane-shopify/types'
import * as React from 'react'
import {
  createShopifyClient,
  syncUtils,
  SyncUtils,
  testSecrets
} from '@sane-shopify/sync-utils'
// import { createShopifyClient } from '../shopifyClient'

/* eslint-disable @typescript-eslint/no-var-requires */
const defaultSanityClient = require('part:@sanity/base/client')

/**
 * Constants & Defaults
 */

const emptySecrets = {
  shopName: '',
  accessToken: ''
}

const KEYS_ID = 'secrets.sane-shopify'
const KEYS_TYPE = 'sane-shopify.keys'

/**
 * Context Setup
 */

const ClientContext = React.createContext<ClientContextValue | void>(undefined)

export const SaneConsumer = ClientContext.Consumer

export const useSaneContext = () => {
  const ctx = React.useContext(ClientContext)
  if (!ctx) throw new Error('useSaneContext must be used within a SaneProvider')
  return ctx
}

/**
 * ClientProvider
 */

interface SecretUtils {
  saveSecrets: (secrets: ShopifyClientConfig) => Promise<boolean>
  testSecrets: typeof testSecrets
  clearSecrets: () => Promise<boolean>
}

export interface ClientContextValue extends SecretUtils {
  secrets: ShopifyClientConfig
  syncState: SyncState
  syncingClient: SyncUtils
  shopifyClient: ShopifyClient
  sanityClient: SanityClient
}

interface ClientContextProps {
  children: React.ReactNode | ((value: ClientContextValue) => React.ReactNode)
}

interface ClientContextState {
  secrets?: ShopifyClientConfig
  syncState?: SyncState
}

export class Provider extends React.Component<
  ClientContextProps,
  ClientContextState
> {
  public state: ClientContextState = {
    secrets: undefined,
    syncState: undefined
  }

  public shopifyClient?: ShopifyClient = undefined

  public sanityClient: SanityClient = defaultSanityClient

  public syncingClient?: SyncUtils = undefined

  public async componentDidMount() {
    const shopifySecrets = await this.fetchSecrets()
    this.createSyncingClient(shopifySecrets)
  }

  private async createSyncingClient(secrets: ShopifyClientConfig) {
    const shopifyClient = createShopifyClient(secrets)
    this.syncingClient = syncUtils(
      shopifyClient,
      defaultSanityClient,
      this.handleStateChange
    )
    const { accessToken, shopName } = secrets
    this.setState(
      {
        secrets: {
          accessToken,
          shopName
        },
        syncState: this.syncingClient.initialState
      },
      this.syncingClient.initialize
    )
  }

  public handleStateChange = (newState: SyncState) => {
    this.setState({
      syncState: newState
    })
  }

  public fetchSecrets = async (): Promise<ShopifyClientConfig | null> => {
    const results: ShopifyClientConfig[] = await this.sanityClient.fetch(
      `*[_id == "${KEYS_ID}"]`
    )
    if (results.length) return results[0]
    return emptySecrets
  }

  /**
   * Returns true on success, false otherwise
   */
  public saveSecrets = async (
    secrets: ShopifyClientConfig
  ): Promise<boolean> => {
    const valid = await testSecrets(secrets)
    if (!valid) return false
    const doc = {
      _id: KEYS_ID,
      _type: KEYS_TYPE,
      ...secrets
    }
    await this.sanityClient.createIfNotExists(doc)
    await this.sanityClient
      .patch(KEYS_ID)
      .set({ ...secrets })
      .commit()

    this.createSyncingClient(secrets)
    return true
  }

  public clearSecrets = async (): Promise<boolean> => {
    return true
    // await this.sanityClient
    //   .patch(KEYS_ID)
    //   .set({
    //     ...emptySecrets
    //   })
    //   .commit()
    // this.setState({ valid: false })
    // return true
  }

  public render() {
    const { children } = this.props
    const { secrets, syncState } = this.state
    const {
      saveSecrets,
      clearSecrets,
      syncingClient,
      shopifyClient,
      sanityClient
    } = this

    const value = {
      saveSecrets,
      testSecrets,
      clearSecrets,
      syncingClient,
      shopifyClient,
      sanityClient,
      syncState,
      secrets: secrets || emptySecrets
    }

    return (
      <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
    )
  }
}
