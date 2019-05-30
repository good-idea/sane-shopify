import { createClient } from '../shopifyClient'
import { Secrets } from '../types'

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

export const testSecrets = async (secrets?: Secrets): Promise<TestResponse> => {
  if (!secrets)
    return {
      valid: false,
      message: 'You must provide an API Key and Storefront Name'
    }
  const { storefrontName, storefrontApiKey } = secrets
  if (!storefrontName.length) return { valid: false, message: 'You must provide a Storefront name' }
  if (!storefrontApiKey.length)
    return { valid: false, message: 'You must provide a Storefront API Key' }
  const response = await createClient(secrets)
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
