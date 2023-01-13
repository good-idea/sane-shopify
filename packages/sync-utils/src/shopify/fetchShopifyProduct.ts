import gql from 'graphql-tag'
import { DocumentNode } from 'graphql'
import Debug from 'debug'
import {
  ShopifyClient,
  ShopifyItemParams,
  Product,
  ShopifyMetafieldsConfig,
} from '@sane-shopify/types'
import { remapMetafields } from './remapMetafields'
import { mergePaginatedResults, getLastCursor } from '../utils'
import { ShopifyCache } from './shopifyUtils'
import { createProductFragment } from './queryFragments'

const log = Debug('sane-shopify:fetching')

const createProductByHandle = (shopifyConfig: ShopifyMetafieldsConfig) => gql`
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
  ${createProductFragment(shopifyConfig)}
`

const createProductById = (shopifyConfig: ShopifyMetafieldsConfig) => gql`
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
  ${createProductFragment(shopifyConfig)}
`

const createQueries = (shopifyConfig: ShopifyMetafieldsConfig) => ({
  PRODUCT_BY_ID: createProductById(shopifyConfig),
  PRODUCT_BY_HANDLE: createProductByHandle(shopifyConfig),
})

interface ByHandleResult {
  data?: {
    productByHandle: Product
  }
}

const getByHandle = async (
  shopifyClient: ShopifyClient,
  queryString: DocumentNode,
  handle: string,
  collectionsAfter?: string | number
) => {
  const result = await shopifyClient.query<ByHandleResult>(queryString, {
    handle,
    collectionsFirst: 200,
    collectionsAfter,
  })
  const product = result?.data?.productByHandle
  return product ? remapMetafields(product) : undefined
}

interface ByIdResult {
  data?: {
    node: Product
  }
}

const getById = async (
  shopifyClient: ShopifyClient,
  queryString: DocumentNode,
  id: string,
  collectionsAfter?: string
) => {
  const result = await shopifyClient.query<ByIdResult>(queryString, {
    id,
    collectionsFirst: 20,
    collectionsAfter,
  })
  const product = result?.data?.node
  return product ? remapMetafields(product) : undefined
}

export const fetchAllProductCollections = async (
  shopifyClient: ShopifyClient,
  metafieldsConfig: ShopifyMetafieldsConfig,
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

  const { PRODUCT_BY_HANDLE } = createQueries(metafieldsConfig)

  const nextProduct = await getByHandle(
    shopifyClient,
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
    return fetchAllProductCollections(shopifyClient, metafieldsConfig, product)
  }
  log(`Fetched all collections for product ${prevProduct.handle}`, prevProduct)

  return product
}

/**
 * Fetches a product from Shopify, with the IDs of all related collections
 */

export const createFetchShopifyProduct =
  (
    shopifyClient: ShopifyClient,
    fetchMetafieldsConfig: () => Promise<ShopifyMetafieldsConfig>,
    cache: ShopifyCache
  ) =>
  async (params: ShopifyItemParams): Promise<Product | null> => {
    const metafieldsConfig = await fetchMetafieldsConfig()
    const { id, handle } = params
    if (!id && !handle) {
      throw new Error('You must provide either an id or handle')
    }

    const { PRODUCT_BY_ID, PRODUCT_BY_HANDLE } = createQueries(metafieldsConfig)

    const cachedProduct = id
      ? cache.getProductById(id)
      : handle
      ? cache.getProductByHandle(handle)
      : null

    if (cachedProduct)
      return fetchAllProductCollections(
        shopifyClient,
        metafieldsConfig,
        cachedProduct
      )

    const fetchedProduct = id
      ? await getById(shopifyClient, PRODUCT_BY_ID, id)
      : handle
      ? await getByHandle(shopifyClient, PRODUCT_BY_HANDLE, handle)
      : null
    if (!fetchedProduct) return null

    const product = await fetchAllProductCollections(
      shopifyClient,
      metafieldsConfig,
      fetchedProduct
    )
    cache.set(product)
    return product
  }
