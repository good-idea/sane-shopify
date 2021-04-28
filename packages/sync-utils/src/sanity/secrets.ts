import { SanityClient } from '@sanity/client'
import { SanityUtils, SaneShopifyConfigDocument } from '@sane-shopify/types'
import { CONFIG_DOC_TYPE } from '../constants'

/**
 * Constants & Defaults
 */

export const createSaveSecrets = (
  client: SanityClient
): SanityUtils['saveSecrets'] => async (secrets: SaneShopifyConfigDocument) => {
  const doc = {
    _id: secrets._id || `secrets.sane-shopify-${secrets.shopName}`,
    _type: CONFIG_DOC_TYPE,
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
): SanityUtils['clearSecrets'] => async (
  secrets: SaneShopifyConfigDocument
) => {
  await client.delete(secrets._id)
}
