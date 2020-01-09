import PQueue from 'p-queue'
import {
  SanityClient,
  SanityUtils,
  SanityPair,
  SanityShopifyDocument
} from '@sane-shopify/types'

export const createSyncRelationships = (
  client: SanityClient
): SanityUtils['syncRelationships'] => async (
  from: SanityShopifyDocument,
  to: SanityShopifyDocument | SanityShopifyDocument[]
): Promise<SanityPair[]> => {
  const toDocs = Array.isArray(to) ? to : [to]

  const aToBKey = from._type === 'shopifyProduct' ? 'collections' : 'products'
  const aToBRelationships = toDocs.map((toDoc) => ({
    _type: 'reference',
    _ref: toDoc._id,
    _key: `${toDoc._rev}-${toDoc._id}`
  }))

  // Set up the A to B patch, but do not commit yet
  await client
    .patch(from._id)
    .set({ [aToBKey]: aToBRelationships })
    .commit()

  const bToAKey = from._type === 'shopifyProduct' ? 'products' : 'collections'

  const rQueue = new PQueue({ concurrency: 1 })

  return rQueue.addAll(
    toDocs.map((toDoc) => async () => {
      const relationships =
        toDoc._type === 'shopifyCollection' ? toDoc.products : toDoc.collections
      const pair = {
        from: from,
        to: toDoc
      }

      if (relationships && relationships.find(({ _id }) => _id === from._id)) {
        // If the relationship is already set, just return as is
        return pair
      }
      await client
        // @ts-ignore
        .patch(toDoc._id)
        // @ts-ignore
        .setIfMissing({ [bToAKey]: [] })
        .append(bToAKey, [
          {
            _type: 'reference',
            _ref: from._id,
            key: `${from._id}-${from._rev}`
          }
        ])
      return pair
    })
  )
}
