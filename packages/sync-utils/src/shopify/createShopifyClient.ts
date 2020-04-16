import { ShopifyClient, ShopifySecrets, Variables } from '@sane-shopify/types'
import { DocumentNode } from 'graphql'

const getErrorMessage = (r: Response): string => {
  switch (r.status) {
    case 401:
    case 403:
      return 'Authentication failed. Please make sure you have entered the correct Storefront name and API Key.'
    default:
      return `There was an error connecting to Shopify (${r.status}: ${r.statusText})`
  }
}

interface GraphQLAST {
  loc: {
    source: {
      body: string
    }
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const deduplicateFragments = (queryString: string | undefined) => {
  if (!queryString) throw new Error('No query string provided')
  queryString
    .split(/\n\s+\n/)
    .map((group) => group.replace(/^([\n\s])+/, '').replace(/\n+$/, ''))
    .reduce<string[]>((acc, current) => {
      if (acc.includes(current)) return acc
      return [...acc, current]
    }, [])
    .join('\n\n')
}
export const createShopifyClient = (secrets: ShopifySecrets): ShopifyClient => {
  if (!secrets) {
    return {
      query: async () => {
        throw new Error(
          'You must provide a shopify storefront name and access token'
        )
      },
    }
  }
  const { shopName, accessToken } = secrets
  // const url = `https://${shopName}.myshopify.com/api/${STOREFRONT_API_VERSION}/graphql`
  const url = `https://${shopName}.myshopify.com/api/graphql`
  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': accessToken,
  }

  let lastRequestTime = new Date().getTime()

  const query = async <ResponseType>(
    q: string | DocumentNode,
    variables?: Variables
  ): Promise<ResponseType> => {
    const queryString =
      typeof q === 'string' ? q : deduplicateFragments(q?.loc?.source.body)

    // Rate limit to 2 requests per second.
    // Shopify's limits are "leaky bucket" so this could be improved.
    // https://help.shopify.com/en/api/storefront-api/getting-started#storefront-api-rate-limits
    const now = new Date().getTime()
    const timeSinceLastRequest = now - lastRequestTime
    if (timeSinceLastRequest > 500) await sleep(timeSinceLastRequest)

    lastRequestTime = now

    return fetch(url, {
      headers,
      method: 'POST',
      body: JSON.stringify({
        variables,
        query: queryString,
      }),
    }).then(async (r) => {
      if (!r.ok) {
        throw new Error(getErrorMessage(r))
      }
      const json = await r.json()
      return json
    })
  }
  return { query }
}
