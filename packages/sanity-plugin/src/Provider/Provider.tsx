import { SanityClient } from '@sanity/client'
import {
  ShopifyClient,
  ShopifySecrets,
  SyncUtils,
  SyncMachineState,
} from '@sane-shopify/types'
import * as React from 'react'
import {
  KEYS_TYPE,
  createShopifyClient,
  syncUtils,
} from '@sane-shopify/sync-utils'

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
  syncState: SyncMachineState
  syncingClient: SyncUtils
  shopifyClient: ShopifyClient
  sanityClient: SanityClient
}

interface ClientContextProps {
  shopName: string | null,
  children: React.ReactNode | ((value: ClientContextValue) => React.ReactNode)
}

interface ClientContextState {
  secrets?: ShopifySecrets
  syncState?: SyncMachineState
}

const emptySecrets = {
  _id: '',
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

  public async componentDidMount(): Promise<void> {
    const shopifySecrets = await this.fetchSecrets()
    this.createSyncingClient(shopifySecrets)
  }

  private initializeSyncingClient() {
    this?.syncingClient?.initialize(this.state.secrets || emptySecrets)
  }

  private async createSyncingClient(secrets?: ShopifySecrets) {
    // @ts-ignore
    const shopifyClient = createShopifyClient(secrets)
    this.shopifyClient = shopifyClient
    this.syncingClient = syncUtils(
      shopifyClient,
      defaultSanityClient,
      this.handleStateChange
    )

    const { _id, shopName, accessToken } = secrets || emptySecrets

    this.setState(
      {
        secrets: {
          _id,
          shopName,
          accessToken,
        },
        syncState: this?.syncingClient?.initialState,
      },
      this.initializeSyncingClient
    )
  }

  public handleStateChange = (newState: SyncMachineState) => {
    this.setState({
      syncState: newState,
    })
  }

  public fetchSecrets = async (): Promise<ShopifySecrets | undefined> => {
    if (!this.props.shopName) return undefined

    const results: ShopifySecrets[] = await this.sanityClient.fetch(
      `*[_type == "${KEYS_TYPE}" && shopName == "${this.props.shopName}"]`
    )

    if (results.length) return results[0]
    return undefined
  }

  /**
   * Returns true on success, false otherwise
   */

  public saveSecrets = async (secrets: ShopifySecrets): Promise<void> => {
    if (this.syncingClient) await this.syncingClient.saveSecrets(secrets)
    // update with a new client with valid secrets
    this.createSyncingClient(secrets)
  }

  public clearSecrets = async (): Promise<void> => {
    if (this.syncingClient && this.state.secrets) this.syncingClient.clearSecrets(this.state.secrets)
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
