import { SanityClient } from '@sanity/client'
import {
  Keyed,
  ShopifyClient,
  SyncUtils,
  SyncMachineState,
  UpdateConfigDocumentArgs,
  SaneShopifyConfigDocument,
  MetafieldConfig,
} from '@sane-shopify/types'
import * as React from 'react'
import {
  CONFIG_DOC_TYPE,
  createShopifyClient,
  syncUtils,
} from '@sane-shopify/sync-utils'
import { defaultSanityClient } from '../services/sanity'

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

interface ConfigUtils {
  saveConfig: (config: UpdateConfigDocumentArgs) => Promise<void>
  clearConfig: () => Promise<void>
  saveMetafield: (metafield: Keyed<MetafieldConfig>) => Promise<void>
  clearMetafield: (key: string) => Promise<void>
}

export interface ClientContextValue extends ConfigUtils {
  config?: SaneShopifyConfigDocument
  syncState: SyncMachineState
  syncingClient: SyncUtils
  shopifyClient: ShopifyClient
  sanityClient: SanityClient
}

interface ClientContextProps {
  shopName: string | null
  children: React.ReactNode | ((value: ClientContextValue) => React.ReactNode)
}

interface ClientContextState {
  config?: SaneShopifyConfigDocument
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
    config: undefined,
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
    this?.syncingClient?.initialize(this.state.config || emptySecrets)
  }

  private async createSyncingClient(config?: SaneShopifyConfigDocument) {
    const shopifyClient = createShopifyClient(config)
    this.shopifyClient = shopifyClient
    this.syncingClient = syncUtils(
      shopifyClient,
      defaultSanityClient,
      this.handleStateChange
    )

    this.setState(
      {
        config,
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

  public fetchSecrets = async (): Promise<
    SaneShopifyConfigDocument | undefined
  > => {
    if (!this.props.shopName) return undefined

    const results: SaneShopifyConfigDocument[] = await this.sanityClient.fetch(
      `*[_type == $type && shopName == $shopName]`,
      { type: CONFIG_DOC_TYPE, shopName: this.props.shopName }
    )

    if (results.length) return results[0]
    return undefined
  }

  /**
   * Returns true on success, false otherwise
   */

  public saveConfig = async (
    config: UpdateConfigDocumentArgs
  ): Promise<void> => {
    if (!config.shopName) {
      throw new Error('No shopName provided')
    }
    if (this.syncingClient) {
      await this.syncingClient.saveConfig(config.shopName, config)
    }
    // update with a new client with valid secrets
    // @ts-ignore
    this.createSyncingClient(config)
  }

  public clearConfig = async (): Promise<void> => {
    if (this.syncingClient && this.state.config) {
      this.syncingClient.clearConfig(this.state.config.shopName)
    }
  }

  public saveMetafield = async (metafield: Keyed<MetafieldConfig>) => {
    const currentConfig = this.state.config
    if (!this.props.shopName) {
      throw new Error('prop "shopname" was not provided')
    }
    if (!this.syncingClient) {
      throw new Error('Syncing client is not available')
    }
    if (!currentConfig) {
      throw new Error('Current config is not available')
    }
    const currentMetafieldsConfig = currentConfig.metafieldsConfig || []
    const updatedMetafieldsConfig = currentMetafieldsConfig.find(
      (mf) => mf._key === metafield._key
    )
      ? // replace
        currentMetafieldsConfig.map((mf) =>
          mf._key === metafield._key ? metafield : mf
        )
      : // add
        [...currentMetafieldsConfig, metafield]
    const updatedConfig = {
      ...currentConfig,
      metafieldsConfig: updatedMetafieldsConfig,
    }
    const result = await this.syncingClient.saveConfig(
      this.props.shopName,
      updatedConfig
    )
    this.setState({ config: result })
  }

  public clearMetafield = async (keyToRemove: string): Promise<void> => {
    const currentConfig = this.state.config
    if (!this.props.shopName) {
      throw new Error('prop "shopname" was not provided')
    }
    if (!this.syncingClient) {
      throw new Error('Syncing client is not available')
    }
    if (!currentConfig) {
      throw new Error('Current config is not available')
    }

    const currentMetafieldsConfig = currentConfig.metafieldsConfig || []
    const updatedConfig = {
      ...currentConfig,
      metafieldsConfig: currentMetafieldsConfig.filter(
        (mf) => mf._key !== keyToRemove
      ),
    }
    const result = await this.syncingClient.saveConfig(
      this.props.shopName,
      updatedConfig
    )

    this.setState({ config: result })
  }

  public render() {
    const { children } = this.props
    const { config, syncState } = this.state

    const {
      saveConfig,
      clearConfig,
      syncingClient,
      shopifyClient,
      sanityClient,
      saveMetafield,
      clearMetafield,
    } = this

    if (!syncingClient || !shopifyClient || !sanityClient || !syncState) {
      return null
    }

    const value = {
      saveConfig,
      clearConfig,
      config,
      syncingClient,
      shopifyClient,
      sanityClient,
      syncState,
      saveMetafield,
      clearMetafield,
    }

    return (
      <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
    )
  }
}
