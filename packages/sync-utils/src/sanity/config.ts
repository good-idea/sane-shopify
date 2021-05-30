import { SanityClient } from '@sanity/client'
import {
  SanityUtils,
  UpdateConfigDocumentArgs,
  SaneShopifyConfigDocument,
} from '@sane-shopify/types'
import { CONFIG_DOC_ID_PREFIX, CONFIG_DOC_TYPE } from '../constants'

/**
 * Constants & Defaults
 */

export const createSaveConfig = (
  client: SanityClient
): SanityUtils['saveConfig'] => async (
  shopName: string,
  secrets: UpdateConfigDocumentArgs
) => {
  const doc = {
    _id: CONFIG_DOC_ID_PREFIX.concat(shopName),
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

export const createClearConfig = (
  client: SanityClient
): SanityUtils['clearConfig'] => async (shopName: string) => {
  const configDoc = await client.fetch<SaneShopifyConfigDocument>(
    `*[_type == $type && shopName == $shopName][0]`,
    { type: CONFIG_DOC_TYPE, shopName }
  )
  if (!configDoc) {
    throw new Error(
      `Could not find config document for storefront "${shopName}"`
    )
  }
  await client.delete(configDoc._id)
}
