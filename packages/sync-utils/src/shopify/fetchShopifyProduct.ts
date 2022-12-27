import gql from 'graphql-tag'
import { DocumentNode } from 'graphql'
import Debug from 'debug'
import {
  ShopifyClient,
  ShopifyItemParams,
  Product,
  ShopifyConfigProducts,
  ShopifyConfig,
} from '@sane-shopify/types'
import { mergePaginatedResults, getLastCursor } from '../utils'
import { ShopifyCache } from './shopifyUtils'
import { createProductFragment } from './queryFragments'

const log = Debug('sane-shopify:fetching')

const createProductByHandle = (productConfig?: ShopifyConfigProducts) => gql`
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
  ${createProductFragment(productConfig)}
`

const createProductById = (productConfig?: ShopifyConfigProducts) => gql`
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
  ${createProductFragment(productConfig)}
`

const createQueries = (shopifyConfigProducts?: ShopifyConfigProducts) => ({
  PRODUCT_BY_ID: createProductById(shopifyConfigProducts),
  PRODUCT_BY_HANDLE: createProductByHandle(shopifyConfigProducts),
})

interface ByHandleResult {
  data?: {
    productByHandle: Product
  }
}

const getByHandle = async (
  query: ShopifyClient['query'],
  queryString: DocumentNode,
  handle: string,
  collectionsAfter?: string | number
) => {
  const result = await query<ByHandleResult>(queryString, {
    handle,
    collectionsFirst: 200,
    collectionsAfter,
  })
  return result?.data?.productByHandle
}

interface ByIdResult {
  data?: {
    node: Product
  }
}

const getById = async (
  query: ShopifyClient['query'],
  queryString: DocumentNode,
  id: string,
  collectionsAfter?: string
) => {
  const result = await query<ByIdResult>(queryString, {
    id,
    collectionsFirst: 20,
    collectionsAfter,
  })
  return result?.data?.node
}

export const fetchAllProductCollections = async (
  query: ShopifyClient['query'],
  prevProduct: Product,
  shopifyConfig?: ShopifyConfig
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

  const { PRODUCT_BY_HANDLE } = createQueries(shopifyConfig?.products)

  const nextProduct = await getByHandle(
    query,
    PRODUCT_BY_HANDLE,
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
          : prevProduct.collections,
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

export const createFetchShopifyProduct =
  (
    query: ShopifyClient['query'],
    cache: ShopifyCache,
    shopifyConfig?: ShopifyConfig
  ) =>
  async (params: ShopifyItemParams): Promise<Product | null> => {
    const { id, handle } = params
    if (!id && !handle) {
      debugger
      throw new Error('You must provide either an id or handle')
    }

    const { PRODUCT_BY_ID, PRODUCT_BY_HANDLE } = createQueries(
      shopifyConfig?.products
    )

    const cachedProduct = id
      ? cache.getProductById(id)
      : handle
      ? cache.getProductByHandle(handle)
      : null

    if (cachedProduct) return fetchAllProductCollections(query, cachedProduct)

    const fetchedProduct = id
      ? await getById(query, PRODUCT_BY_ID, id)
      : handle
      ? await getByHandle(query, PRODUCT_BY_HANDLE, handle)
      : null
    if (!fetchedProduct) return null

    const product = await fetchAllProductCollections(query, fetchedProduct)
    cache.set(product)
    return product
  }
