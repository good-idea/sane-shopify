import { Secrets } from './secrets'

const getErrorMessage = (r: Response): string => {
	switch (r.status) {
		case 401:
		case 403:
			return 'Authentication failed. Please make sure you have entered the correct Storefront name and API Key.'
		default:
			return `There was an error connecting to Shopify (${r.status}: ${
				r.statusText
			})`
	}
}

export interface ShopifyClient {
	request: <ResponseType>(query: string) => Promise<ResponseType>
}

export const createClient = (secrets: Secrets): ShopifyClient => {
	const { storefrontName, storefrontApiKey } = secrets
	const url = `https://${storefrontName}.myshopify.com/api/graphql`
	const headers = {
		'Content-Type': 'application/json',
		'X-Shopify-Storefront-Access-Token': storefrontApiKey,
	}

	const request = async <ResponseType>(query: string): Promise<ResponseType> =>
		fetch(url, {
			headers,
			method: 'POST',
			body: JSON.stringify({ query }),
		}).then(async r => {
			if (!r.ok) throw new Error(getErrorMessage(r))
			const json = await r.json()
			return json
		})

	return {
		request,
	}
}
