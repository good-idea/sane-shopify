import gql from 'graphql-tag'
import { DocumentNode } from 'graphql'
import Debug from 'debug'
import {
  ShopifyClient,
  ShopifyItemParams,
  Collection,
  ShopifyConfig,
} from '@sane-shopify/types'
import { mergePaginatedResults, getLastCursor } from '../utils'
import { createCollectionFragment } from './queryFragments'
import { ShopifyCache } from './shopifyUtils'

const log = Debug('sane-shopify:fetching')

const createCollectionByHandle = (shopifyConfig?: ShopifyConfig) => gql`
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

const createCollectionById = (shopifyConfig?: ShopifyConfig) => gql`
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

const createQueries = (shopifyConfig?: ShopifyConfig) => ({
  COLLECTION_BY_ID: createCollectionById(shopifyConfig),
  COLLECTION_BY_HANDLE: createCollectionByHandle(shopifyConfig),
})

const getByHandle = async (
  query: ShopifyClient['query'],
  queryString: DocumentNode,
  handle: string,
  productsAfter?: string | number
) => {
  const result = await query<ByHandleResult>(queryString, {
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
  query: ShopifyClient['query'],
  queryString: DocumentNode,
  id: string,
  productsAfter?: string
) => {
  const result = await query<ByIdResult>(queryString, {
    id,
    productsFirst: 200,
    productsAfter,
  })
  return result?.data?.node
}

export const fetchAllCollectionProducts = async (
  query: ShopifyClient['query'],
  prevCollection: Collection,
  shopifyConfig?: ShopifyConfig
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
  const { COLLECTION_BY_HANDLE } = createQueries(shopifyConfig)

  const nextCollection = await getByHandle(
    query,
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
    return fetchAllCollectionProducts(query, collection)
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
    query: ShopifyClient['query'],
    cache: ShopifyCache,
    shopifyConfig?: ShopifyConfig
  ) =>
  async (params: ShopifyItemParams): Promise<Collection | null> => {
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
      return fetchAllCollectionProducts(query, cachedCollection)
    }
    const { COLLECTION_BY_ID, COLLECTION_BY_HANDLE } =
      createQueries(shopifyConfig)

    const fetchedCollection = id
      ? await getById(query, COLLECTION_BY_ID, id)
      : handle
      ? await getByHandle(query, COLLECTION_BY_HANDLE, handle)
      : null
    if (!fetchedCollection) return null

    const collection = await fetchAllCollectionProducts(
      query,
      fetchedCollection
    )
    cache.set(collection)
    return collection
  }
