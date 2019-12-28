import gql from 'graphql-tag'
import { productFragment, collectionFragment } from './shopifyQueries'
import { ShopifyClient, Product, Collection } from '@sane-shopify/types'
import { fetchAllCollectionProducts } from './fetchShopifyCollection'
import { fetchAllProductCollections } from './fetchShopifyProduct'

export const NODE_QUERY = gql`
  query NodeQuery($id: ID!) {
    node(id: $id) {
      ... on Product {
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
      ... on Collection {
        ...CollectionFragment
        products(first: 200) {
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
  node: Product | Collection
}

export const createFetchItemById = (query: ShopifyClient['query']) => async (
  id: string
): Promise<Product | Collection> => {
  const result = await query<NodeResult>(NODE_QUERY, { id })
  const item = result.node
  if (item.__typename === 'Product') {
    return fetchAllProductCollections(query, item)
  }
  if (item.__typename === 'Collection') {
    return fetchAllCollectionProducts(query, item)
  }
  // @ts-ignore
  throw new Error(`Cannot fetch item with typename ${item.__typename}`)
}
