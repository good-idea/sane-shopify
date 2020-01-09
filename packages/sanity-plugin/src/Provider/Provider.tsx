import {
  SanityClient,
  ShopifyClient,
  ShopifyClientConfig
} from '@sane-shopify/types'
import * as React from 'react'
import {
  createShopifyClient,
  syncUtils,
  SyncUtils,
  testSecrets
} from '@sane-shopify/sync-utils'
// import { createShopifyClient } from '../shopifyClient'

/* tslint:disable-next-line */
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
  valid: boolean
  ready: boolean
  syncingClient: SyncUtils
  shopifyClient: ShopifyClient
  sanityClient: SanityClient
}

interface ClientContextProps {
  children: React.ReactNode | ((value: ClientContextValue) => React.ReactNode)
}

interface ClientContextState {
  secrets?: ShopifyClientConfig
  valid: boolean
  ready: boolean
}

export class Provider extends React.Component<
  ClientContextProps,
  ClientContextState
> {
  public state = {
    secrets: undefined,
    valid: false,
    ready: false
  }

  public shopifyClient?: ShopifyClient = undefined

  public sanityClient: SanityClient = defaultSanityClient

  public syncingClient?: SyncUtils = undefined

  public async componentDidMount() {
    const secrets = await this.fetchSecrets()
    const { valid } = await testSecrets(secrets)
    if (valid) {
      this.shopifyClient = createShopifyClient(secrets)
      this.syncingClient = syncUtils(this.shopifyClient, defaultSanityClient)
      this.setState({ secrets, valid: true, ready: true })
    } else {
      this.setState({ valid: false, ready: true, secrets: emptySecrets })
    }
  }

  public fetchSecrets = async (): Promise<ShopifyClientConfig | null> => {
    const results: ShopifyClientConfig[] = await this.sanityClient.fetch(
      `*[_id == "${KEYS_ID}"]`
    )
    if (results.length) return results[0]
    return null
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
    //
    await this.sanityClient.createIfNotExists(doc)
    await this.sanityClient
      .patch(KEYS_ID)
      .set({ ...secrets })
      .commit()
    this.setState({ valid: true, secrets })
    return true
  }

  public clearSecrets = async (): Promise<boolean> => {
    await this.sanityClient
      .patch(KEYS_ID)
      .set({
        ...emptySecrets
      })
      .commit()
    this.setState({ valid: false })
    return true
  }

  public render() {
    const { children } = this.props
    const { secrets, valid, ready } = this.state
    const {
      saveSecrets,
      clearSecrets,
      syncingClient,
      shopifyClient,
      sanityClient
    } = this

    const value = {
      valid,
      ready,
      saveSecrets,
      testSecrets,
      clearSecrets,
      syncingClient,
      shopifyClient,
      sanityClient,
      secrets: secrets || emptySecrets
    }

    return (
      <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
    )
  }
}
