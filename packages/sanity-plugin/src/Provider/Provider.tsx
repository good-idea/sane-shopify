import { SanityClient, ShopifyClient } from '@sane-shopify/types'
import * as React from 'react'
import { createClient } from '../shopifyClient'
import { Secrets } from '../types'
import { testSecrets } from './utils'

/* tslint:disable-next-line */
const defaultSanityClient = require('part:@sanity/base/client')

/**
 * Constants & Defaults
 */

const emptySecrets = {
  storefrontName: '',
  storefrontApiKey: ''
}

const KEYS_ID = 'secrets.sane-shopify'
const KEYS_TYPE = 'sane-shopify.keys'

/**
 * Context Setup
 */

const ClientContext = React.createContext<ClientContextValue | void>(undefined)

export const ClientConsumer = ClientContext.Consumer

/**
 * ClientProvider
 */

interface SecretUtils {
  saveSecrets: (secrets: Secrets) => Promise<boolean>

  testSecrets: typeof testSecrets
  clearSecrets: () => Promise<boolean>
}

export interface ClientContextValue extends SecretUtils {
  secrets: Secrets
  valid: boolean
  ready: boolean
  shopifyClient: ShopifyClient
  sanityClient: SanityClient
}

interface ClientContextProps {
  children: React.ReactNode | ((value: ClientContextValue) => React.ReactNode)
}

interface ClientContextState {
  secrets?: Secrets
  valid: boolean
  ready: boolean
}

export class Provider extends React.Component<ClientContextProps, ClientContextState> {
  public state = {
    secrets: undefined,
    valid: false,
    ready: false
  }

  public shopifyClient?: ShopifyClient = undefined

  public sanityClient: SanityClient = defaultSanityClient

  public async componentDidMount() {
    const secrets = await this.fetchSecrets()
    const { valid } = await testSecrets(secrets)
    if (valid) {
      this.shopifyClient = createClient(secrets)
      this.setState({ secrets, valid: true, ready: true })
    } else {
      this.setState({ valid: false, ready: true, secrets: emptySecrets })
    }
  }

  public fetchSecrets = async (): Promise<Secrets | null> => {
    const results: Secrets[] = await this.sanityClient.fetch(`*[_id == "${KEYS_ID}"]`)
    if (results.length) return results[0]
    return null
  }

  /**
   * Returns true on success, false otherwise
   */
  public saveSecrets = async (secrets: Secrets): Promise<boolean> => {
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
    await this.setState({ secrets })
    return true
  }

  public clearSecrets = async (): Promise<boolean> => {
    await this.sanityClient
      .patch(KEYS_ID)
      .set({
        ...emptySecrets
      })
      .commit()
    await this.setState({ valid: false })
    return true
  }

  public render() {
    const { children } = this.props
    const { secrets, valid, ready } = this.state
    const { saveSecrets, clearSecrets, shopifyClient, sanityClient } = this

    const value = {
      valid,
      ready,
      saveSecrets,
      testSecrets,
      clearSecrets,
      shopifyClient,
      sanityClient,
      secrets: secrets || emptySecrets
    }

    return (
      <ClientContext.Provider value={value}>
        {children instanceof Function ? children(value) : children}
      </ClientContext.Provider>
    )
  }
}
