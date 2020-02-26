import {
  Collection,
  Product,
  SanityClient,
  SyncOperation,
  SanityShopifyDocument
} from '@sane-shopify/types'
import { isMatch } from 'lodash'
import { prepareDocument, sleep } from './utils'
import { SanityCache } from './sanityUtils'

const mergeExistingFields = (
  docInfo: any,
  existingDoc: SanityShopifyDocument
) => {
  const variants = docInfo.variants || []
  const options = docInfo.options || []
  console.log(docInfo, existingDoc)
  return {
    ...docInfo,
    options: options.map((updatedOption) => {
      const existingOption = existingDoc.options
        ? existingDoc.options.find((o) => o._key === updatedOption._key) || {}
        : {}

      const existingOptionValues = existingOption.values || []

      return {
        ...existingOption,
        ...updatedOption,
        values: updatedOption.values.map((updatedOptionValue) => {
          const existingOptionValue = existingOptionValues.find(
            (v) => v._key === updatedOptionValue._key
          )
          return {
            ...existingOptionValue,
            ...updatedOptionValue
          }
        })
      }
    }),

    variants: variants.map((variant) => {
      const existingVariant = existingDoc.variants
        ? existingDoc.variants.find((v) => v.id === variant.id) || {}
        : {}

      return {
        ...existingVariant,
        ...variant
      }
    })
  }
}

export const createSyncSanityDocument = (
  client: SanityClient,
  cache: SanityCache
) => async (item: Product | Collection): Promise<SyncOperation> => {
  const getSanityDocByShopifyId = async (
    shopifyId: string
  ): Promise<SanityShopifyDocument | void> => {
    const cached = cache.getByShopifyId(shopifyId)
    if (cached) return cached

    const doc = await client.fetch<SanityShopifyDocument>(
      `*[shopifyId == $shopifyId]{
        products[]->,
        collections[]->,
        ...
      }[0]`,
      {
        shopifyId
      }
    )
    if (doc) cache.set(doc)
    return doc
  }

  const syncItem = async (
    item: Product | Collection
  ): Promise<SyncOperation> => {
    const docInfo = prepareDocument(item)
    const existingDoc = await getSanityDocByShopifyId(item.id)

    /* If the document exists and is up to date, skip */
    if (existingDoc && isMatch(existingDoc, docInfo)) {
      return {
        type: 'skip' as 'skip',
        sanityDocument: existingDoc,
        shopifySource: item
      }
    }

    /* Rate limit */
    await sleep(201)

    /* Create a new document if none exists */
    if (!existingDoc) {
      const newDoc = await client.create<SanityShopifyDocument>(docInfo)
      cache.set(newDoc)
      return {
        type: 'create' as 'create',
        sanityDocument: newDoc,
        shopifySource: item
      }
    }

    /* Otherwise, update the existing doc */

    const updatedDoc = await client
      .patch<SanityShopifyDocument>(existingDoc._id)
      .set(mergeExistingFields(docInfo, existingDoc))
      .commit()

    cache.set(updatedDoc)

    return {
      type: 'update' as 'update',
      sanityDocument: updatedDoc,
      shopifySource: item
    }
  }
  return syncItem(item)
}
