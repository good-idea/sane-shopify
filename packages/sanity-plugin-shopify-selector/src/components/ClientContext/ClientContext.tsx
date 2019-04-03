import * as React from 'react'
import { createClient, ShopifyClient } from './shopifyClient'
import { testSecrets } from './utils'
import { Secrets } from '../types'

const sanityClient = require('part:@sanity/base/client')

/**
 * Constants & Defaults
 */

const emptySecrets = {
	storefrontName: '',
	storefrontApiKey: '',
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
	saveSecrets: (Secrets) => Promise<boolean>
	testSecrets: typeof testSecrets
}

export interface ClientContextValue extends SecretUtils {
	secrets: Secrets
	valid: boolean
	ready: boolean
	client: ShopifyClient
}

interface ClientContextProps {
	children: React.ReactNode | ((value: ClientContextValue) => React.ReactNode)
}

interface ClientContextState {
	secrets?: Secrets
	valid: boolean
	ready: boolean
}

export class ClientProvider extends React.Component<
	ClientContextProps,
	ClientContextState
> {
	state = {
		secrets: undefined,
		valid: false,
		ready: false,
	}

	client?: ShopifyClient = undefined

	async componentDidMount() {
		const secrets = await this.fetchSecrets()
		const { valid } = await testSecrets(secrets)
		console.log(secrets, valid)
		if (valid) {
			this.client = createClient(secrets)
			this.setState({ valid: true, ready: true, secrets })
		} else {
			this.setState({ valid: false, ready: true, secrets: emptySecrets })
		}
	}

	fetchSecrets = async (): Promise<Secrets | null> => {
		const results: Secrets[] = await sanityClient.fetch(
			`*[_id == "${KEYS_ID}"]`,
		)
		if (results.length) return results[0]
		return null
	}

	/**
	 * Returns true on success, false otherwise
	 */
	saveSecrets = async (secrets: Secrets): Promise<boolean> => {
		const valid = await testSecrets(secrets)
		if (!valid) return false
		const doc = {
			_id: KEYS_ID,
			_type: KEYS_TYPE,
			...secrets,
		}
		await sanityClient.createOrReplace(doc)
		await this.setState({ secrets })
		return true
	}

	render() {
		const { children } = this.props
		const { secrets, valid, ready } = this.state
		const { saveSecrets, client } = this

		const value = {
			secrets: secrets || emptySecrets,
			valid,
			ready,
			saveSecrets,
			testSecrets,
			client,
		}

		return (
			<ClientContext.Provider value={value}>
				{children instanceof Function ? children(value) : children}
			</ClientContext.Provider>
		)
	}
}
