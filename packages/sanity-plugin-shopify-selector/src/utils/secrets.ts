// import fetch from 'fetch'
const sanityClient = require('part:@sanity/base/client')
import { createClient } from './request'

const ID = 'secrets.sane-shopify'

export interface Secrets {
	storefrontName: string
	storefrontApiKey: string
}

export interface SecretUtils {
	fetchSecrets: typeof fetchSecrets
	saveSecrets: typeof saveSecrets
	testSecrets: typeof testSecrets
}

export function fetchSecrets(): Secrets {
	return sanityClient.fetch(`*[_id == "${ID}"]`).then(results => {
		if (results.length === 0) return {}
		const result = results[0]
		return result
	})
}

export function saveSecrets(secrets: Secrets): Secrets {
	const { storefrontName, storefrontApiKey } = secrets
	const doc = {
		_id: ID,
		_type: 'sane-shopify.key',
		storefrontName,
		storefrontApiKey,
	}
	return sanityClient.createOrReplace(doc).then(res => {
		return {
			storefrontName,
			storefrontApiKey,
		}
	})
}

const testQuery = /* GraphQL */ `
	{
		shop {
			name
		}
	}
`

export async function testSecrets(
	secrets: Secrets,
): Promise<{ valid: boolean; message?: string }> {
	const { storefrontName, storefrontApiKey } = secrets
	if (!storefrontName.length)
		return { valid: false, message: 'You must provide a Storefront name' }
	if (!storefrontApiKey.length)
		return { valid: false, message: 'You must provide a Storefront API Key' }
	const response = await createClient(secrets)
		.request(testQuery)
		.then(({ data }) => ({
			valid: true,
			message: `🎉 Successfully connected to ${
				data.shop.name
			}. Saving your credentials to Sanity..`,
		}))
		.catch(e => ({
			valid: false,
			message:
				e.message ||
				'There was an error connecting to Shopify. Check your console for more information.',
		}))
	return response
}
