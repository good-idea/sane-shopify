import {
  SanityClient,
  ShopifyClient,
  ShopifySecrets,
  SyncUtils,
  SyncState,
} from '@sane-shopify/types'
import * as React from 'react'
import {
  createShopifyClient,
  syncUtils,
  KEYS_ID,
} from '@sane-shopify/sync-utils'
// import { createShopifyClient } from '../shopifyClient'

/* eslint-disable @typescript-eslint/no-var-requires */
const defaultSanityClient = require('part:@sanity/base/client')

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
  saveSecrets: (secrets: ShopifySecrets) => Promise<void>
  clearSecrets: () => Promise<void>
}

export interface ClientContextValue extends SecretUtils {
  secrets: ShopifySecrets
  syncState: SyncState
  syncingClient: SyncUtils
  shopifyClient: ShopifyClient
  sanityClient: SanityClient
}

interface ClientContextProps {
  children: React.ReactNode | ((value: ClientContextValue) => React.ReactNode)
}

interface ClientContextState {
  secrets?: ShopifySecrets
  syncState?: SyncState
}

const emptySecrets = {
  shopName: '',
  accessToken: '',
}

export class Provider extends React.Component<
  ClientContextProps,
  ClientContextState
> {
  public state: ClientContextState = {
    secrets: undefined,
    syncState: undefined,
  }

  public shopifyClient?: ShopifyClient = undefined

  public sanityClient: SanityClient = defaultSanityClient

  public syncingClient?: SyncUtils = undefined

  public async componentDidMount() {
    const shopifySecrets = await this.fetchSecrets()
    this.createSyncingClient(shopifySecrets)
  }

  private async createSyncingClient(secrets?: ShopifySecrets) {
    const shopifyClient = createShopifyClient(secrets)
    this.shopifyClient = shopifyClient
    this.syncingClient = syncUtils(
      shopifyClient,
      defaultSanityClient,
      this.handleStateChange
    )

    const { shopName, accessToken } = secrets || emptySecrets
    this.setState(
      {
        secrets: {
          shopName,
          accessToken,
        },
        syncState: this.syncingClient.initialState,
      },
      this.syncingClient.initialize
    )
  }

  public handleStateChange = (newState: SyncState) => {
    this.setState({
      syncState: newState,
    })
  }

  public fetchSecrets = async (): Promise<ShopifySecrets | undefined> => {
    const results: ShopifySecrets[] = await this.sanityClient.fetch(
      `*[_id == "${KEYS_ID}"]`
    )
    if (results.length) return results[0]
    return undefined
  }

  /**
   * Returns true on success, false otherwise
   */

  public saveSecrets = async (secrets: ShopifySecrets): Promise<void> => {
    if (this.syncingClient) await this.syncingClient.saveSecrets(secrets)
  }

  public clearSecrets = async (): Promise<void> => {
    if (this.syncingClient) this.syncingClient.clearSecrets()
  }

  public render() {
    const { children } = this.props
    const { secrets, syncState } = this.state
    const {
      saveSecrets,
      clearSecrets,
      syncingClient,
      shopifyClient,
      sanityClient,
    } = this

    if (
      !syncingClient ||
      !shopifyClient ||
      !sanityClient ||
      !syncState ||
      !secrets
    ) {
      return null
    }

    const value = {
      saveSecrets,
      clearSecrets,
      syncingClient,
      shopifyClient,
      sanityClient,
      syncState,
      secrets,
    }

    return (
      <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
    )
  }
}
