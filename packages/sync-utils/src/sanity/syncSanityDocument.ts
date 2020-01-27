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

const mergeVariantFields = (
  docInfo: any,
  existingDoc: SanityShopifyDocument
) => {
  if (!docInfo.variants) return docInfo
  return {
    ...docInfo,
    variants: docInfo.variants.map((variant) => {
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
    cache.set(doc)
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
      .set(mergeVariantFields(docInfo, existingDoc))
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
