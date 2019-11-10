import { ShopifyClient, ShopifySecrets } from '@sane-shopify/types'
require('es6-promise').polyfill()
require('isomorphic-fetch')

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

export const createShopifyClient = (secrets: ShopifySecrets): ShopifyClient => {
  const { storefrontName, storefrontApiKey } = secrets
  const url = `https://${storefrontName}.myshopify.com/api/graphql`
  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': storefrontApiKey
  }

  const query = async <ResponseType>(
    queryString: string,
    variables?: Variables
  ): Promise<ResponseType> =>
    fetch(url, {
      headers,
      method: 'POST',
      body: JSON.stringify({ variables, query: queryString })
    }).then(async (r) => {
      if (!r.ok) throw new Error(getErrorMessage(r))
      const json = await r.json()
      return json
    })

  return {
    query
  }
}
