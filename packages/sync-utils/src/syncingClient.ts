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
  ShopifySecrets,
  LinkOperation,
  SubscriptionCallbacks,
  RelatedPairPartial,
  SyncState,
  SyncUtils,
} from '@sane-shopify/types'
import { syncStateMachine } from './syncState'
import { createLogger, Logger } from './logger'
import { createShopifyClient, shopifyUtils } from './shopify'
import { sanityUtils } from './sanity'
import { definitely } from './utils'

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

const noop = () => undefined

export const syncUtils = (
  shopifyClient: ShopifyClient,
  sanityClient: SanityClient,
  onStateChange: (state: SyncState) => void = noop
): SyncUtils => {
  /**
   * Client Setup
   */
  const {
    fetchItemById,
    fetchShopifyProduct,
    fetchShopifyCollection,
    fetchAllShopifyProducts,
    fetchAllShopifyCollections,
    testSecrets,
  } = shopifyUtils(shopifyClient)

  const {
    fetchAllSanityDocuments,
    syncSanityDocument,
    syncRelationships,
    fetchRelatedDocs,
    documentByShopifyId,
    documentByHandle,
    fetchSecrets,
    archiveSanityDocument,
    saveSecrets: saveSecretsToSanity,
    clearSecrets: clearSecretsFromSanity,
  } = sanityUtils(sanityClient)

  /**
   * State Management
   */

  const {
    init,
    initialState,
    onDocumentsFetched,
    startSync,
    onSavedSecrets,
    onSavedSecretsError,
    onClearedSecrets,
    onFetchComplete,
    onDocumentSynced,
    onDocumentLinked,
    onComplete,
  } = syncStateMachine({ onStateChange })

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
  ): Promise<RelatedPair | null> => {
    const { shopifyNode, sanityDocument } = partialPair
    if (shopifyNode && sanityDocument) return { shopifyNode, sanityDocument }
    if (!shopifyNode && !sanityDocument) {
      throw new Error(
        'A partial pair must have either a shopifyNode or a sanityDocument'
      )
    }

    if (!shopifyNode && sanityDocument) {
      const fetchedShopifyItem = await fetchItemById(
        sanityDocument.shopifyId,
        false
      )
      if (fetchedShopifyItem) {
        return { shopifyNode: fetchedShopifyItem, sanityDocument }
      }
      return null
    }

    if (shopifyNode && !sanityDocument) {
      const existingDoc = await documentByShopifyId(shopifyNode.id)
      if (existingDoc) {
        return {
          shopifyNode,
          sanityDocument: existingDoc,
        }
      }

      const completeShopifyItem = await fetchItemById(shopifyNode.id, false)
      if (!completeShopifyItem) return null
      const op = await syncSanityDocument(completeShopifyItem)

      return {
        shopifyNode,
        sanityDocument: op.sanityDocument,
      }
    }
    // typescript should know better
    throw new Error('how did we get here?')
  }

  const makeRelationships = async ({
    operation,
    related,
  }: SyncOperationResult): Promise<LinkOperation> => {
    const { sanityDocument } = operation
    const initialPairs = await fetchRelatedDocs(related)
    const pairQueue = new PQueue({ concurrency: 1 })

    const completePairs = await pairQueue.addAll(
      initialPairs.map((pair) => () => completePair(pair))
    )
    // At this point we have the already-synced document,
    // and all of the documents that it should be related to

    const relatedDocs = definitely<RelatedPair>(completePairs).map(
      ({ sanityDocument }) => sanityDocument
    )
    const linkOperation = await syncRelationships(sanityDocument, relatedDocs)

    return linkOperation
  }

  const archiveProducts = async (products: Product[], logger: Logger) => {
    const allSanityProducts = await fetchAllSanityDocuments({
      types: ['shopifyProduct'],
    })

    // Find all sanity products that do not have corresponding Shopify products
    const productsToArchive = allSanityProducts.filter(
      (sanityDocument) =>
        sanityDocument.archived !== true &&
        !Boolean(
          products.find(
            (shopifyProduct) => shopifyProduct.id === sanityDocument.shopifyId
          )
        )
    )

    const archiveQueue = new PQueue({ concurrency: 1 })
    await archiveQueue.addAll(
      productsToArchive.map((product) => async () => {
        await archiveSanityDocument(product)
        logger.logArchived(product)
      })
    )

    return productsToArchive
  }

  const archiveCollections = async (
    collections: Collection[],
    logger: Logger
  ) => {
    const allSanityProducts = await fetchAllSanityDocuments({
      types: ['shopifyCollection'],
    })

    const collectionsToArchive = allSanityProducts.filter(
      (sanityDocument) =>
        sanityDocument.archived !== true &&
        !Boolean(
          collections.find(
            (shopifyCollection) =>
              shopifyCollection.id === sanityDocument.shopifyId
          )
        )
    )

    const archiveQueue = new PQueue({ concurrency: 1 })
    await archiveQueue.addAll(
      collectionsToArchive.map((collection) => async () => {
        await archiveSanityDocument(collection)
        logger.logArchived(collection)
      })
    )

    return collectionsToArchive
  }

  /**
   * Public API methods
   *
   * These are responsible for:
   * - coordinating the fetching, syncing, and linking of docs
   * - logging the events
   */

  /* Initializes the syncState */
  const initialize = async () => {
    const secrets = await fetchSecrets()
    const { isError } = await testSecrets(secrets)

    init(!isError, secrets.shopName)
  }

  /* Saves the Storefront name and API key to Sanity */

  const saveSecrets = async (secrets: ShopifySecrets) => {
    const { isError, message } = await testSecrets(secrets)
    if (isError) {
      onSavedSecretsError(message)
      return
    }
    await saveSecretsToSanity(secrets)
    onSavedSecrets(secrets.shopName)
  }

  const clearSecrets = async () => {
    await clearSecretsFromSanity()
    onClearedSecrets()
  }

  /* Syncs a product and any collections it is related to */
  const syncProductByHandle = async (
    handle: string,
    cbs: SubscriptionCallbacks = {}
  ) => {
    startSync()
    const logger = createLogger(cbs)
    const shopifyProduct = await fetchShopifyProduct({ handle })
    if (!shopifyProduct) {
      onFetchComplete()
      const sanityDoc = await documentByHandle(handle, 'product')
      archiveSanityDocument(sanityDoc)
      onComplete()
      return
    }
    logger.logFetched(shopifyProduct)

    onDocumentsFetched([shopifyProduct])
    onFetchComplete()
    const syncResult = await syncProduct(shopifyProduct)

    const { sanityDocument } = syncResult.operation
    logger.logSynced(syncResult.operation)
    onDocumentSynced(syncResult.operation)
    const linkOperation = await makeRelationships(syncResult)

    onDocumentLinked(linkOperation)
    logger.logLinked(sanityDocument, linkOperation.pairs)
    logger.logComplete({
      type: 'complete',
      sanityDocument,
      shopifySource: shopifyProduct,
    })
    onComplete()
  }

  /* Syncs a collection and any products it is related to */
  const syncCollectionByHandle = async (
    handle: string,
    cbs: SubscriptionCallbacks = {}
  ) => {
    startSync()
    const logger = createLogger(cbs)
    const shopifyCollection = await fetchShopifyCollection({ handle })
    if (!shopifyCollection) {
      onFetchComplete()
      const sanityDoc = await documentByHandle(handle, 'collection')
      archiveSanityDocument(sanityDoc)
      onComplete()
      return
    }

    onDocumentsFetched([shopifyCollection])
    onFetchComplete()
    logger.logFetched(shopifyCollection)
    const syncResult = await syncCollection(shopifyCollection)
    onDocumentSynced(syncResult.operation)
    const linkOperation = await makeRelationships(syncResult)
    onDocumentLinked(linkOperation)
    onComplete()
  }

  /* Sync an item by ID */
  const syncItemByID = async (id: string, cbs: SubscriptionCallbacks = {}) => {
    startSync()
    const logger = createLogger(cbs)
    const shopifyItem = await fetchItemById(id, true)

    if (!shopifyItem) {
      onFetchComplete()
      const sanityDoc = await documentByShopifyId(id)
      archiveSanityDocument(sanityDoc)
      onComplete()
      return
    }

    onDocumentsFetched([shopifyItem])
    logger.logFetched(shopifyItem)
    if (shopifyItem.__typename === 'Product') {
      const syncResult = await syncProduct(shopifyItem)
      onDocumentSynced(syncResult.operation)
      const linkOperation = await makeRelationships(syncResult)
      onDocumentLinked(linkOperation)
      onComplete()
      return
    }

    if (shopifyItem.__typename === 'Collection') {
      const syncResult = await syncCollection(shopifyItem)
      onDocumentSynced(syncResult.operation)
      const linkOperation = await makeRelationships(syncResult)
      onDocumentLinked(linkOperation)
      onComplete()
      return
    }
    // @ts-ignore
    throw new Error(`Item type ${shopifyItem.__typename} is not supported`)
  }

  /* Syncs all products */
  const syncProducts = async (cbs: SubscriptionCallbacks = {}) => {
    startSync()

    // do an initial fetch of all docs to populate the cache
    await fetchAllSanityDocuments()

    const logger = createLogger(cbs)

    const onProgress = (products: Product[]) => {
      onDocumentsFetched(products)
    }

    const allProducts = await fetchAllShopifyProducts(onProgress)
    logger.logFetched(allProducts)
    onFetchComplete()

    const queue = new PQueue({ concurrency: 1 })
    const results = await queue.addAll(
      allProducts.map((product) => async () => {
        const result = await syncProduct(product)
        onDocumentSynced(result.operation)
        logger.logSynced(result.operation)
        return result
      })
    )

    const relationshipQueue = new PQueue({ concurrency: 1 })
    await relationshipQueue.addAll(
      results.map((result) => async () => {
        const linkOperation = await makeRelationships(result)
        logger.logLinked(result.operation.sanityDocument, linkOperation.pairs)
        onDocumentLinked(linkOperation)
        return linkOperation.pairs
      })
    )
    await archiveProducts(allProducts, logger)
    onComplete()
  }

  /* Syncs all collections */
  const syncCollections = async (cbs: SubscriptionCallbacks = {}) => {
    startSync()
    // do an initial fetch of all docs to populate the cache
    await fetchAllSanityDocuments()
    const logger = createLogger(cbs)

    const onProgress = (collections: Collection[]) => {
      onDocumentsFetched(collections)
    }

    const allCollections = await fetchAllShopifyCollections(onProgress)
    logger.logFetched(allCollections)
    onFetchComplete()

    const queue = new PQueue({ concurrency: 1 })

    const results = await queue.addAll(
      allCollections.map((collection) => async () => {
        const result = await syncCollection(collection)
        onDocumentSynced(result.operation)
        logger.logSynced(result.operation)
        return result
      })
    )

    const relationshipQueue = new PQueue({ concurrency: 1 })

    await relationshipQueue.addAll(
      results.map((result) => async () => {
        const linkOperation = await makeRelationships(result)
        logger.logLinked(result.operation.sanityDocument, linkOperation.pairs)
        onDocumentLinked(linkOperation)
        return linkOperation.pairs
      })
    )

    await archiveCollections(allCollections, logger)
    onComplete()
  }

  const syncAll = async (cbs: SubscriptionCallbacks = {}) => {
    startSync()

    // do an initial fetch of all docs to populate the cache
    await fetchAllSanityDocuments()

    const onProgress = (items: Collection[] | Product[]) => {
      onDocumentsFetched(items)
    }

    const logger = createLogger(cbs)

    const fetchCollections = async () => {
      const collections = await fetchAllShopifyCollections(onProgress)
      return collections
    }

    const fetchProducts = async () => {
      const products = await fetchAllShopifyProducts(onProgress)
      return products
    }
    const allProducts = await fetchProducts()
    const allCollections = await fetchCollections()

    const allItems = [...allCollections, ...allProducts]
    onFetchComplete()

    const queue = new PQueue({ concurrency: 1 })

    const results = await queue.addAll(
      allItems.map((item) => async () => {
        const result =
          item.__typename === 'Collection'
            ? await syncCollection(item)
            : item.__typename === 'Product'
            ? await syncProduct(item)
            : null
        if (result === null) throw new Error('Could not sync item')

        onDocumentSynced(result.operation)
        logger.logSynced(result.operation)
        return result
      })
    )

    const relationshipQueue = new PQueue({ concurrency: 1 })

    await relationshipQueue.addAll(
      results.map((result) => async () => {
        const linkOperation = await makeRelationships(result)
        logger.logLinked(result.operation.sanityDocument, linkOperation.pairs)
        onDocumentLinked(linkOperation)
        return linkOperation.pairs
      })
    )

    await archiveProducts(allProducts, logger)
    await archiveCollections(allCollections, logger)

    onComplete()
  }

  const deleteArchivedDocuments = async () => {
    const query = '*[_type == "shopifyProduct" || _type == "shopifyCollection"]'
    await sanityClient
      .patch({ query })
      .unset(['products', 'collections'])
      .commit()
    const deletequery = '*[defined(archived) && archived == true]'

    await sanityClient.delete(
      { query: deletequery },
      { returnFirst: false, returnDocuments: true }
    )
  }

  // @ts-ignore
  window.deleteArchivedDocuments = deleteArchivedDocuments

  return {
    initialize,
    initialState,
    saveSecrets,
    clearSecrets,
    testSecrets,
    syncCollectionByHandle,
    syncProductByHandle,
    syncProducts,
    syncCollections,
    syncAll,
    syncItemByID,
  }
}

export const createSyncingClient = ({
  secrets,
  onStateChange,
}: SaneShopifyConfig): SyncUtils => {
  const { sanity, shopify } = secrets
  const sanityClient = createSanityClient({
    projectId: sanity.projectId,
    dataset: sanity.dataset,
    token: sanity.authToken,
    useCdn: false,
  })

  const shopifyClient = createShopifyClient(shopify)

  return syncUtils(shopifyClient, sanityClient, onStateChange)
}
