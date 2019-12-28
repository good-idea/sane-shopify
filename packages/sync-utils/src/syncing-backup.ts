import { unwindEdges } from '@good-idea/unwind-edges'
import {
  Collection,
  Product,
  SanityClient,
  SanityShopifyDocument,
  ShopifyClient,
  SaneShopifyConfig
} from '@sane-shopify/types'
import { isMatch } from 'lodash-es'
import { empty, from, of } from 'rxjs'
import {
  catchError,
  concatMap,
  delay,
  expand,
  map,
  mergeMap
} from 'rxjs/operators'
import createSanityClient from '@sanity/client'
import { createShopifyClient } from '../shopify'

import {
  NODE_QUERY,
  NodeQueryResult,
  COLLECTION_QUERY,
  CollectionQueryResult,
  COLLECTIONS_QUERY,
  CollectionsQueryResult,
  PRODUCT_QUERY,
  ProductQueryResult,
  PRODUCTS_QUERY,
  ProductsQueryResult
} from './shopifyQueries'
import { buildProductReferences, prepareSourceData } from './utils'

export interface SyncingClient {
  syncProducts: (cbs?: SubscriptionCallbacks<Product>) => void
  syncCollections: (cbs?: SubscriptionCallbacks<Collection>) => void
  syncProductByHandle: (
    handle: string,
    cbs?: SubscriptionCallbacks<Product>
  ) => void
  syncCollectionByHandle: (
    handle: string,
    cbs?: SubscriptionCallbacks<Collection>
  ) => void
  syncItemByID: (
    id: string,
    cbs?: SubscriptionCallbacks<Product | Collection>
  ) => void
}

interface SubscriptionCallbacks<NodeType> {
  onFetchedItems?: (nodes: NodeType[]) => void
  onProgress?: (node: NodeType) => void
  onError?: (err: Error) => void
  onComplete?: (payload?: any) => void
}

// TODO: the use of 'shopifyProduct' and 'shopifyCollection' should
// use constants shared throughout sane-shopify
const getItemType = (item: Product | Collection) => {
  switch (item.__typename) {
    case 'Product':
      return 'shopifyProduct'
    case 'Collection':
      return 'shopifyCollection'
    case undefined:
      throw new Error('The supplied item does not have a __typename')
    default:
      throw new Error(
        // @ts-ignore
        `The __typename '${item.__typename}' is not currently supported`
      )
  }
}

