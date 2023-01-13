import gql from 'graphql-tag'
import PQueue from 'p-queue'
import { unwindEdges, Paginated } from '@good-idea/unwind-edges'
import {
  ProgressHandler,
  ShopifyClient,
  Product,
  ShopifyMetafieldsConfig,
} from '@sane-shopify/types'
import { mergePaginatedResults, getLastCursor } from '../utils'
import { createProductFragment } from './queryFragments'
import { fetchAllProductCollections } from './fetchShopifyProduct'
import { ShopifyCache } from './shopifyUtils'
import { QueryResultRejected } from './types'
import { log, hasTimeoutErrors } from './fetchUtils'
import { remapMetafields } from './remapMetafields'

const createProductsQuery = (shopifyConfig: ShopifyMetafieldsConfig) => gql`
  query ProductsQuery($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      edges {
        cursor
        node {
          ...ProductFragment
          collections(first: 99) {
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
  }
  ${createProductFragment(shopifyConfig)}
`

interface QueryResultFulfilled {
  data: {
    products: Paginated<Product>
  }
}

type ProductsQueryResult = QueryResultFulfilled | QueryResultRejected

const noop = () => undefined

export const createFetchAllShopifyProducts =
  (
    shopifyClient: ShopifyClient,
    fetchMetafieldsConfig: () => Promise<ShopifyMetafieldsConfig>,
    cache: ShopifyCache
  ) =>
  async (onProgress: ProgressHandler<Product> = noop): Promise<Product[]> => {
    const metafieldsConfig = await fetchMetafieldsConfig()
    const PRODUCTS_QUERY = createProductsQuery(metafieldsConfig)
    const allStartTimer = new Date()
    const fetchProducts = async (
      pageSize = 30,
      prevPage?: Paginated<Product>
    ): Promise<Product[]> => {
      const after = prevPage ? getLastCursor(prevPage) : undefined
      const now = new Date()
      log(
        `Fetching products - page size: ${pageSize}, previous results: ${
          prevPage?.edges.length || 0
        }`
      )
      const result = await shopifyClient.query<ProductsQueryResult>(
        PRODUCTS_QUERY,
        {
          first: pageSize,
          after,
        }
      )
      if ('errors' in result) {
        if (hasTimeoutErrors(result)) {
          if (pageSize === 1) {
            throw new Error('Product query timed out with a page size of 1.')
          }
          const newPageSize = Math.round(pageSize / 2)
          log(
            `Product query timed out. Falling back to smaller page size (${newPageSize})`
          )
          return fetchProducts(newPageSize, prevPage)
        }
        log(`Product request failed: ${result.errors}`)
        const errorMessage = `Product request failed: ${result.errors
          .map((e) => e.message)
          .join(' | ')}`
        throw new Error(errorMessage)
      }
      const duration = new Date().getTime() - now.getTime()
      log(`Fetched page of Shopify Products in ${duration / 1000}s`, result)
      const fetchedProducts = result.data.products
      const [productsPage] = unwindEdges(fetchedProducts)
      onProgress(productsPage)
      const products = prevPage
        ? mergePaginatedResults(prevPage, fetchedProducts)
        : fetchedProducts
      if (!products.pageInfo) {
        throw new Error('Products page info was not fetched')
      }
      if (products.pageInfo.hasNextPage)
        return fetchProducts(pageSize, products)
      const [unwound] = unwindEdges(products)
      unwound.forEach((product) => cache.set(product))
      return unwound
    }

    const allProductsResult = await fetchProducts()
    const allProducts = allProductsResult.map(remapMetafields)

    const queue = new PQueue({ concurrency: 1 })
    const results = await queue.addAll(
      allProducts.map(
        (product) => () =>
          fetchAllProductCollections(shopifyClient, metafieldsConfig, product)
      )
    )

    const allDuration = new Date().getTime() - allStartTimer.getTime()

    log(`Fetched all Shopify Products in ${allDuration / 1000}s`, results)
    return results
  }
