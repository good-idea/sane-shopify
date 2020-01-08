import { unwindEdges } from '@good-idea/unwind-edges'
import PQueue from 'p-queue'
import createSanityClient from '@sanity/client'
import {
  Collection,
  Product,
  SanityClient,
  ShopifyClient,
  SyncOperationResult,
  SaneShopifyConfig,
  RelatedPair,
  Operation,
  RelatedPairPartial
} from '@sane-shopify/types'
import { createShopifyClient, shopifyUtils } from './shopify'
import { sanityUtils } from './sanity'

export interface SyncUtils {
  /* Syncs all products */
  syncProducts: (cbs?: SubscriptionCallbacks) => Promise<any>
  /* Syncs all collections */
  syncCollections: (cbs?: SubscriptionCallbacks) => Promise<any>
  /* Syncs a product by handle*/
  syncProductByHandle: (
    handle: string,
    cbs?: SubscriptionCallbacks
  ) => Promise<any>
  /* Syncs a collection by handle*/
  syncCollectionByHandle: (
    handle: string,
    cbs?: SubscriptionCallbacks
  ) => Promise<any>
  /* Syncs a collection or product by storefront id */
  syncItemByID: (id: string, cbs?: SubscriptionCallbacks) => Promise<any>
}

interface SubscriptionCallbacks {
  onProgress?: (operation: Operation, message?: string) => void
  onError?: (err: Error) => void
  onComplete?: (operation: Operation, message?: string) => void
}

/**
 * This is the main 'entry point' for the sync utils client.
 * It creates the two sub-clients, for Sanity and Shopify,
 * which return several functions used in the syncing process.
 *
 * This base client is responsible for:
 * - Initializing the clients
 * - Providing a public API of functions
 * - Calls any callbacks provided by the API end user
 */

