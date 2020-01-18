import gql from 'graphql-tag'
import PQueue from 'p-queue'
import { unwindEdges, Paginated } from '@good-idea/unwind-edges'
import { ShopifyClient, Product } from '@sane-shopify/types'
import { mergePaginatedResults, getLastCursor } from '../utils'
import { productFragment } from './queryFragments'
import { fetchAllProductCollections } from './fetchShopifyProduct'
import { ShopifyCache } from './shopifyUtils'

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
          collections(first: 200) {
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
  const fetchProducts = async (
    prevPage?: Paginated<Product>
  ): Promise<Product[]> => {
    const after = prevPage ? getLastCursor(prevPage) : undefined
    const result = await query<QueryResult>(PRODUCTS_QUERY, {
      first: 200,
      after
    })
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
  return queue.addAll(
    allProducts.map((product) => () =>
      fetchAllProductCollections(query, product)
    )
  )
}
