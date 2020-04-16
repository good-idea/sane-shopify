import {
  SanityClient,
  SanityUtils,
  SanityShopifyDocument
} from '@sane-shopify/types'
import { createSyncSanityDocument } from './syncSanityDocument'
import { createFetchRelatedDocs } from './fetchRelatedDocs'
import {
  createSyncRelationships,
  createRemoveRelationships
} from './syncRelationships'
import { createArchiveSanityDocument } from './archive'
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
  getByHandle: (handle: string, type: string) => SanityShopifyDocument | null
  getByShopifyId: (id: string) => SanityShopifyDocument | null
  set: (doc: SanityShopifyDocument) => void
}

const createCache = (): SanityCache => {
  const ids: StringCache<SanityShopifyDocument> = {}
  const collectionHandles: StringCache<SanityShopifyDocument> = {}
  const productHandles: StringCache<SanityShopifyDocument> = {}
  const shopifyIds: StringCache<SanityShopifyDocument> = {}

  const getById = (id: string) => {
    return ids[id] || null
  }

  const getByHandle = (handle: string, type: string) => {
    const handles =
      type === 'collection'
        ? collectionHandles
        : type === 'product'
        ? productHandles
        : null
    if (!handles) throw new Error(`There is no handle cache for type "${type}"`)
    return handles[handle] || null
  }

  const getByShopifyId = (shopifyId: string) => {
    return shopifyIds[shopifyId] || null
  }

  const set = (doc?: SanityShopifyDocument) => {
    if (!doc) return
    ids[doc._id] = doc
    const handles =
      doc._type === 'shopifyCollection'
        ? collectionHandles
        : doc._type === 'shopifyProduct'
        ? productHandles
        : null

    if (!handles)
      throw new Error(`There is no handle cache for type "${doc._type}"`)
    handles[doc.handle] = doc
    if (doc.shopifyId) shopifyIds[doc.shopifyId] = doc
  }

  return {
    getById,
    getByHandle,
    getByShopifyId,
    set
  }
}

export const sanityUtils = (client: SanityClient): SanityUtils => {
  const cache = createCache()

  const fetchAllSanityDocuments = createFetchAll(client, cache)
  const syncSanityDocument = createSyncSanityDocument(client, cache)
  const fetchRelatedDocs = createFetchRelatedDocs(client, cache)
  const syncRelationships = createSyncRelationships(client)
  const removeRelationships = createRemoveRelationships(client)
  const archiveSanityDocument = createArchiveSanityDocument(client)
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
        "collectionKeys": collections[]{
          ...
        },
        "productKeys": products[]{
          ...
        },
        ...
      }[0]`,
      {
        shopifyId
      }
    )
    if (doc) cache.set(doc)
    return doc
  }

  const documentByHandle = async (handle: string, type: string) => {
    const cached = cache.getByHandle(handle, type)
    if (cached) return cached

    const doc = await client.fetch<SanityShopifyDocument>(
      `*[handle == $handle]{
        products[]->,
        collections[]->,
        "collectionKeys": collections[]{
          ...
        },
        "productKeys": products[]{
          ...
        },
        ...
      }[0]`,
      {
        handle
      }
    )
    if (doc) cache.set(doc)
    return doc
  }

  return {
    fetchAllSanityDocuments,
    syncSanityDocument,
    syncRelationships,
    removeRelationships,
    fetchRelatedDocs,
    documentByShopifyId,
    documentByHandle,
    archiveSanityDocument,
    clearSecrets,
    saveSecrets,
    fetchSecrets
  }
}
