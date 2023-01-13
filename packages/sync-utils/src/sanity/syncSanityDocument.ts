import { SanityClient } from '@sanity/client'
import {
  Collection,
  Product,
  SyncOperation,
  SaneShopifyContext,
  SanityShopifyDocument,
  SanityShopifyDocumentPartial,
  SanityShopifyCollectionDocumentPartial,
  SanityShopifyProductDocumentPartial,
  SanityShopifyProductOptionValue,
} from '@sane-shopify/types'
import deepMerge from 'deepmerge'
import { omit } from 'lodash'
import { definitely, toAdminApiId } from '../utils'
import { prepareDocument, sleep, isMatch, uniqueObjects } from './utils'
import { SanityCache } from './sanityUtils'
import { isSanityProduct, isSanityCollection } from '../typeGuards'
import { toStorefrontId } from '../utils'

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
        media: {
          ...docInfo.sourceData.media,
          edges: uniqueObjects(definitely(docInfo.sourceData.media.edges)),
        },
        images: {
          ...docInfo.sourceData.images,
          edges: uniqueObjects(definitely(docInfo.sourceData.images.edges)),
        },
      },

      options: options.map((updatedOption) => {
        const existingOption = existingDoc.options
          ? existingDoc?.options.find(
              (o) =>
                o._key === updatedOption._key ||
                toAdminApiId(o._key) === updatedOption._key
            )
          : undefined

        const existingOptionValues = existingOption ? existingOption.values : []
        const updatedOptionValues = updatedOption ? updatedOption.values : []

        const values = [...existingOptionValues, ...updatedOptionValues].reduce<
          SanityShopifyProductOptionValue[]
        >((acc, value) => {
          const existsIndex = acc.findIndex((v) => v._key === value._key)

          if (existsIndex > -1) {
            const mergedValue = {
              ...acc[existsIndex],
              ...value,
            }
            return [
              ...acc.slice(0, existsIndex),
              mergedValue,
              ...acc.slice(existsIndex + 1),
            ]
          } else {
            return [...acc, value]
          }
        }, [])

        return {
          ...existingOption,
          ...updatedOption,
          values,
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

export const createSyncSanityDocument =
  (
    client: SanityClient,
    cache: SanityCache,
    shopifyClient: SaneShopifyContext
  ) =>
  async (item: Product | Collection): Promise<SyncOperation> => {
    const { shopName } = shopifyClient

    const getSanityDocByShopifyId = async (
      id: string
    ): Promise<SanityShopifyDocument | void> => {
      const shopifyId = toStorefrontId(id)
      const adminApiId = toAdminApiId(id)

      const cached = cache.getByShopifyId(shopifyId)
      if (cached) return cached

      const doc = await client.fetch<SanityShopifyDocument>(
        `
      *[shopifyId == $shopifyId || shopifyId == $adminApiId]{
        ...,
        products[]->{
          "collectionRefs": collections[],
          ...
        },
        collections[]->{
          "productRefs": products[],
          ...
        },
        "collectionRefs": collections[],
        "productRefs": products[],
      }[0]`,
        {
          shopifyId,
          adminApiId,
        }
      )
      if (doc) cache.set(doc)
      return doc
    }

    const syncItem = async (
      item: Product | Collection,
      shopName: string
    ): Promise<SyncOperation> => {
      const docInfo = prepareDocument({ ...item, shopName })
      const existingDoc = await getSanityDocByShopifyId(item.id)

      /* If the document exists and is up to date, skip */
      if (
        existingDoc &&
        isMatch(docInfo, existingDoc, {
          keys: [
            '_type',
            'handle',
            'shopifyId',
            'title',
            'minVariantPrice',
            'maxVariantPrice',
            'sourceData',
            'options',
            'variants',
          ],
        })
      ) {
        return {
          type: 'skip' as const,
          sanityDocument: existingDoc,
          shopifySource: item,
        }
      }

      /* Rate limit */
      await sleep(201)

      /* Create a new document if none exists */
      if (!existingDoc) {
        const newDoc = await client.create<SanityShopifyDocumentPartial>(
          docInfo
        )
        const refetchedDoc = await getSanityDocByShopifyId(newDoc.shopifyId)
        if (!refetchedDoc) {
          throw new Error(
            `Could not fetch updated document with shopifyId ${newDoc.shopifyId}`
          )
        }

        cache.set(refetchedDoc)
        return {
          type: 'create' as const,
          // @ts-ignore
          sanityDocument: newDoc,
          shopifySource: item,
        }
      }

      /* Otherwise, update the existing doc */

      const patchData = omit(mergeExistingFields(docInfo, existingDoc), [
        'products',
        'collections',
        'productRefs',
        'collectionRefs',
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
        type: 'update' as const,
        sanityDocument: refetchedDoc,
        shopifySource: item,
      }
    }

    return syncItem(item, shopName)
  }
