import gql from 'graphql-tag'
import { DocumentNode } from 'graphql'
import Debug from 'debug'
import {
  ShopifyClient,
  ShopifyItemParams,
  Collection,
  ShopifyMetafieldsConfig,
} from '@sane-shopify/types'
import { mergePaginatedResults, getLastCursor } from '../utils'
import { createCollectionFragment } from './queryFragments'
import { ShopifyCache } from './shopifyUtils'

const log = Debug('sane-shopify:fetching')

const createCollectionByHandle = (
  shopifyConfig: ShopifyMetafieldsConfig
) => gql`
  query CollectionQuery(
    $handle: String!
    $productsFirst: Int!
    $productsAfter: String
  ) {
    collectionByHandle(handle: $handle) {
      ...CollectionFragment
      products(first: $productsFirst, after: $productsAfter) {
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        edges {
          cursor
          node {
            id
            handle
          }
        }
      }
    }
  }
  ${createCollectionFragment(shopifyConfig)}
`

const createCollectionById = (shopifyConfig: ShopifyMetafieldsConfig) => gql`
  query NodeQuery($id: ID!, $productsFirst: Int!, $productsAfter: String) {
    node(id: $id) {
      ... on Collection {
        ...CollectionFragment
        products(first: $productsFirst, after: $productsAfter) {
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
          edges {
            cursor
            node {
              id
              handle
            }
          }
        }
      }
    }
  }
  ${createCollectionFragment(shopifyConfig)}
`
interface ByHandleResult {
  data?: {
    collectionByHandle: Collection
  }
}

const createQueries = (shopifyConfig: ShopifyMetafieldsConfig) => ({
  COLLECTION_BY_ID: createCollectionById(shopifyConfig),
  COLLECTION_BY_HANDLE: createCollectionByHandle(shopifyConfig),
})

const getByHandle = async (
  shopifyClient: ShopifyClient,
  queryString: DocumentNode,
  handle: string,
  productsAfter?: string | number
) => {
  const result = await shopifyClient.query<ByHandleResult>(queryString, {
    handle,
    productsFirst: 50,
    productsAfter,
  })
  return result?.data?.collectionByHandle
}

interface ByIdResult {
  data?: {
    node: Collection
  }
}

const getById = async (
  shopifyClient: ShopifyClient,
  queryString: DocumentNode,
  id: string,
  productsAfter?: string
) => {
  const result = await shopifyClient.query<ByIdResult>(queryString, {
    id,
    productsFirst: 200,
    productsAfter,
  })
  return result?.data?.node
}

export const fetchAllCollectionProducts = async (
  shopifyClient: ShopifyClient,
  metafieldsConfig: ShopifyMetafieldsConfig,
  prevCollection: Collection
): Promise<Collection> => {
  if (!prevCollection.products?.pageInfo?.hasNextPage) {
    log(
      `Fetched all products for collection ${prevCollection.handle}`,
      prevCollection
    )
    return prevCollection
  }

  const productsAfter = getLastCursor(prevCollection.products)

  log(
    `Fetching further products for collection ${prevCollection.handle}`,
    prevCollection
  )
  const { COLLECTION_BY_HANDLE } = createQueries(metafieldsConfig)

  const nextCollection = await getByHandle(
    shopifyClient,
    COLLECTION_BY_HANDLE,
    prevCollection.handle,
    productsAfter ? productsAfter : undefined
  )

  const collection = nextCollection
    ? {
        ...nextCollection,
        products: mergePaginatedResults(
          prevCollection.products,
          nextCollection.products
        ),
      }
    : prevCollection

  if (collection?.products?.pageInfo?.hasNextPage) {
    return fetchAllCollectionProducts(
      shopifyClient,
      metafieldsConfig,
      collection
    )
  }
  log(
    `Fetched all products for collection ${prevCollection.handle}`,
    prevCollection
  )
  return collection
}

/**
 * Fetches a collection from Shopify, with the IDs of all related products
 */

export const createFetchShopifyCollection =
  (
    shopifyClient: ShopifyClient,
    fetchMetafieldsConfig: () => Promise<ShopifyMetafieldsConfig>,
    cache: ShopifyCache
  ) =>
  async (params: ShopifyItemParams): Promise<Collection | null> => {
    const metafieldsConfig = await fetchMetafieldsConfig()
    const { id, handle } = params
    if (!id && !handle) {
      throw new Error('You must provide either an id or handle')
    }

    const cachedCollection = id
      ? cache.getCollectionById(id)
      : handle
      ? cache.getCollectionByHandle(handle)
      : null

    if (cachedCollection) {
      return fetchAllCollectionProducts(
        shopifyClient,
        metafieldsConfig,
        cachedCollection
      )
    }
    const { COLLECTION_BY_ID, COLLECTION_BY_HANDLE } =
      createQueries(metafieldsConfig)

    const fetchedCollection = id
      ? await getById(shopifyClient, COLLECTION_BY_ID, id)
      : handle
      ? await getByHandle(shopifyClient, COLLECTION_BY_HANDLE, handle)
      : null
    if (!fetchedCollection) return null

    const collection = await fetchAllCollectionProducts(
      shopifyClient,
      metafieldsConfig,
      fetchedCollection
    )
    cache.set(collection)
    return collection
  }
