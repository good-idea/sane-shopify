import { Secrets } from '../types'
import { createClient } from './shopifyClient'

/**
 * Utilities
 */

const testQuery = /* GraphQL */ `
	{
		shop {
			name
		}
	}
`

interface TestData {
	shop: {
		name: string
	}
}

export const testSecrets = async (
	secrets?: Secrets,
): Promise<{ valid: boolean; message?: string; data?: TestData }> => {
	if (!secrets)
		return {
			valid: false,
			message: 'You must provide an API Key and Storefront Name',
		}
	const { storefrontName, storefrontApiKey } = secrets
	if (!storefrontName.length)
		return { valid: false, message: 'You must provide a Storefront name' }
	if (!storefrontApiKey.length)
		return { valid: false, message: 'You must provide a Storefront API Key' }
	const response = await createClient(secrets)
		.query<TestData>(testQuery)
		.then(({ data }) => ({
			valid: true,
			message: `🎉 Successfully connected to ${
				data.shop.name
			}. Saving your credentials to Sanity..`,
			data,
		}))
		.catch(e => ({
			valid: false,
			message:
				e.message ||
				'There was an error connecting to Shopify. Check your console for more information.',
		}))
	return response
}
