import gql from 'graphql-tag'
import Debug from 'debug'
import { ShopifyClient, ShopifyItemParams, Product } from '@sane-shopify/types'
import { mergePaginatedResults, getLastCursor } from '../utils'
import { ShopifyCache } from './shopifyUtils'
import { productFragment } from './queryFragments'

const log = Debug('sane-shopify:fetching')

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
    collectionsFirst: 20,
    collectionsAfter
  })
  return result?.data?.node
}

export const fetchAllProductCollections = async (
  query: ShopifyClient['query'],
  prevProduct: Product
): Promise<Product> => {
  if (!prevProduct.collections?.pageInfo?.hasNextPage) {
    log(
      `Fetched all collections for product ${prevProduct.handle}`,
      prevProduct
    )
    return prevProduct
  }
  const collectionsAfter = getLastCursor(prevProduct.collections)
  log(
    `Fetching further products for product ${prevProduct.handle}`,
    prevProduct
  )

  const nextProduct = await getByHandle(
    query,
    prevProduct.handle,
    collectionsAfter ? collectionsAfter : undefined
  )

  const product = nextProduct
    ? {
        ...nextProduct,
        collections: nextProduct.collections
          ? mergePaginatedResults(
              prevProduct.collections,
              nextProduct.collections
            )
          : prevProduct.collections
      }
    : prevProduct

  if (product?.collections?.pageInfo?.hasNextPage) {
    return fetchAllProductCollections(query, product)
  }
  log(`Fetched all collections for product ${prevProduct.handle}`, prevProduct)

  return product
}

/**
 * Fetches a product from Shopify, with the IDs of all related collections
 */

export const createFetchShopifyProduct = (
  query: ShopifyClient['query'],
  cache: ShopifyCache
) => async (params: ShopifyItemParams): Promise<Product | null> => {
  const { id, handle } = params
  if (!id && !handle) {
    debugger
    throw new Error('You must provide either an id or handle')
  }

  const cachedProduct = id
    ? cache.getProductById(id)
    : handle
    ? cache.getProductByHandle(handle)
    : null

  if (cachedProduct) return fetchAllProductCollections(query, cachedProduct)

  const fetchedProduct = id
    ? await getById(query, id)
    : handle
    ? await getByHandle(query, handle)
    : null
  if (!fetchedProduct) throw new Error('Could not fetch product')

  const product = await fetchAllProductCollections(query, fetchedProduct)
  cache.set(product)
  return product
}
