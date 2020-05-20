import PQueue from 'p-queue'
import {
  SanityClient,
  SanityUtils,
  LinkOperation,
  SanityPair,
  SanityShopifyDocument,
} from '@sane-shopify/types'

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
  const type = from._type === 'shopifyProduct' ? 'collections' : 'products'
  const keys =
    from._type === 'shopifyProduct' ? 'collectionKeys' : 'productKeys'

  const relationshipsToRemove = arrayify(toRemove)
    .map((itemToRemove) =>
      from[keys].find((reference) => reference._ref === itemToRemove._id)
    )
    .map((reference) => `${type}[_key=="${reference._key}"]`)
  await client
    .patch(from._id)
    // @ts-ignore
    .unset(relationshipsToRemove)
    .commit()

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
  const existingRelationships: SanityShopifyDocument[] = from[aToBKey] || []
  // determine if the FROM doc already has the
  // links in place. If so, skip the patch.
  const alreadyLinked =
    toDocs.length === existingRelationships.length &&
    toDocs.every((toDoc) =>
      Boolean(
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
        existingRelationships.find((er) => toDoc.shopifyId === er.shopifyId)
      )
  )

  if (newLinks.length) {
    const aToBRelationships = toDocs.map((toDoc) => ({
      _type: 'reference',
      _ref: toDoc._id,
      _key: `${toDoc._rev}-${toDoc._id}`,
    }))

    await client
      .patch(from._id)
      .setIfMissing({ [aToBKey]: [] })
      .append(aToBKey, aToBRelationships)
      .commit()
  }

  const archivedRelationships = existingRelationships.filter(
    (er) => er.archived === true
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
        // @ts-ignore
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
