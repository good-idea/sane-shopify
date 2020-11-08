import gql from 'graphql-tag'
import {
  ShopifyClient,
  ProgressHandler,
  Product,
  Collection,
} from '@sane-shopify/types'
import { ShopifyCache } from './shopifyUtils'
import { productFragment, collectionFragment } from './queryFragments'
import { fetchAllCollectionProducts } from './fetchShopifyCollection'
import { fetchAllProductCollections } from './fetchShopifyProduct'

export const NODE_QUERY = gql`
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
  ${productFragment}
  ${collectionFragment}
`

interface NodeResult {
  data?: {
    node?: Product | Collection
  }
  errors?: Array<{
    message: string
  }>
}

const noop = () => undefined

export const createFetchItemById = (
  query: ShopifyClient['query'],
  cache: ShopifyCache
) => async (
  id: string,
  fetchRelated: boolean,
  onProgress: ProgressHandler<Product | Collection> = noop
): Promise<Product | Collection | null> => {
  const cached = cache.getCollectionById(id) || cache.getProductById(id)
  if (cached) return cached
  const result = await query<NodeResult>(NODE_QUERY, { id })
  const item = result?.data?.node
  if (result.errors) {
    const messages = result.errors.map(({ message }) => message).join(' | ')
    throw new Error(messages)
  }
  if (!item) return null
  if (!fetchRelated) return item
  if (item.__typename === 'Product') {
    const product = await fetchAllProductCollections(query, item)
    onProgress([product])
    return product
  }
  if (item.__typename === 'Collection') {
    const collection = await fetchAllCollectionProducts(query, item)
    onProgress([collection])
    return collection
  }
  // @ts-ignore
  throw new Error(`Cannot fetch item with typename ${item.__typename}`)
}
