import gql from 'graphql-tag'
import { mergePaginatedResults, getLastCursor } from '../utils'
import {
  ShopifyClient,
  ShopifyItemParams,
  Collection
} from '@sane-shopify/types'
import { collectionFragment } from './shopifyQueries'

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
    productsFirst: 200,
    productsAfter
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
    productsAfter
  })
  return result?.data?.node
}

export const fetchAllCollectionProducts = async (
  query: ShopifyClient['query'],
  prevCollection: Collection
): Promise<Collection> => {
  if (!prevCollection) {
    debugger
  }
  if (!prevCollection.products?.pageInfo.hasNextPage) return prevCollection

  const productsAfter = getLastCursor(prevCollection.products)
  const nextCollection = await getByHandle(
    query,
    prevCollection.handle,
    productsAfter
  )

  const products = mergePaginatedResults(
    prevCollection.products,
    nextCollection.products
  )
  const collection = {
    ...nextCollection,
    products
  }

  if (collection.products.pageInfo.hasNextPage) {
    return fetchAllCollectionProducts(query, prevCollection)
  }
  return collection
}

/**
 * Fetches a product from Shopify, with the IDs of all related collections
 */

export const createFetchShopifyCollection = (
  query: ShopifyClient['query']
) => async (params: ShopifyItemParams): Promise<Collection | null> => {
  const { id, handle } = params
  if (!id && !handle) {
    throw new Error('You must provide either an id or handle')
  }

  const fetchedCollection = id
    ? await getById(query, id)
    : await getByHandle(query, handle)

  return fetchAllCollectionProducts(query, fetchedCollection)
}
