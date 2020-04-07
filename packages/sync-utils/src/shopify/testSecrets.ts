import { ShopifySecrets, TestSecretsResponse } from '@sane-shopify/types'
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

export const testSecrets = async (
  secrets?: ShopifySecrets
): Promise<TestSecretsResponse> => {
  if (!secrets)
    return {
      isError: false,
      message: 'You must provide an API Key and Storefront Name'
    }
  const { shopName, accessToken } = secrets
  if (!shopName || !shopName.length)
    return { isError: true, message: 'You must provide a Storefront name' }
  if (!accessToken || !accessToken.length)
    return { isError: true, message: 'You must provide a Storefront API Key' }
  try {
    const client = createShopifyClient(secrets)
    const response = await client.query<TestData>(testQuery).then(() => ({
      isError: false,
      message: `Successfully connected to ${shopName}`
    }))
    return response
  } catch (e) {
    return {
      isError: true,
      message:
        e.message ||
        'There was an error connecting to Shopify. Check your console for more information.'
    }
  }
}
