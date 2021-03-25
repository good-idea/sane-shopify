import { SanityClient } from '@sanity/client'
import { SanityUtils, ShopifySecrets } from '@sane-shopify/types'
import { KEYS_TYPE } from '../constants'

/**
 * Constants & Defaults
 */

export const createSaveSecrets = (
  client: SanityClient
): SanityUtils['saveSecrets'] => async (secrets: ShopifySecrets) => {
  const doc = {
    _id: secrets._id || `secrets.sane-shopify-${secrets.shopName}`,
    _type: KEYS_TYPE,
    shopName: secrets.shopName,
    accessToken: secrets.accessToken,
  }

  await client.createIfNotExists(doc)
  await client
    .patch(doc._id)
    .set({ ...doc })
    .commit()
}

export const createClearSecrets = (
  client: SanityClient
): SanityUtils['clearSecrets'] => async (secrets: ShopifySecrets) => {
  await client.delete(secrets._id)
}
