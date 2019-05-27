import { ShopifyClient } from '@sane-shopify/types'
import { Secrets } from './types'

type Variables = object

const getErrorMessage = (r: Response): string => {
  switch (r.status) {
    case 401:
    case 403:
      return 'Authentication failed. Please make sure you have entered the correct Storefront name and API Key.'
    default:
      return `There was an error connecting to Shopify (${r.status}: ${r.statusText})`
  }
}

export const createClient = (secrets: Secrets): ShopifyClient => {
  const { storefrontName, storefrontApiKey } = secrets
  const url = `https://${storefrontName}.myshopify.com/api/graphql`
  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': storefrontApiKey,
  }

  const query = async <ResponseType>(queryString: string, variables?: Variables): Promise<ResponseType> =>
    fetch(url, {
      headers,
      method: 'POST',
      body: JSON.stringify({ query: queryString, variables }),
    }).then(async (r) => {
      if (!r.ok) throw new Error(getErrorMessage(r))
      const json = await r.json()
      return json
    })

  return {
    query,
  }
}
