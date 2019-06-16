import { unwindEdges } from '@good-idea/unwind-edges'
import {
  Collection,
  Product,
  SanityClient,
  SanityShopifyDocument,
  ShopifyClient
} from '@sane-shopify/types'
import { isMatch } from 'lodash-es'
import { empty, from, of } from 'rxjs'

import { catchError, concatMap, delay, expand, map, mergeMap, take } from 'rxjs/operators'
import {
  COLLECTIONS_QUERY,
  CollectionsQueryResult,
  PRODUCT_QUERY,
  ProductQueryResult,
  PRODUCTS_QUERY,
  ProductsQueryResult
} from './shopifyQueries'
import { addImageKeys } from './utils'

export interface SyncingClient {
  syncProducts: (cbs?: SubscriptionCallbacks<Product>) => void
  syncCollections: (cbs?: SubscriptionCallbacks<Collection>) => void
  syncProductByHandle: (handle: string, cbs?: SubscriptionCallbacks<Product>) => void
  syncCollectionByHandle: (handle: string, cbs?: SubscriptionCallbacks<Collection>) => void
}

interface SubscriptionCallbacks<NodeType> {
  onFetchedItems?: (nodes: NodeType[]) => void
  onProgress?: (node: NodeType) => void
  onError?: (err: Error) => void
  onComplete?: () => void
}

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

export const createSyncingClient = (
  shopifyClient: ShopifyClient,
  sanityClient: SanityClient
): SyncingClient => {
  /**
   * Syncs the existing shopify data to a Sanity document.
   * If the document does not exist, it creates it.
   * If there everything is the same, skips the update.
   * If the data is different, patches the existing document.
   */
  const syncSanityDocument = <ExpectedResult>(
    item: Product | Collection,
    doc?: SanityShopifyDocument
  ) => {
    const _type = getItemType(item)
    const docInfo = {
      _type,
      title: item.title,
      shopifyId: item.id,
      handle: item.handle,
      sourceData: addImageKeys(item)
    }
    if (!doc)
      return from(sanityClient.create<ExpectedResult>(docInfo)).pipe(
        map((newDoc) => ({ operation: 'create', doc: newDoc, [_type]: item }))
      )

    return isMatch(doc, docInfo)
      ? of(doc).pipe(map((existingDoc) => ({ operation: 'skip', doc: existingDoc, [_type]: item })))
      : from(
          sanityClient
            .patch<ExpectedResult>(doc._id)
            .set(docInfo)
            .commit()
        ).pipe(map((updatedDoc) => ({ operation: 'update', doc: updatedDoc, [_type]: item })))
  }

  const syncItem = (item: Product | Collection) => {
    const _type = getItemType(item)
    const z = sanityClient.fetch<SanityShopifyDocument>(
      '*[_type == $_type && shopifyId == $shopifyId][0]',
      {
        _type,
        shopifyId: item.id
      }
    )

    const sync$ = from(
      sanityClient.fetch<SanityShopifyDocument>(
        '*[_type == $_type && shopifyId == $shopifyId][0]',
        {
          _type,
          shopifyId: item.id
        }
      )
    ).pipe(
      delay(100),
      mergeMap((doc) => syncSanityDocument<SanityShopifyDocument>(item, doc))
    )
    return sync$
  }

  /**
   * Shopify
   */
  const fetchProduct = (handle: string) =>
    from(shopifyClient.query<ProductQueryResult>(PRODUCT_QUERY, { handle })).pipe(
      map((response) => response.data.productByHandle)
    )

  const fetchAll = <T extends ProductsQueryResult | CollectionsQueryResult>(
    type: 'products' | 'collections',
    onFetchedItems?: (nodes: any[]) => void
  ) => {
    const query = type === 'products' ? PRODUCTS_QUERY : COLLECTIONS_QUERY
    const fetchPage = (after?: string) =>
      from(shopifyClient.query<T>(query, { after, first: 100 })).pipe(
        map((response) => {
          if (response.errors) throw new Error(response.errors[0].message)
          const [nodes, { pageInfo, lastCursor }] = unwindEdges(response.data[type])
          if (onFetchedItems) onFetchedItems(nodes)
          return {
            nodes,
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
      concatMap(({ nodes }) => nodes)
    )

    return allItemsStream
  }

  const syncItems = <ItemType = Product | Collection>(itemType: 'products' | 'collections') => ({
    onFetchedItems,
    onProgress,
    onError,
    onComplete
  }: SubscriptionCallbacks<ItemType> = {}) =>
    new Promise((resolve) => {
      const products$ = fetchAll(itemType, onFetchedItems)
        .pipe(
          mergeMap((node: Product) => syncItem(node), undefined, 25)
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
      return products$
    })

  const syncItemByHandle = <ItemType = Product | Collection>(
    itemType: 'product' | 'collection'
  ) => (handle, { onProgress, onError, onComplete }: SubscriptionCallbacks<ItemType> = {}) => {
    const product$ = fetchProduct(handle)
      .pipe(mergeMap((node: Product) => syncItem(node)))
      .subscribe(
        // @ts-ignore
        (product) => onProgress && onProgress(product),
        (error) => onError && onError(error),
        () => onComplete && onComplete()
      )
  }

  /**
   * Public API
   */
  const syncProducts = syncItems<Product>('products')
  const syncCollections = syncItems<Collection>('collections')

  const syncProductByHandle = syncItemByHandle<Product>('product')
  const syncCollectionByHandle = syncItemByHandle<Collection>('collection')

  return {
    syncProducts,
    syncCollections,
    syncCollectionByHandle,
    syncProductByHandle
  }
}
