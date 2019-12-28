import gql from 'graphql-tag'
import { mergePaginatedResults, getLastCursor } from '../utils'
import { ShopifyClient, ProductParams, Product } from '@sane-shopify/types'
import { productFragment } from './shopifyQueries'

export const PRODUCT_BY_HANDLE = gql`
  query ProductQuery(
    $handle: String!
    $collectionsFirst: Int!
    $collectionsAfter: String
  ) {
    productByHandle(handle: $handle) {
      ...ProductFragment
      collections(first: $collectionsFirst, after: $collectionsAfter) {
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
  ${productFragment}
`
interface ByHandleResult {
  data?: {
    productByHandle: Product
  }
}

const getByHandle = async (
  query: ShopifyClient['query'],
  handle: string,
  collectionsAfter?: string
) => {
  const result = await query<ByHandleResult>(PRODUCT_BY_HANDLE, {
    handle,
    collectionsFirst: 200,
    collectionsAfter
  })
  return result?.data?.productByHandle
}

const PRODUCT_BY_ID = gql`
  query NodeQuery(
    $id: ID!
    $collectionsFirst: Int!
    $collectionsAfter: String
  ) {
    node(id: $id) {
      ... on Product {
        ...ProductFragment
        collections(first: $collectionsFirst, after: $collectionsAfter) {
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
  ${productFragment}
`

interface ByIdResult {
  data?: {
    node: Product
  }
}

const getById = async (
  query: ShopifyClient['query'],
  id: string,
  collectionsAfter?: string
) => {
  const result = await query<ByIdResult>(PRODUCT_BY_ID, {
    id,
    collectionsFirst: 200,
    collectionsAfter
  })
  return result?.data?.node
}

export const fetchAllProductCollections = async (
  query: ShopifyClient['query'],
  prevProduct: Product
): Promise<Product> => {
  if (!prevProduct.collections?.pageInfo.hasNextPage) return prevProduct
  const collectionsAfter = getLastCursor(prevProduct.collections)

  const nextProduct = await getByHandle(
    query,
    prevProduct.handle,
    collectionsAfter
  )

  const collections = mergePaginatedResults(
    prevProduct.collections,
    nextProduct.collections
  )
  const product = {
    ...nextProduct,
    collections
  }

  if (product.collections.pageInfo.hasNextPage) {
    return fetchAllProductCollections(query, product)
  }

  return product
}

/**
 * Fetches a product from Shopify, with the IDs of all related collections
 */

export const createFetchShopifyProduct = (
  query: ShopifyClient['query']
) => async (params: ProductParams): Promise<Product | null> => {
  const { id, handle } = params
  if (!id && !handle) {
    debugger
    throw new Error('You must provide either an id or handle')
  }

  const fetchedProduct = id
    ? await getById(query, id)
    : await getByHandle(query, handle)

  return fetchAllProductCollections(query, fetchedProduct)
}
