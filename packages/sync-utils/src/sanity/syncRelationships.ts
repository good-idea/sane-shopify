import { SanityClient } from '@sanity/client'
import PQueue from 'p-queue'
import {
  SanityUtils,
  LinkOperation,
  SanityReference,
  SanityPair,
  SanityShopifyDocument,
} from '@sane-shopify/types'
import { isSanityProduct, isSanityCollection } from '../typeGuards'
// import { log } from '../logger'

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
  const related: SanityReference[] | undefined = isSanityProduct(from)
    ? from.collectionKeys
    : isSanityCollection(from)
    ? from.productKeys
    : []

  if (!related) throw new Error('No related docs were provided')
  const relationshipsToRemove = arrayify(toRemove)
    .map((itemToRemove) =>
      related.find((reference) => reference._ref === itemToRemove._id)
    )
    .map((reference) =>
      reference && isSanityProduct(from)
        ? `collections[_key=="${reference._key}"]`
        : reference && isSanityCollection(from)
        ? `products[_key=="${reference._key}"]`
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

  const existingRelationships: SanityShopifyDocument[] = isSanityProduct(from)
    ? from.collections || []
    : isSanityCollection(from)
    ? from.products || []
    : []

  // determine if the FROM doc already has the
  // links in place. If so, skip the patch.
  const alreadyLinked =
    toDocs.length === existingRelationships.length &&
    toDocs.every((toDoc, index) =>
      Boolean(
        existingRelationships[index] &&
          existingRelationships[index].shopifyId === toDoc.shopifyId
      )
    )

  const bToAKey = from._type === 'shopifyProduct' ? 'products' : 'collections'
  const relationsToLink = toDocs.filter(
    (toDoc) =>
      /* Find all toDocs that do not have a relation to the from doc */
      !toDoc[bToAKey].some(
        (related: SanityShopifyDocument) => related.shopifyId === from.shopifyId
      )
  )
  if (alreadyLinked && relationsToLink.length === 0) {
    return {
      type: 'link',
      sourceDoc: from,
      pairs: toDocs.map((toDoc) => ({ from, to: toDoc })),
    }
  }

  const aToBRelationships = toDocs.map((toDoc) => ({
    _type: 'reference',
    _ref: toDoc._id,
    _key: `${toDoc._rev}-${toDoc._id}`,
  }))

  const aToBPatchKey =
    from._type === 'shopifyProduct' ? 'collections' : 'products'

  await client
    .patch(from._id)
    .set({ [aToBPatchKey]: aToBRelationships })
    .commit()

  const relationshipsToRemove = existingRelationships.reduce<
    SanityShopifyDocument[]
  >((acc, item) => {
    if (item.archived === true || item.shopifyId === null) return [...acc, item]
    if (acc.find((i) => i._id === item._id)) return [...acc, item]
    return acc
  }, [])

  if (relationshipsToRemove.length) {
    const removeRelationships = createRemoveRelationships(client)
    await removeRelationships(from, relationshipsToRemove)
  }

  // Set all reverse relationships
  const rQueue = new PQueue({ concurrency: 1 })

  const pairs: SanityPair[] = await rQueue.addAll(
    relationsToLink.map((toDoc) => async () => {
      const pair = {
        from: from,
        to: toDoc,
      }

      await client
        .patch(toDoc._id)
        .setIfMissing({ [bToAKey]: [] })
        .append(bToAKey, [
          {
            _type: 'reference',
            _ref: from._id,
            _key: `${from._id}-${from._rev}`,
          },
        ])
        .commit()
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