export const mergeClients = (
  shopifyClient: ShopifyClient,
  sanityClient: SanityClient
) => {
  /**
   * Syncs the existing shopify data to a Sanity document.
   * If the document does not exist, it creates it.
   * If there everything is the same, skips the update.
   * If the data is different, patches the existing document.
   */
  const syncSanityDocument = async <ExpectedResult>(
    item: Product | Collection,
    doc?: SanityShopifyDocument
  ) => {
    const _type = getItemType(item)
    const sourceData = prepareSourceData(item)
    const docInfo =
      item.__typename === 'Collection'
        ? {
            _type,
            title: item.title,
            shopifyId: item.id,
            handle: item.handle,
            products: {
              products: await buildProductReferences(
                sanityClient,
                item.products
              )
            },
            sourceData
          }
        : {
            _type,
            title: item.title,
            shopifyId: item.id,
            handle: item.handle,
            sourceData
          }
    if (!doc)
      return from(sanityClient.create<ExpectedResult>(docInfo)).pipe(
        map((newDoc) => ({ operation: 'create', doc: newDoc, [_type]: item }))
      )

    return isMatch(doc, docInfo)
      ? of(doc).pipe(
          map((existingDoc) => ({
            operation: 'skip',
            doc: existingDoc,
            [_type]: item
          }))
        )
      : from(
          sanityClient
            .patch<ExpectedResult>(doc._id)
            .set(docInfo)
            .commit()
        ).pipe(
          map((updatedDoc) => ({
            operation: 'update',
            doc: updatedDoc,
            [_type]: item
          }))
        )
  }

  const syncItem = (item: Product | Collection) => {
    const _type = getItemType(item)
    const sync$ = from(
      sanityClient.fetch<SanityShopifyDocument>(
        '*[_type == $_type && shopifyId == $shopifyId][0]',
        {
          _type,
          shopifyId: item.id
        }
      )
    ).pipe(
      delay(100), // For rate limiting. TODO: implement real throttling
      mergeMap((doc: SanityShopifyDocument) =>
        syncSanityDocument<SanityShopifyDocument>(item, doc)
      )
    )
    return sync$
  }

  /**
   * Shopify
   */
  const fetchProduct = async (handle: string) => {
    const product = await shopifyClient.query<ProductQueryResult>(
      PRODUCT_QUERY,
      { handle }
    )
    return product
  }

  /* NOTE: This only works with the Storefront API IDs, which are not returned by webhooks */
  const fetchItemById = async <ItemType = Product | Collection>(id: string) =>
    shopifyClient.query<NodeQueryResult<ItemType>>(NODE_QUERY, { id })

  /* Merges in multiple pages of child products */
  const mergeCollectionProducts = (
    c1: Collection,
    c2: Collection
  ): Collection => ({
    ...c1,
    products: {
      pageInfo: {
        hasPreviousPage: c1.products.pageInfo.hasPreviousPage,
        hasNextPage: c2.products.pageInfo.hasNextPage
      },
      edges: [...c1.products.edges, ...c2.products.edges]
    }
  })

  /* Takes a fetched collection and continues to fetch all of its paginated products,
   * returning a single collection with all edges merged in */
  const fetchLaterProducts = async (
    collection: Collection
  ): Promise<Collection> => {
    if (!collection.products) return collection
    if (collection.products.pageInfo.hasNextPage === false) return collection
    const { handle } = collection
    const [_, { lastCursor }] = unwindEdges(collection.products)
    const response = await shopifyClient.query<CollectionQueryResult>(
      COLLECTION_QUERY,
      {
        handle,
        productsFirst: 20,
        productsAfter: lastCursor
      }
    )
    const nextPage = response.data.collectionByHandle

    const withLaterPages = await fetchLaterProducts(nextPage)
    return mergeCollectionProducts(collection, withLaterPages)
  }

  const fetchAll = <T extends ProductsQueryResult | CollectionsQueryResult>(
    type: 'products' | 'collections',
    onFetchedItems?: (nodes: any[]) => void
  ) => {
    const query = type === 'products' ? PRODUCTS_QUERY : COLLECTIONS_QUERY
    const fetchPage = (after?: string, productsAfter?: string) =>
      from(
        shopifyClient.query<T>(query, {
          after,
          first: 100,
          productsAfter,
          productsFirst: 20
        })
      ).pipe(
        mergeMap(async (response) => {
          if (response.errors) throw new Error(response.errors[0].message)

          const [nodes, { pageInfo, lastCursor }] = unwindEdges<
            Product | Collection
          >(response.data[type])
          if (onFetchedItems) onFetchedItems(nodes)

          /* If fetching collections, recursively fetch *all* paginated products */
          const recursivelyFetchedNodes =
            type === 'collections'
              ? //
                // @ts-ignore --- not sure how to tell ts that these will always be collections
                await Promise.all(nodes.map(fetchLaterProducts))
              : nodes
          return {
            nodes: recursivelyFetchedNodes,
            next: pageInfo.hasNextPage ? () => fetchPage(lastCursor) : empty
          }
        }),
        catchError((error) => {
          return of(error)
        })
      )

    const allItemsStream = fetchPage().pipe(
      /* continue calling the next() function. If there are no more pages, this will run emtpy() */
      expand(({ next }) => next()),
      /* Turn each node result into an event */
      concatMap(({ nodes }) => nodes),
      catchError((error) => {
        return of(error)
      })
    )

    return allItemsStream
  }

  const syncItems = <ItemType = Product | Collection>(
    itemType: 'products' | 'collections'
  ) => ({
    onFetchedItems,
    onProgress,
    onError,
    onComplete
  }: SubscriptionCallbacks<ItemType> = {}) =>
    new Promise((resolve) => {
      const items$ = fetchAll(itemType, onFetchedItems)
        .pipe(
          mergeMap((node: Product) => syncItem(node), undefined, 25),
          catchError((err) => {
            return of(err)
          })
          // take(5) // Uncomment for debugging
        )
        .subscribe(
          (item: ItemType) => onProgress && onProgress(item),
          (error) => onError && onError(error),
          () => {
            if (onComplete && typeof onComplete === 'function') onComplete()
            resolve()
          }
        )
      return items$
    })

  const syncItemByHandle = <ItemType = Product | Collection>(
    // TODO this only handles products right now
    itemType: 'product' | 'collection'
  ) => (
    handle: string,
    { onProgress, onError, onComplete }: SubscriptionCallbacks<ItemType> = {}
  ) => {
    const item$ = from(fetchProduct(handle))
      .pipe(map((response) => response.data.productByHandle))
      .pipe(mergeMap((node: Product) => syncItem(node)))
      .subscribe(
        // @ts-ignore
        (product) => onProgress && onProgress(product),
        (error) => onError && onError(error),
        () => onComplete && onComplete()
      )
    return item$
  }

  const syncItemByID = <ItemType = Product | Collection>(
    id: string,
    { onProgress, onError, onComplete }: SubscriptionCallbacks<ItemType> = {}
  ) => {
    const item$ = from(fetchItemById<ItemType>(id))
      .pipe(map((response) => response.data.node))
      // @ts-ignore
      .pipe(mergeMap((node: ItemType) => syncItem(node)))
      .subscribe(
        // @ts-ignore
        (product) => onProgress && onProgress(product),
        (error) => onError && onError(error),
        () => onComplete && onComplete()
      )
    return item$
  }

  /**
   * Public API
   */
  const syncProducts = syncItems<Product>('products')
  const syncCollections = syncItems<Collection>('collections')

  // const syncProductById = (id: string, callbacks: SubscriptionCallbacks<Product>) =>
  //   syncItemByID<Product>(id, callbacks)
  // const syncCollectionById = (id: string, callbacks: SubscriptionCallbacks<Collection>) =>
  //   syncItemByID<Collection>(id, callbacks)

  const syncProductByHandle = syncItemByHandle<Product>('product')
  const syncCollectionByHandle = syncItemByHandle<Collection>('collection')

  return {
    syncProducts,
    syncCollections,
    syncCollectionByHandle,
    syncProductByHandle,
    syncItemByID
  }
}

export const createSyncingClient = ({
  shopify,
  sanity
}: SaneShopifyConfig): SyncingClient => {
  const shopifyClient = createShopifyClient({
    storefrontApiKey: shopify.accessToken,
    storefrontName: shopify.shopName
  })

  const sanityClient = createSanityClient({
    projectId: sanity.projectId,
    dataset: sanity.dataset,
    token: sanity.authToken
  })

  return mergeClients(shopifyClient, sanityClient)
}
