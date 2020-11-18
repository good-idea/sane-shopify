import { SanityClient } from '@sanity/client'
import { SanityUtils, ShopifySecrets } from '@sane-shopify/types'
import { KEYS_ID, KEYS_TYPE } from '../constants'

/**
 * Constants & Defaults
 */

const emptySecrets = {
  shopName: '',
  accessToken: '',
}

export const createSaveSecrets = (
  client: SanityClient
): SanityUtils['saveSecrets'] => async (secrets: ShopifySecrets) => {
  const doc = {
    _id: KEYS_ID,
    _type: KEYS_TYPE,
    ...secrets,
  }
  await client.createIfNotExists(doc)
  await client
    .patch(KEYS_ID)
    .set({ ...secrets })
    .commit()
}

export const createClearSecrets = (
  client: SanityClient
): SanityUtils['clearSecrets'] => async () => {
  await client
    .patch(KEYS_ID)
    .set({
      ...emptySecrets,
    })
    .commit()
}

export const createFetchSecrets = (
  client: SanityClient
): SanityUtils['fetchSecrets'] => async () => {
  const results: ShopifySecrets[] = await client.fetch(`*[_id == "${KEYS_ID}"]`)
  if (results.length) return results[0]
  return emptySecrets
}
