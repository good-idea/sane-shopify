import * as React from 'react'
import { groupBy } from 'ramda'
import { SanityClient, Provider, ClientContextValue } from '../../Provider'
import { ShopifyClient } from '../../shopifyClient'
import { Product, Collection } from '../../types'
import { createSyncingClient } from '../../syncingClient'
// import {
// 	productsQuery,
// 	ProductsQueryResult,
// 	collectionsQuery,
// 	CollectionsQueryResult,
// } from './query'
import {
	FetchingStateAndUpdaters,
	createFetchingState,
	organizeResults,
} from './utils'

import * as utils from './utils'

interface SanityProduct extends Product {
	_id: string
	shopifyId: number
}

interface SanityCollection extends Collection {
	_id: string
	shopifyId: number
}

interface State {
	loading: boolean
	totalProducts: any[]
	productsSynced: any[]
	products: Product[]
	collections: Collection[]
	sanityProducts: SanityProduct[]
	sanityCollections: SanityCollection[]
	fetchingStates: {
		shopifyProducts: FetchingStateAndUpdaters
		shopifyCollections: FetchingStateAndUpdaters
		sanityProducts: FetchingStateAndUpdaters
		sanityCollections: FetchingStateAndUpdaters
		syncedCollections: FetchingStateAndUpdaters
		syncedProducts: FetchingStateAndUpdaters
	}
}

export interface SyncRenderProps {
	valid: boolean
	loading: boolean
	totalProducts: any[]
	productsSynced: any[]
	ready: boolean
	run: () => Promise<void>
}

interface Props extends ClientContextValue {
	sanityClient: SanityClient
	shopifyClient: ShopifyClient
	children?: ((props: SyncRenderProps) => React.ReactNode) | React.ReactNode
}

const productsPath = ['data', 'products']
const collectionsPath = ['data', 'collections']

class SyncBase extends React.Component<Props, State> {
	state = {
		loading: false,
		totalProducts: [],
		productsSynced: [],
		products: [],
		collections: [],
		sanityProducts: [],
		sanityCollections: [],
		fetchingStates: {
			shopifyProducts: createFetchingState('Shopify Products'),
			shopifyCollections: createFetchingState('Shopify Collections'),
			sanityProducts: createFetchingState('Sanity Products'),
			sanityCollections: createFetchingState('Sanity Collections'),
			syncedCollections: createFetchingState('Collections Synced'),
			syncedProducts: createFetchingState('Products Synced'),
		},
	}

	syncingClient = createSyncingClient(
		this.props.shopifyClient,
		this.props.sanityClient,
	)

	getOrCreateDoc = async (
		item: Product | Collection,
		type: 'product' | 'collection',
	) => {
		if (type === 'product') {
			const doc = this.state.sanityProducts.find(sp => sp.shopifyId === item.id)
			console.log(doc)
		}
		// const shopifyType =
		// 	type === 'product' ? 'shopifyProduct' : 'shopifyCollection'

		// const newDoc = {
		// 	_type: shopifyType,
		// 	shopifyId: item.id,
		// 	title: item.title,
		// 	slug: {
		// 		current: item.handle,
		// 	},
		// }
		// const b = await sanityClient.create(newDoc)
		// return b
	}

	syncProduct = async (item: Product) => {
		const doc = await this.getOrCreateDoc(item, 'product')
		// if (!doc) return
		// const { title } = item
		// const patched = await sanityClient
		// 	.patch(doc._id)
		// 	.set({ title })
		// 	.commit()
		// console.log(patched)
	}

	syncCollection = async (item: Collection) => {
		const doc = await this.getOrCreateDoc(item, 'collection')
		console.log(doc)
	}

	run = async () => {
		await this.syncingClient.syncProducts({
			onFetchedItems: nodes => {
				this.setState(prevState => ({
					totalProducts: [...prevState.totalProducts, ...nodes],
				}))
			},
			onProgress: product => {
				console.log(product)
				this.setState(prevState => ({
					productsSynced: [...prevState.productsSynced, product],
				}))
			},
		})
	}

	render() {
		const { children, ready, valid } = this.props
		const { loading, totalProducts, productsSynced } = this.state
		const renderProps = {
			productsSynced,
			totalProducts,
			loading,
			valid,
			ready,
			run: this.run,
		}

		return children
			? children instanceof Function
				? children(renderProps)
				: children
			: null
	}
}

export const Sync = (props: { children: React.ReactNode }) => (
	<Provider>
		{providerProps =>
			providerProps.ready ? <SyncBase {...props} {...providerProps} /> : null
		}
	</Provider>
)
