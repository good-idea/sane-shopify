import gql from 'graphql-tag'
import PQueue from 'p-queue'
import { unwindEdges, Paginated } from '@good-idea/unwind-edges'
import {
  ProgressHandler,
  ShopifyClient,
  Collection,
  ShopifyConfig,
} from '@sane-shopify/types'
import { ShopifyCache } from './shopifyUtils'
import { mergePaginatedResults, getLastCursor } from '../utils'
import { createCollectionFragment } from './queryFragments'
import { fetchAllCollectionProducts } from './fetchShopifyCollection'
import { QueryResultRejected } from './types'
import { log, hasTimeoutErrors } from './fetchUtils'

export const createCollectionsQuery = (shopifyConfig?: ShopifyConfig) => gql`
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
          products(first: 25) {
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
  ${createCollectionFragment(shopifyConfig)}
`
interface QueryResultFulfilled {
  data: {
    collections: Paginated<Collection>
  }
}

type CollectionsQueryResult = QueryResultFulfilled | QueryResultRejected

const noop = () => undefined

export const createFetchAllShopifyCollections =
  (
    query: ShopifyClient['query'],
    cache: ShopifyCache,
    shopifyConfig?: ShopifyConfig
  ) =>
  async (
    onProgress: ProgressHandler<Collection> = noop
  ): Promise<Collection[]> => {
    const COLLECTIONS_QUERY = createCollectionsQuery(shopifyConfig)
    const allStartTimer = new Date()

    const fetchCollections = async (
      pageSize = 30,
      prevPage?: Paginated<Collection>
    ): Promise<Collection[]> => {
      const after = prevPage ? getLastCursor(prevPage) : undefined

      const now = new Date()
      const result = await query<CollectionsQueryResult>(COLLECTIONS_QUERY, {
        first: pageSize,
        after,
      })

      if ('errors' in result) {
        if (hasTimeoutErrors(result)) {
          if (pageSize === 1) {
            throw new Error(
              'Collections query timed out with a page size of 1.'
            )
          }
          const newPageSize = Math.round(pageSize / 2)
          log(
            `Collections query timed out. Falling back to smaller page size (${newPageSize})`
          )
          return fetchCollections(newPageSize, prevPage)
        }
        log(`Collections request failed: ${result.errors}`)
        const errorMessage = `Collections request failed: ${result.errors
          .map((e) => e.message)
          .join(' | ')}`
        throw new Error(errorMessage)
      }

      const duration = new Date().getTime() - now.getTime()
      log(`Fetched page of Shopify Collections in ${duration / 1000}s`, result)
      const fetchedCollections = result.data.collections
      const [batch] = unwindEdges(fetchedCollections)
      onProgress(batch)

      const mergedCollections = prevPage
        ? mergePaginatedResults(prevPage, fetchedCollections)
        : fetchedCollections
      if (!mergedCollections.pageInfo) {
        throw new Error('Pagination info was not fetched')
      }
      if (mergedCollections.pageInfo.hasNextPage) {
        return fetchCollections(pageSize, mergedCollections)
      }
      const [unwound] = unwindEdges(mergedCollections)
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
      allCollections.map(
        (collection) => () => fetchAllCollectionProducts(query, collection)
      )
    )

    log(`Fetched all Shopify Collections in ${allDuration / 1000}s`, results)

    return results
  }
