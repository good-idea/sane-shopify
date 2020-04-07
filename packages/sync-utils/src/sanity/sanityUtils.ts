import {
  SanityClient,
  SanityUtils,
  SanityShopifyDocument
} from '@sane-shopify/types'
import { createSyncSanityDocument } from './syncSanityDocument'
import { createFetchRelatedDocs } from './fetchRelatedDocs'
import { createSyncRelationships } from './syncRelationships'
import { createFetchAll } from './fetchAll'
import {
  createFetchSecrets,
  createSaveSecrets,
  createClearSecrets
} from './secrets'

interface StringCache<NodeType> {
  [key: string]: NodeType | null
}

export interface SanityCache {
  getById: (id: string) => SanityShopifyDocument | null
  getByShopifyId: (id: string) => SanityShopifyDocument | null
  set: (doc: SanityShopifyDocument) => void
}

const createCache = (): SanityCache => {
  const ids: StringCache<SanityShopifyDocument> = {}
  const shopifyIds: StringCache<SanityShopifyDocument> = {}

  const getById = (id: string) => {
    return ids[id] || null
  }

  const getByShopifyId = (shopifyId: string) => {
    return shopifyIds[shopifyId] || null
  }

  const set = (doc?: SanityShopifyDocument) => {
    if (!doc) return
    ids[doc._id] = doc
    if (doc.shopifyId) shopifyIds[doc.shopifyId] = doc
  }

  return {
    getById,
    getByShopifyId,
    set
  }
}

export const sanityUtils = (client: SanityClient): SanityUtils => {
  const cache = createCache()

  const fetchAllSanityDocuments = createFetchAll(client, cache)
  const syncSanityDocument = createSyncSanityDocument(client, cache)
  const fetchRelatedDocs = createFetchRelatedDocs(client, cache)
  const syncRelationships = createSyncRelationships(client, cache)
  const clearSecrets = createClearSecrets(client)
  const saveSecrets = createSaveSecrets(client)
  const fetchSecrets = createFetchSecrets(client)

  const documentByShopifyId = async (shopifyId: string) => {
    const cached = cache.getByShopifyId(shopifyId)
    if (cached) return cached

    const doc = await client.fetch<SanityShopifyDocument>(
      `*[shopifyId == $shopifyId]{
        products[]->,
        collections[]->,
        ...
      }[0]`,
      {
        shopifyId
      }
    )
    if (doc) cache.set(doc)
    return doc
  }

  return {
    fetchAllSanityDocuments,
    syncSanityDocument,
    syncRelationships,
    fetchRelatedDocs,
    documentByShopifyId,
    clearSecrets,
    saveSecrets,
    fetchSecrets
  }
}
