import gql from 'graphql-tag'
import {
  ShopifyClient,
  ShopifyClientConfig,
  Variables
} from '@sane-shopify/types'
import { STOREFRONT_API_VERSION } from './constants'

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

export const createShopifyClient = (
  secrets: ShopifyClientConfig
): ShopifyClient => {
  const { shopName, accessToken } = secrets
  const url = `https://${shopName}.myshopify.com/api/${STOREFRONT_API_VERSION}/graphql`
  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': accessToken
  }

  const query = async <ResponseType>(
    q: string | GraphQLAST,
    variables?: Variables
  ): Promise<ResponseType> => {
    const queryString = typeof q === 'string' ? q : q?.loc.source.body
    return fetch(url, {
      headers,
      method: 'POST',
      body: JSON.stringify({
        variables,
        query: queryString
      })
    }).then(async (r) => {
      if (!r.ok) throw new Error(getErrorMessage(r))
      const json = await r.json()
      return json
    })
  }
  return { query }
}
