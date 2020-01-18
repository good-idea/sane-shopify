import gql from 'graphql-tag'
import PQueue from 'p-queue'
import { unwindEdges, Paginated } from '@good-idea/unwind-edges'
import { ShopifyClient, Collection } from '@sane-shopify/types'
import { ShopifyCache } from './shopifyUtils'
import { mergePaginatedResults, getLastCursor } from '../utils'
import { collectionFragment } from './queryFragments'
import { fetchAllCollectionProducts } from './fetchShopifyCollection'

export const COLLECTIONS_QUERY = gql`
  query CollectionsQuery($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      edges {
        cursor
        node {
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
  }
  ${collectionFragment}
`

interface QueryResult {
  data: {
    collections: Paginated<Collection>
  }
}

export const createFetchAllShopifyCollections = (
  query: ShopifyClient['query'],
  cache: ShopifyCache
) => async (): Promise<Collection[]> => {
  const fetchCollections = async (
    prevPage?: Paginated<Collection>
  ): Promise<Collection[]> => {
    const after = prevPage ? getLastCursor(prevPage) : undefined
    const result = await query<QueryResult>(COLLECTIONS_QUERY, {
      first: 200,
      after
    })
    const fetchedCollections = result.data.collections
    const collections = prevPage
      ? mergePaginatedResults(prevPage, fetchedCollections)
      : fetchedCollections
    if (collections.pageInfo.hasNextPage) return fetchCollections(collections)
    const [unwound] = unwindEdges(fetchedCollections)
    unwound.forEach((collection) => cache.set(collection))
    return unwound
  }

  const allCollections = await fetchCollections()

  const queue = new PQueue({ concurrency: 1 })
  const r = queue.addAll(
    allCollections.map((collection) => () =>
      fetchAllCollectionProducts(query, collection)
    )
  )
  return r
}
