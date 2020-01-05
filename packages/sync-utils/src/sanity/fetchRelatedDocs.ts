import {
  SanityClient,
  SanityShopifyDocument,
  ShopifyItem,
  RelatedPairPartial,
  SanityUtils
} from '@sane-shopify/types'

export const createFetchRelatedDocs = (
  client: SanityClient
): SanityUtils['fetchRelatedDocs'] => async (
  relatedNodes: ShopifyItem[]
): Promise<RelatedPairPartial[]> => {
  const relatedIds = relatedNodes.map((r) => r.id)
  const relatedDocs = await client.fetch<SanityShopifyDocument[]>(
    `
    *[shopifyId in $relatedIds]{
      _id,
      _type,
      _rev,
      shopifyId,
      handle,
      products {
        _ref,
      },
      collections {
        _ref,
      },
    }`,
    { relatedIds }
  )
  const pairs = relatedNodes.map((shopifyNode) => ({
    shopifyNode,
    sanityDocument:
      relatedDocs.find((d) => d.shopifyId === shopifyNode.id) || null
  }))
  return pairs
}
