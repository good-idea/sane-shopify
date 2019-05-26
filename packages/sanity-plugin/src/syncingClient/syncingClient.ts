import { ShopifyClient } from '../shopifyClient'
import { Observable, from, empty, of, iif, interval } from 'rxjs'
import {
	map,
	mergeMap,
	expand,
	concatMap,
	throttle,
	delay,
	take,
} from 'rxjs/operators'
import {
	productsQuery,
	collectionsQuery,
	ProductsQueryResult,
	CollectionsQueryResult,
	PRODUCT_QUERY,
	ProductQueryResult,
} from './shopifyQueries'
import { PageInfo, Product, Collection } from '../types'
import { unwindEdges } from '../utils/graphql'

interface SyncingClient {
	syncProduct: () => void
	syncCollection: () => void
	fetchShopifyProduct: () => void
	fetchShopifyCollection: () => void
	fetchSanityProduct: () => void
	fetchSanityCollection: () => void
}

interface SubscriptionCallbacks<NodeType> {
	onProgress?: (node: NodeType) => void
	onError?: (err: Error) => void
	onComplete?: () => void
}

export const createSyncingClient = (
	shopifyClient: ShopifyClient,
	sanityClient: any,
) => {
	const fetchProduct = (handle: string) =>
		from(
			shopifyClient.query<ProductQueryResult>(PRODUCT_QUERY, { handle }),
		).pipe(map(response => response.data.productByHandle))

	const fetchAll = <T extends ProductsQueryResult | CollectionsQueryResult>(
		type: 'products' | 'collections',
	) => {
		const fetchPage = (after?: string) =>
			from(shopifyClient.query<T>(productsQuery, { first: 25, after })).pipe(
				map(response => {
					const [nodes, { pageInfo, lastCursor }] = unwindEdges(
						response.data[type],
					)
					return {
						nodes,
						next: pageInfo.hasNextPage ? () => fetchPage(lastCursor) : empty,
					}
				}),
			)

		const allItemsStream = fetchPage().pipe(
			/* continue calling the next() function. If there are no more pages, this will run emtpy() */
			expand(({ next }) => next()),
			/* Turn each node result into an event */
			concatMap(({ nodes }) => nodes),
		)

		return allItemsStream
	}

	const syncNode = <NodeType>(type: 'product' | 'collection') => (
		node: NodeType,
	) => {}

	const createSanityProduct = (item: Product) => {
		const newDoc = {
			_type: 'shopifyProduct',
			shopifyId: item.id,
			title: item.title,
			slug: {
				current: item.handle,
			},
		}
		return from(sanityClient.create(newDoc))
	}

	const updateSanityProduct = (doc: any, item: Product) => {
		const newDoc = {
			title: item.title,
			slug: {
				current: item.handle,
			},
		}
		return from(
			sanityClient
				.patch(doc._id)
				.set(newDoc)
				.commit(),
		)
	}

	const syncProduct = (product: Product) => {
		const sync$ = from(
			sanityClient.fetch(
				'*[_type == "shopifyProduct" && shopifyId == $shopifyId][0]',
				{ shopifyId: product.id },
			),
		).pipe(
			delay(100),
			mergeMap((doc: any) => {
				return doc
					? updateSanityProduct(doc, product)
					: createSanityProduct(product)
			}),
		)
		return sync$
	}

	const syncProducts = ({
		onProgress,
		onError,
		onComplete,
	}: SubscriptionCallbacks<Product> = {}) =>
		new Promise(resolve => {
			const products$ = fetchAll('products')
				.pipe(mergeMap((node: Product) => syncProduct(node), undefined, 35))
				.subscribe(
					product => onProgress && onProgress(product),
					error => onError && onError(error),
					() => resolve(),
				)
		})

	const syncProductByHandle = (
		handle,
		{ onProgress, onError, onComplete }: SubscriptionCallbacks<Product> = {},
	) => {
		const product$ = fetchProduct(handle)
			.pipe(mergeMap((node: Product) => syncProduct(node)))
			.subscribe(
				//@ts-ignore
				product => onProgress && onProgress(product),
				error => onError && onError(error),
				() => onComplete && onComplete(),
			)
	}

	return {
		syncProducts,
		syncProductByHandle,
	}
}
