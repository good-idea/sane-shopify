import * as React from 'react'
import { createClient, ShopifyClient } from './shopifyClient'
import { testSecrets } from './utils'
import { Secrets } from '../types'
import { Sync } from '../ShopifyTool/Sync'

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
	clearSecrets: () => Promise<void>
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

export class Provider extends React.Component<
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
		await sanityClient.createIfNotExists(doc)
		await sanityClient
			.patch(KEYS_ID)
			.set({ ...secrets })
			.commit()
		await this.setState({ secrets })
		return true
	}

	clearSecrets = async (): Promise<boolean> => {
		await sanityClient
			.patch(KEYS_ID)
			.set({
				...emptySecrets,
			})
			.commit()
		await this.setState({ valid: false })
		return true
	}

	render() {
		const { children } = this.props
		const { secrets, valid, ready } = this.state
		const { saveSecrets, clearSecrets, client } = this

		const value = {
			secrets: secrets || emptySecrets,
			valid,
			ready,
			saveSecrets,
			testSecrets,
			clearSecrets,
			client,
		}

		return (
			<ClientContext.Provider value={value}>
				{children instanceof Function ? children(value) : children}
			</ClientContext.Provider>
		)
	}
}
