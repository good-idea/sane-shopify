import {
  SanityClient,
  SanityShopifyDocument,
  ShopifyItem,
  RelatedPairPartial,
  SanityUtils
} from '@sane-shopify/types'
import { SanityCache } from './sanityUtils'

interface CacheResults {
  cachedDocs: SanityShopifyDocument[]
  idsNotInCache: string[]
}

export const createFetchRelatedDocs = (
  client: SanityClient,
  cache: SanityCache
): SanityUtils['fetchRelatedDocs'] => async (
  relatedNodes: ShopifyItem[]
): Promise<RelatedPairPartial[]> => {
  const relatedIds = relatedNodes.map((r) => r.id)
  const { cachedDocs, idsNotInCache } = relatedIds
    .map((id) => ({
      cachedItem: cache.getByShopifyId(id),
      id
    }))
    .reduce<CacheResults>(
      (acc, current) => {
        if (current.cachedItem === null) {
          return {
            ...acc,
            idsNotInCache: [...acc.idsNotInCache, current.id]
          }
        }
        return {
          ...acc,
          cachedDocs: [...acc.cachedDocs, current.cachedItem]
        }
      },
      { cachedDocs: [], idsNotInCache: [] }
    )

  const fetched = idsNotInCache.length
    ? await client.fetch<SanityShopifyDocument[]>(
        `
    *[shopifyId in $relatedIds]{
      products[]->,
      collections[]->,
      ...,
    }`,
        { relatedIds: idsNotInCache }
      )
    : []
  fetched.forEach((doc) => cache.set(doc))
  const relatedDocs = [...cachedDocs, ...fetched]
  const pairs = relatedNodes.map((shopifyNode) => ({
    shopifyNode,
    sanityDocument:
      relatedDocs.find((d) => d.shopifyId === shopifyNode.id) || null
  }))
  return pairs
}
