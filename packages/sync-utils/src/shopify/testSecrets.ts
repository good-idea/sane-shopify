import { ShopifyClientConfig } from '@sane-shopify/types'
import { createShopifyClient } from './createShopifyClient'

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
  data: {
    shop: {
      name: string
    }
  }
}

interface TestResponse {
  valid: boolean
  data?: TestData
  message?: string
}

export const testSecrets = async (
  secrets?: ShopifyClientConfig
): Promise<TestResponse> => {
  if (!secrets)
    return {
      valid: false,
      message: 'You must provide an API Key and Storefront Name'
    }
  const { shopName, accessToken } = secrets
  if (!shopName || !shopName.length)
    return { valid: false, message: 'You must provide a Storefront name' }
  if (!accessToken || !accessToken.length)
    return { valid: false, message: 'You must provide a Storefront API Key' }
  const response = await createShopifyClient(secrets)
    .query<TestData>(testQuery)
    .then((data) => ({
      data,
      valid: true
    }))
    .catch((e) => ({
      valid: false,
      message:
        e.message ||
        'There was an error connecting to Shopify. Check your console for more information.'
    }))
  return response
}
