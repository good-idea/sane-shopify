import {
  Collection,
  Product,
  SanityClient,
  SyncOperation,
  SanityShopifyDocument,
  SanityShopifyDocumentPartial,
  SanityShopifyCollectionDocumentPartial,
  SanityShopifyProductDocumentPartial,
} from '@sane-shopify/types'
import deepMerge from 'deepmerge'
import { omit } from 'lodash'
import { definitely } from '../utils'
import { prepareDocument, sleep, isMatch, uniqueObjects } from './utils'
import { SanityCache } from './sanityUtils'
import { isSanityProduct, isSanityCollection } from '../typeGuards'

const mergeExistingFields = (
  docInfo: SanityShopifyDocumentPartial,
  existingDoc: SanityShopifyDocumentPartial
): SanityShopifyDocumentPartial => {
  if (isSanityCollection(docInfo) && isSanityCollection(existingDoc)) {
    const merged = deepMerge(existingDoc, docInfo)
    const doc: SanityShopifyCollectionDocumentPartial = {
      ...merged,
      sourceData: {
        ...docInfo.sourceData,
        products: {
          ...docInfo.sourceData.products,
          edges: uniqueObjects(definitely(docInfo.sourceData.products.edges)),
        },
      },
    }
    return doc
  }
  if (isSanityProduct(docInfo) && isSanityProduct(existingDoc)) {
    const merged = deepMerge(existingDoc, docInfo)
    const variants = docInfo.variants || []
    const options = docInfo.options || []
    const doc: SanityShopifyProductDocumentPartial = {
      ...merged,
      sourceData: {
        ...docInfo.sourceData,
        collections: {
          ...docInfo.sourceData.collections,
          edges: uniqueObjects(
            definitely(docInfo?.sourceData?.collections?.edges)
          ),
        },
        images: {
          ...docInfo.sourceData.images,
          edges: uniqueObjects(definitely(docInfo.sourceData.images.edges)),
        },
      },

      options: options.map((updatedOption) => {
        const existingOption = existingDoc.options
          ? existingDoc?.options.find((o) => o._key === updatedOption._key)
          : undefined

        const existingOptionValues = existingOption ? existingOption.values : []

        return {
          ...existingOption,
          ...updatedOption,
          values: updatedOption.values.map((updatedOptionValue) => {
            const existingOptionValue = existingOptionValues.find(
              (v) => v._key === updatedOptionValue._key
            )
            return {
              ...existingOptionValue,
              ...updatedOptionValue,
            }
          }),
        }
      }),

      variants: variants.map((variant) => {
        const existingVariant = existingDoc.variants
          ? existingDoc.variants.find(
              (v) => v.shopifyVariantID === variant.shopifyVariantID
            ) || {}
          : {}

        return {
          ...existingVariant,
          ...variant,
        }
      }),
    }
    return doc
  }
  throw new Error(
    `The document with the shopifyId "${existingDoc.shopifyId}" could not be merged. Be sure that the document includes a _type property`
  )
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
      `
      *[shopifyId == $shopifyId]{
        products[]->,
        collections[]->,
        "collectionKeys": collections[]{
          ...
        },
        "productKeys": products[]{
          ...
        },
        ...
      }[0]`,
      {
        shopifyId,
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
    if (
      existingDoc &&
      isMatch(docInfo, existingDoc, {
        keys: [
          '_type',
          'title',
          'handle',
          'shopifyId',
          'minVariantPrice',
          'maxVariantPrice',
          'sourceData',
          'options',
          'variants',
        ],
      })
    ) {
      return {
        type: 'skip' as 'skip',
        sanityDocument: existingDoc,
        shopifySource: item,
      }
    }

    /* Rate limit */
    await sleep(201)

    /* Create a new document if none exists */
    if (!existingDoc) {
      const newDoc = await client.create<SanityShopifyDocumentPartial>(docInfo)
      const refetchedDoc = await getSanityDocByShopifyId(newDoc.shopifyId)
      if (!refetchedDoc) {
        throw new Error(
          `Could not fetch updated document with shopifyId ${newDoc.shopifyId}`
        )
      }

      cache.set(refetchedDoc)
      return {
        type: 'create' as 'create',
        // @ts-ignore
        sanityDocument: newDoc,
        shopifySource: item,
      }
    }

    /* Otherwise, update the existing doc */

    const patchData = omit(mergeExistingFields(docInfo, existingDoc), [
      'products',
      'collections',
      'productKeys',
      'collectionKeys',
    ])

    const updatedDoc = await client
      .patch(existingDoc._id)
      .set(patchData)
      .commit()

    const refetchedDoc = await getSanityDocByShopifyId(updatedDoc.shopifyId)
    if (!refetchedDoc) {
      throw new Error(
        `Could not fetch updated document with shopifyId ${updatedDoc.shopifyId}`
      )
    }

    cache.set(refetchedDoc)

    return {
      type: 'update' as 'update',
      sanityDocument: refetchedDoc,
      shopifySource: item,
    }
  }

  return syncItem(item)
}
