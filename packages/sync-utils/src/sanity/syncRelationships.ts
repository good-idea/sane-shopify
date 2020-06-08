import PQueue from 'p-queue'
import {
  SanityClient,
  SanityUtils,
  LinkOperation,
  SanityPair,
  SanityShopifyDocument,
} from '@sane-shopify/types'
import { isSanityProduct, isSanityCollection } from '../typeGuards'
import { definitely } from '../utils'

const arrayify = <T>(i: T | T[]) => (Array.isArray(i) ? i : [i])

const removeDraftId = (doc: SanityShopifyDocument): SanityShopifyDocument => ({
  ...doc,
  _id: doc._id.replace(/^drafts\./, ''),
})

export const createRemoveRelationships = (
  client: SanityClient
): SanityUtils['removeRelationships'] => async (
  from: SanityShopifyDocument,
  toRemove: SanityShopifyDocument | SanityShopifyDocument[]
): Promise<null> => {
  const related = isSanityProduct(from)
    ? from.collections
    : isSanityCollection(from)
    ? from.products
    : []

  const relationshipsToRemove = arrayify(toRemove)
    .map((itemToRemove) =>
      // @ts-ignore
      related.find((reference) => reference._ref === itemToRemove._id)
    )
    .map((reference) =>
      reference && isSanityProduct(from)
        ? `collections[_key=="${reference._key}"]`
        : reference && isSanityCollection(from)
        ? `products[_key=${reference._key}]`
        : ''
    )
    .filter(Boolean)

  await client.patch(from._id).unset(relationshipsToRemove).commit()
  return null
}

export const createSyncRelationships = (
  client: SanityClient
): SanityUtils['syncRelationships'] => async (
  from: SanityShopifyDocument,
  to: SanityShopifyDocument | SanityShopifyDocument[]
): Promise<LinkOperation> => {
  const toDocs = arrayify(to).map(removeDraftId)

  const aToBKey = from._type === 'shopifyProduct' ? 'collections' : 'products'
  const existingRelationships = isSanityProduct(from)
    ? from.collections || []
    : isSanityCollection(from)
    ? from.products || []
    : []
  // determine if the FROM doc already has the
  // links in place. If so, skip the patch.
  const alreadyLinked =
    toDocs.length === existingRelationships.length &&
    toDocs.every((toDoc) =>
      Boolean(
        // @ts-ignore
        existingRelationships.find((er) => toDoc.shopifyId === er.shopifyId)
      )
    )

  if (alreadyLinked) {
    return {
      type: 'link',
      sourceDoc: from,
      pairs: toDocs.map((toDoc) => ({ from, to: toDoc })),
    }
  }

  const newLinks = toDocs.filter(
    (toDoc) =>
      !Boolean(
        // @ts-ignore
        existingRelationships.find((er) => toDoc.shopifyId === er.shopifyId)
      )
  )

  if (newLinks.length) {
    const aToBRelationships = toDocs
      .map((toDoc) => ({
        _type: 'reference',
        _ref: toDoc._id,
        _key: `${toDoc._rev}-${toDoc._id}`,
      }))
      .filter(
        // @ts-ignore
        (toDoc) => !existingRelationships.some((er) => er._id === toDoc._ref)
      )

    await client
      .patch(from._id)
      .setIfMissing({ [aToBKey]: [] })
      .append(aToBKey, aToBRelationships)
      .commit()
  }

  // @ts-ignore
  const archivedRelationships = existingRelationships.filter(
    // @ts-ignore
    (er) => er.archived === true || er.shopifyId === null
  )

  if (archivedRelationships.length) {
    const removeRelationships = createRemoveRelationships(client)
    await removeRelationships(from, archivedRelationships)
  }

  const bToAKey = from._type === 'shopifyProduct' ? 'products' : 'collections'

  const rQueue = new PQueue({ concurrency: 1 })

  const pairs: SanityPair[] = await rQueue.addAll(
    newLinks.map((toDoc) => async () => {
      const pair = {
        from: from,
        to: toDoc,
      }

      client
        .patch(toDoc._id)
        .setIfMissing({ [bToAKey]: [] })
        .append(bToAKey, [
          {
            _type: 'reference',
            _ref: from._id,
            key: `${from._id}-${from._rev}`,
          },
        ])
      return pair
    })
  )
  const linkOperation: LinkOperation = {
    type: 'link' as 'link',
    sourceDoc: from,
    pairs,
  }

  return linkOperation
}
