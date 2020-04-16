import gql from 'graphql-tag'
import PQueue from 'p-queue'
import Debug from 'debug'
import { unwindEdges, Paginated } from '@good-idea/unwind-edges'
import { ProgressHandler, ShopifyClient, Collection } from '@sane-shopify/types'
import { ShopifyCache } from './shopifyUtils'
import { mergePaginatedResults, getLastCursor } from '../utils'
import { collectionFragment } from './queryFragments'
import { fetchAllCollectionProducts } from './fetchShopifyCollection'

const log = Debug('sane-shopify:fetching')

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
  }
  ${collectionFragment}
`

interface QueryResult {
  data: {
    collections: Paginated<Collection>
  }
}

const noop = () => undefined

export const createFetchAllShopifyCollections = (
  query: ShopifyClient['query'],
  cache: ShopifyCache
) => async (
  onProgress: ProgressHandler<Collection> = noop
): Promise<Collection[]> => {
  const allStartTimer = new Date()
  const fetchCollections = async (
    prevPage?: Paginated<Collection>
  ): Promise<Collection[]> => {
    const after = prevPage ? getLastCursor(prevPage) : undefined

    const now = new Date()
    const result = await query<QueryResult>(COLLECTIONS_QUERY, {
      first: 50,
      after,
    })

    const duration = new Date().getTime() - now.getTime()
    log(`Fetched page of Shopify Collections in ${duration / 1000}s`, result)
    const fetchedCollections = result.data.collections
    const [batch] = unwindEdges(fetchedCollections)
    onProgress(batch)

    const collections = prevPage
      ? mergePaginatedResults(prevPage, fetchedCollections)
      : fetchedCollections
    if (!collections.pageInfo) {
      throw new Error('Pagination info was not fetched')
    }
    if (collections.pageInfo.hasNextPage) return fetchCollections(collections)
    const [unwound] = unwindEdges(fetchedCollections)
    unwound.forEach((collection) => cache.set(collection))
    return unwound
  }

  const allCollections = await fetchCollections()
  const allDuration = new Date().getTime() - allStartTimer.getTime()
  log(
    `Fetched all Shopify Collections in ${allDuration / 1000}s`,
    allCollections
  )

  const queue = new PQueue({ concurrency: 1 })
  const results = await queue.addAll(
    allCollections.map((collection) => () =>
      fetchAllCollectionProducts(query, collection)
    )
  )

  log(`Fetched all Shopify Collections in ${allDuration / 1000}s`, results)

  return results
}
