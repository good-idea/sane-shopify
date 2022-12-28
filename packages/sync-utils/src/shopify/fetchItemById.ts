import gql from 'graphql-tag'
import {
  ShopifyClient,
  Product,
  Collection,
  ShopifyConfig,
} from '@sane-shopify/types'
import { ShopifyCache } from './shopifyUtils'
import {
  createProductFragment,
  createCollectionFragment,
} from './queryFragments'
import { fetchAllCollectionProducts } from './fetchShopifyCollection'
import { fetchAllProductCollections } from './fetchShopifyProduct'

export const createNodeQuery = (shopifyConfig?: ShopifyConfig) => gql`
  query NodeQuery($id: ID!) {
    node(id: $id) {
      ... on Product {
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
      ... on Collection {
        ...CollectionFragment
        products(first: 50) {
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
  ${createCollectionFragment(shopifyConfig)}
`

interface NodeResult {
  data?: {
    node?: Product | Collection
  }
  errors?: Array<{
    message: string
  }>
}

export const createFetchItemById =
  (
    query: ShopifyClient['query'],
    cache: ShopifyCache,
    shopifyConfig?: ShopifyConfig
  ) =>
  async (
    id: string,
    fetchRelated: boolean
  ): Promise<Product | Collection | null> => {
    const NODE_QUERY = createNodeQuery(shopifyConfig)
    const cached = cache.getCollectionById(id) || cache.getProductById(id)
    if (cached) return cached
    const result = await query<NodeResult>(NODE_QUERY, { id })
    const item = result?.data?.node
    if (result.errors) {
      const messages = result.errors.map(({ message }) => message).join(' | ')
      throw new Error(`Could not fetch item ${id}: `.concat(messages))
    }
    if (!item) return null
    if (!fetchRelated) return item
    if (item.__typename === 'Product') {
      return fetchAllProductCollections(query, item)
    }
    if (item.__typename === 'Collection') {
      return fetchAllCollectionProducts(query, item)
    }
    // @ts-expect-error
    throw new Error(`Cannot fetch item ${id} with typename ${item.__typename}`)
  }
