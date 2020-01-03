import { SanityClient, SanityUtils, SanityDocument } from '@sane-shopify/types'
import { createSyncSanityDocument } from './syncSanityDocument'
import { createFetchRelatedDocs } from './fetchRelatedDocs'
import { createSyncRelationships } from './syncRelationships'

export const sanityUtils = (client: SanityClient): SanityUtils => {
  const syncSanityDocument = createSyncSanityDocument(client)
  const fetchRelatedDocs = createFetchRelatedDocs(client)
  const syncRelationships = createSyncRelationships(client)

  const documentByShopifyId = (shopifyId: string) =>
    client.fetch<SanityDocument>(`*[shopifyId = $shopifyId][0]`, { shopifyId })

  return {
    syncSanityDocument,
    syncRelationships,
    fetchRelatedDocs,
    documentByShopifyId
  }
}
