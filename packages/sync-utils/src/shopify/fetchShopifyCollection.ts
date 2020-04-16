import gql from 'graphql-tag'
import Debug from 'debug'
import {
  ShopifyClient,
  ShopifyItemParams,
  Collection,
} from '@sane-shopify/types'
import { mergePaginatedResults, getLastCursor } from '../utils'
import { collectionFragment } from './queryFragments'
import { ShopifyCache } from './shopifyUtils'

const log = Debug('sane-shopify:fetching')

const COLLECTION_BY_HANDLE = gql`
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
  ${collectionFragment}
`
interface ByHandleResult {
  data?: {
    collectionByHandle: Collection
  }
}

const getByHandle = async (
  query: ShopifyClient['query'],
  handle: string,
  productsAfter?: string
) => {
  const result = await query<ByHandleResult>(COLLECTION_BY_HANDLE, {
    handle,
    productsFirst: 50,
    productsAfter,
  })
  return result?.data?.collectionByHandle
}

const COLLECTION_BY_ID = gql`
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
  ${collectionFragment}
`

interface ByIdResult {
  data?: {
    node: Collection
  }
}

const getById = async (
  query: ShopifyClient['query'],
  id: string,
  productsAfter?: string
) => {
  const result = await query<ByIdResult>(COLLECTION_BY_ID, {
    id,
    productsFirst: 200,
    productsAfter,
  })
  return result?.data?.node
}

export const fetchAllCollectionProducts = async (
  query: ShopifyClient['query'],
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
  const nextCollection = await getByHandle(
    query,
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

export const createFetchShopifyCollection = (
  query: ShopifyClient['query'],
  cache: ShopifyCache
) => async (params: ShopifyItemParams): Promise<Collection | null> => {
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

  const fetchedCollection = id
    ? await getById(query, id)
    : handle
    ? await getByHandle(query, handle)
    : null
  if (!fetchedCollection) throw new Error('Could not fetch collection')

  const collection = await fetchAllCollectionProducts(query, fetchedCollection)
  cache.set(collection)
  return collection
}
