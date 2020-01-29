import gql from 'graphql-tag'
import PQueue from 'p-queue'
import Debug from 'debug'
import { unwindEdges, Paginated } from '@good-idea/unwind-edges'
import { ShopifyClient, Product } from '@sane-shopify/types'
import { mergePaginatedResults, getLastCursor } from '../utils'
import { productFragment } from './queryFragments'
import { fetchAllProductCollections } from './fetchShopifyProduct'
import { ShopifyCache } from './shopifyUtils'

const log = Debug('sane-shopify:fetching')

export const PRODUCTS_QUERY = gql`
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
          collections(first: 20) {
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
  ${productFragment}
`

interface QueryResult {
  data: {
    products: Paginated<Product>
  }
}

export const createFetchAllShopifyProducts = (
  query: ShopifyClient['query'],
  cache: ShopifyCache
) => async (): Promise<Product[]> => {
  const allStartTimer = new Date()
  const fetchProducts = async (
    prevPage?: Paginated<Product>
  ): Promise<Product[]> => {
    const after = prevPage ? getLastCursor(prevPage) : undefined
    const now = new Date()
    const result = await query<QueryResult>(PRODUCTS_QUERY, {
      first: 50,
      after
    })
    const duration = new Date().getTime() - now.getTime()
    log(`Fetched page of Shopify Products in ${duration / 1000}s`, result)
    const fetchedProducts = result.data.products
    const products = prevPage
      ? mergePaginatedResults(prevPage, fetchedProducts)
      : fetchedProducts
    if (products.pageInfo.hasNextPage) return fetchProducts(products)
    const [unwound] = unwindEdges(products)
    unwound.forEach((product) => cache.set(product))
    return unwound
  }

  const allProducts = await fetchProducts()

  const queue = new PQueue({ concurrency: 1 })
  const results = await queue.addAll(
    allProducts.map((product) => () =>
      fetchAllProductCollections(query, product)
    )
  )

  const allDuration = new Date().getTime() - allStartTimer.getTime()

  log(`Fetched all Shopify Products in ${allDuration / 1000}s`, results)
  return results
}
