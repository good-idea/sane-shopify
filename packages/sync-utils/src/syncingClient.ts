import { unwindEdges } from '@good-idea/unwind-edges'
import PQueue from 'p-queue'
import createSanityClient from '@sanity/client'
import {
  Collection,
  Product,
  SanityClient,
  ShopifyClient,
  SaneShopifyConfig
} from '@sane-shopify/types'
import { createShopifyClient, shopifyUtils } from './shopify'
import { sanityUtils } from './sanity'

export interface SyncUtils {
  /* Syncs all products */
  syncProducts: (cbs?: SubscriptionCallbacks) => Promise<void[]>
  /* Syncs all collections */
  syncCollections: (cbs?: SubscriptionCallbacks) => Promise<void[]>
  /* Syncs a product by handle*/
  syncProductByHandle: (
    handle: string,
    cbs?: SubscriptionCallbacks
  ) => Promise<void>
  /* Syncs a collection by handle*/
  syncCollectionByHandle: (
    handle: string,
    cbs?: SubscriptionCallbacks
  ) => Promise<void>
  /* Syncs a collection or product by storefront id */
  syncItemByID: (id: string, cbs?: SubscriptionCallbacks) => Promise<void>
}

interface SubscriptionCallbacks {
  onFetchedItems?: (
    nodes: Array<Product | Collection>,
    message?: string
  ) => void
  onProgress?: (node: Product | Collection, message?: string) => void
  onError?: (err: Error) => void
  onComplete?: (payload?: any, message?: string) => void
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
) => {
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

  const { syncSanityDocument } = sanityUtils(sanityClient)

  /**
   * Private Methods
   */

  /* Syncs a single document and returns related nodes to sync */
  const syncCollection = async (shopifyCollection: Collection) => {
    const [related] = unwindEdges(shopifyCollection.products)
    const op = await syncSanityDocument(shopifyCollection)
    return { op, related }
  }

  const syncProduct = async (shopifyProduct: Product) => {
    const [related] = unwindEdges(shopifyProduct.collections)
    const op = await syncSanityDocument(shopifyProduct)
    return { op, related }
  }

  /* Syncs a product and any collections it is related to */
  const syncProductByHandle = async (
    handle: string,
    cbs: SubscriptionCallbacks = {}
  ) => {
    const shopifyProduct = await fetchShopifyProduct({ handle })
    if (cbs.onFetchedItems) {
      cbs.onFetchedItems([shopifyProduct], 'fetched initial product')
    }
    const { related } = await syncProduct(shopifyProduct)
  }

  /* Syncs a collection and any products it is related to */
  const syncCollectionByHandle = async (
    handle: string,
    cbs: SubscriptionCallbacks = {}
  ) => {
    const shopifyCollection = await fetchShopifyCollection({ handle })
    if (cbs.onFetchedItems) {
      cbs.onFetchedItems([shopifyCollection], 'fetched initial collection')
    }
    const { related } = await syncCollection(shopifyCollection)
  }

  /* Sync an item by ID */
  const syncItemByID = async (id: string, cbs: SubscriptionCallbacks = {}) => {
    const shopifyItem = await fetchItemById(id)
    if (cbs.onFetchedItems) {
      cbs.onFetchedItems([shopifyItem], 'fetched initial item')
    }
    if (shopifyItem.__typename === 'Product') {
      const { related } = await syncProduct(shopifyItem)
    }
    if (shopifyItem.__typename === 'Collection') {
      const { related } = await syncCollection(shopifyItem)
    }
    // @ts-ignore
    throw new Error(`Item type ${shopifyItem.__typename} is not supported`)
  }

  /* Syncs all products */
  const syncProducts = async (cbs: SubscriptionCallbacks = {}) => {
    const allProducts = await fetchAllShopifyProducts()
    if (cbs.onFetchedItems) {
      cbs.onFetchedItems(allProducts, 'fetched initial products')
    }
    const queue = new PQueue({ concurrency: 1 })
    const results = queue.addAll(
      allProducts.map((product) => async () => {
        const result = await syncProduct(product)
        if (cbs.onProgress) cbs.onProgress(product)
        return result
      })
    )
    return results
  }

  /* Syncs all collections */
  const syncCollections = async (cbs: SubscriptionCallbacks = {}) => {
    const allCollections = await fetchAllShopifyCollections()
    if (cbs.onFetchedItems) {
      cbs.onFetchedItems(allCollections, 'fetched initial collections')
    }
    const queue = new PQueue({ concurrency: 1 })

    const results = queue.addAll(
      allCollections.map((collection) => async () => {
        const result = await syncCollection(collection)
        if (cbs.onProgress) cbs.onProgress(collection)
        return result
      })
    )
    return results
  }

  // TODO:
  // create public versions of each method.
  // The private ones should:
  //  - round 1 sync - initial doc / documents
  //  - store a cache of synced documents
  //  - compare related items to the cache
  //  - sync items not in the cache
  //  - link all sanity documents
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
