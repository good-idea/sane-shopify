import gql from 'graphql-tag'
import {
  ShopifyClient,
  Product,
  Collection,
  ShopifyMetafieldsConfig,
} from '@sane-shopify/types'
import { ShopifyCache } from './shopifyUtils'
import {
  createProductFragment,
  createCollectionFragment,
} from './queryFragments'
import { remapMetafields } from './remapMetafields'
import { fetchAllCollectionProducts } from './fetchShopifyCollection'
import { fetchAllProductCollections } from './fetchShopifyProduct'
import { toAdminApiId } from '../utils'

export const createNodeQuery = (shopifyConfig: ShopifyMetafieldsConfig) => gql`
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
    shopifyClient: ShopifyClient,
    fetchMetafieldsConfig: () => Promise<ShopifyMetafieldsConfig>,
    cache: ShopifyCache
  ) =>
  async (
    id: string,
    fetchRelated: boolean
  ): Promise<Product | Collection | null> => {
    const metafieldsConfig = await fetchMetafieldsConfig()
    const NODE_QUERY = createNodeQuery(metafieldsConfig)
    const cached = cache.getCollectionById(id) || cache.getProductById(id)
    if (cached) return cached
    const result = await shopifyClient.query<NodeResult>(NODE_QUERY, {
      id: toAdminApiId(id),
    })
    const item = result?.data?.node
      ? remapMetafields(result.data.node)
      : undefined

    if (result.errors) {
      const messages = result.errors.map(({ message }) => message).join(' | ')
      throw new Error(`Could not fetch item ${id}: `.concat(messages))
    }
    if (!item) return null
    if (!fetchRelated) return item
    if (item.__typename === 'Product') {
      const r = await fetchAllProductCollections(
        shopifyClient,
        metafieldsConfig,
        item
      )
      return r
    }
    if (item.__typename === 'Collection') {
      return fetchAllCollectionProducts(shopifyClient, metafieldsConfig, item)
    }
    // @ts-expect-error
    throw new Error(`Cannot fetch item ${id} with typename ${item.__typename}`)
  }
