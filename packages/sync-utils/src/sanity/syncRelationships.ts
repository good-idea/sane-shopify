import PQueue from 'p-queue'
import {
  SanityClient,
  SanityUtils,
  LinkOperation,
  SanityPair,
  SanityShopifyDocument
} from '@sane-shopify/types'
import { SanityCache } from './sanityUtils'

const arrayify = <T>(i: T | T[]) => (Array.isArray(i) ? i : [i])

const removeDraftId = (doc: SanityShopifyDocument): SanityShopifyDocument => ({
  ...doc,
  _id: doc._id.replace(/^drafts\./, '')
})

export const createSyncRelationships = (
  client: SanityClient,
  cache: SanityCache
): SanityUtils['syncRelationships'] => async (
  from: SanityShopifyDocument,
  to: SanityShopifyDocument | SanityShopifyDocument[]
): Promise<LinkOperation> => {
  const toDocs = arrayify(to).map(removeDraftId)

  const aToBKey = from._type === 'shopifyProduct' ? 'collections' : 'products'
  const aToBRelationships = toDocs.map((toDoc) => ({
    _type: 'reference',
    _ref: toDoc._id,
    _key: `${toDoc._rev}-${toDoc._id}`
  }))

  // determine if the FROM doc already has the
  // links in place. If so, skip the patch.
  const existingLinks: SanityShopifyDocument[] = from[aToBKey]
  const alreadyLinked = existingLinks
    ? toDocs.reduce<boolean>(
        (prev: boolean, current: SanityShopifyDocument) => {
          if (prev === false) return false
          return existingLinks.some((l) => l._id === current._id)
        },
        true
      )
    : false

  if (alreadyLinked) {
    const pairs = toDocs.map((toDoc) => ({
      from: from,
      to: toDoc
    }))
    return {
      type: 'link' as 'link',
      sourceDoc: from,
      pairs
    }
  }

  await client
    .patch(from._id)
    .set({ [aToBKey]: aToBRelationships })
    .commit()

  const bToAKey = from._type === 'shopifyProduct' ? 'products' : 'collections'

  const rQueue = new PQueue({ concurrency: 1 })

  const pairs: SanityPair[] = await rQueue.addAll(
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
  const linkOperation: LinkOperation = {
    type: 'link' as 'link',
    sourceDoc: from,
    pairs
  }

  return linkOperation
}