export const syncUtils = (
  shopifyClient: ShopifyClient,
  sanityClient: SanityClient
): SyncUtils => {
  /**
   * Client Setup
   */
  const {
    fetchItemById,
    fetchShopifyProduct,
    fetchShopifyCollection,
    fetchAllShopifyProducts,
    fetchAllShopifyCollections
  } = shopifyUtils(shopifyClient)

  const {
    syncSanityDocument,
    syncRelationships,
    fetchRelatedDocs,
    documentByShopifyId
  } = sanityUtils(sanityClient)

  /**
   * Private Methods
   */

  /* Syncs a single document and returns related nodes to sync */
  const syncCollection = async (
    shopifyCollection: Collection
  ): Promise<SyncOperationResult> => {
    const [related] = unwindEdges(shopifyCollection.products)
    const operation = await syncSanityDocument(shopifyCollection)
    return { operation, related }
  }

  const syncProduct = async (
    shopifyProduct: Product
  ): Promise<SyncOperationResult> => {
    const [related] = unwindEdges(shopifyProduct.collections)
    const operation = await syncSanityDocument(shopifyProduct)
    return { operation, related }
  }

  const completePair = async (
    partialPair: RelatedPairPartial
  ): Promise<RelatedPair> => {
    const { shopifyNode, sanityDocument } = partialPair
    if (shopifyNode && sanityDocument) return partialPair
    if (!shopifyNode && !sanityDocument) {
      throw new Error(
        'A partial pair must have either a shopifyNode or a sanityDocument'
      )
    }

    if (!shopifyNode) {
      const fetchedShopifyItem = await fetchItemById(sanityDocument.shopifyId)
      return { shopifyNode: fetchedShopifyItem, sanityDocument }
    }

    if (!sanityDocument) {
      const existingDoc = await documentByShopifyId(shopifyNode.id)
      if (existingDoc) {
        return {
          shopifyNode,
          sanityDocument: existingDoc
        }
      }
      const completeShopifyItem = await fetchItemById(shopifyNode.id)
      const op = await syncSanityDocument(completeShopifyItem)

      return {
        shopifyNode,
        sanityDocument: op.sanityDocument
      }
    }
    throw new Error('how did we get here?')
  }

  const makeRelationships = async ({
    operation,
    related
  }: SyncOperationResult) => {
    const initialPairs = await fetchRelatedDocs(related)
    const pairQueue = new PQueue({ concurrency: 1 })

    const completePairs = await pairQueue.addAll(
      initialPairs.map((pair) => () => completePair(pair))
    )
    // At this point we have the already-synced document,
    // and all of the documents that it should be related to

    const relatedDocs = completePairs.map(
      ({ sanityDocument }) => sanityDocument
    )

    const relationshipSyncs = await syncRelationships(
      operation.sanityDocument,
      relatedDocs
    )

    return relationshipSyncs
  }

  /**
   * Public API methods
   */

  /* Syncs a product and any collections it is related to */
  const syncProductByHandle = async (
    handle: string,
    cbs: SubscriptionCallbacks = {}
  ) => {
    const shopifyProduct = await fetchShopifyProduct({ handle })
    const syncResult = await syncProduct(shopifyProduct)
    await makeRelationships(syncResult)
  }

  /* Syncs a collection and any products it is related to */
  const syncCollectionByHandle = async (
    handle: string,
    cbs: SubscriptionCallbacks = {}
  ) => {
    const shopifyCollection = await fetchShopifyCollection({ handle })
    // if (cbs.onFetchedItems) {
    //   cbs.onFetchedItems([shopifyCollection], 'fetched initial collection')
    // }
    const syncResult = await syncCollection(shopifyCollection)
    await makeRelationships(syncResult)
  }

  /* Sync an item by ID */
  const syncItemByID = async (id: string, cbs: SubscriptionCallbacks = {}) => {
    const shopifyItem = await fetchItemById(id)
    // if (cbs.onFetchedItems) {
    //   cbs.onFetchedItems([shopifyItem], 'fetched initial item')
    // }
    if (shopifyItem.__typename === 'Product') {
      const syncResult = await syncProduct(shopifyItem)
      await makeRelationships(syncResult)
    }
    if (shopifyItem.__typename === 'Collection') {
      const syncResult = await syncCollection(shopifyItem)
      await makeRelationships(syncResult)
    }
    // @ts-ignore
    throw new Error(`Item type ${shopifyItem.__typename} is not supported`)
  }

  /* Syncs all products */
  const syncProducts = async (cbs: SubscriptionCallbacks = {}) => {
    const allProducts = await fetchAllShopifyProducts()
    // if (cbs.onFetchedItems) {
    //   cbs.onFetchedItems(allProducts, 'fetched initial products')
    // }
    const queue = new PQueue({ concurrency: 1 })
    const results = await queue.addAll(
      allProducts.map((product) => async () => {
        const result = await syncProduct(product)
        if (cbs.onProgress) cbs.onProgress(result.operation)
        return result
      })
    )

    const relationshipQueue = new PQueue({ concurrency: 1 })
    await relationshipQueue.addAll(
      results.map((result) => async () => {
        await makeRelationships(result)
      })
    )

    return results
  }

  /* Syncs all collections */
  const syncCollections = async (cbs: SubscriptionCallbacks = {}) => {
    const allCollections = await fetchAllShopifyCollections()
    // if (cbs.onFetchedItems) {
    //   cbs.onFetchedItems(allCollections, 'fetched initial collections')
    // }
    const queue = new PQueue({ concurrency: 1 })

    const results = await queue.addAll(
      allCollections.map((collection) => async () => {
        const result = await syncCollection(collection)
        if (cbs.onProgress) cbs.onProgress(result.operation)
        return result
      })
    )

    const relationshipQueue = new PQueue({ concurrency: 1 })

    await relationshipQueue.addAll(
      results.map((result) => () => makeRelationships(result))
    )

    return results
  }

  // TODO:
  // create public versions of each method.
  // The private ones should:
  //  - round 1 sync - initial doc / documents
  //  - link all sanity documents
  //   -
  //  - fire the onComplete callback

  return {
    syncCollectionByHandle,
    syncProductByHandle,
    syncProducts,
    syncCollections,
    syncItemByID
  }
}

export const createSyncingClient = ({
  shopify,
  sanity
}: SaneShopifyConfig): SyncUtils => {
  const sanityClient = createSanityClient({
    projectId: sanity.projectId,
    dataset: sanity.dataset,
    authToken: sanity.authToken
  })

  const shopifyClient = createShopifyClient(shopify)

  return syncUtils(shopifyClient, sanityClient)
}
