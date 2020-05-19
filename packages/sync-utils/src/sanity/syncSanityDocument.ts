import {
  Collection,
  Product,
  SanityClient,
  SyncOperation,
  SanityShopifyDocument,
} from '@sane-shopify/types'
import deepMerge from 'deepmerge'
import { omit } from 'lodash'
import { prepareDocument, sleep, isMatch, uniqueObjects } from './utils'
import { SanityCache } from './sanityUtils'

const mergeExistingFields = (
  docInfo: any,
  existingDoc: SanityShopifyDocument
): SanityShopifyDocument => {
  // @ts-ignore
  const merged = deepMerge(docInfo, existingDoc)
  if (existingDoc._type !== 'shopifyProduct') {
    return {
      ...merged,
      sourceData: {
        ...docInfo.sourceData,
        products: {
          ...docInfo.sourceData.products,
          edges: uniqueObjects(docInfo.sourceData.products.edges),
        },
      },
    }
  }
  const variants = docInfo.variants || []
  const options = docInfo.options || []
  return {
    ...merged,
    sourceData: {
      ...docInfo.sourceData,
      collections: {
        ...docInfo.sourceData.collections,
        edges: uniqueObjects(docInfo.sourceData.collections.edges),
      },
      images: {
        ...docInfo.sourceData.images,
        edges: uniqueObjects(docInfo.sourceData.images.edges),
      },
    },

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
            ...updatedOptionValue,
          }
        }),
      }
    }),

    variants: variants.map((variant) => {
      const existingVariant = existingDoc.variants
        ? existingDoc.variants.find((v) => v.id === variant.id) || {}
        : {}

      return {
        ...existingVariant,
        ...variant,
      }
    }),
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
        keys: ['title', 'handle', 'shopifyId', 'sourceData', '_type'],
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
      const newDoc = await client.create<SanityShopifyDocument>(docInfo)
      const refetchedDoc = await getSanityDocByShopifyId(newDoc.shopifyId)
      if (!refetchedDoc) {
        throw new Error(
          `Could not fetch updated document with shopifyId ${newDoc.shopifyId}`
        )
      }

      cache.set(refetchedDoc)
      return {
        type: 'create' as 'create',
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
      .patch<SanityShopifyDocument>(existingDoc._id)
      .set(patchData)
      .commit()

    if (
      existingDoc._type === 'shopifyCollection' &&
      (existingDoc.variants || existingDoc.options)
    ) {
      await client
        .patch(existingDoc._id)
        .unset(['variants', 'options'])
        .commit()
    }

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
