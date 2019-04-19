import * as React from 'react'
import { ShopifyClient, Provider } from '../../Provider'
import { Product, Collection } from '../../types'
import {
	productsQuery,
	ProductsQueryResult,
	collectionsQuery,
	CollectionsQueryResult,
} from './query'

const sanityClient = require('part:@sanity/base/client')

type PromiseCreator = () => Promise<any>

const poolPromises = (amount: number) => (promises: PromiseCreator[]) =>
	new Promise((pass, fail) => {
		// r is the number of promises, xs is final resolved value
		let r = promises.length,
			xs = []
		// decrement r, save the resolved value in position i, run the next promise
		let next = i => x => (r--, (xs[i] = x), run(promises[amount], amount++))
		// if r is 0, we can resolve the final value xs, otherwise chain next
		let run = (P, i) => (r === 0 ? pass(xs) : P().then(next(i), fail))
		// initialize by running the first n promises
		promises.slice(0, amount).forEach(run)
	})
const limit = poolPromises(5)

interface State {
	loading: boolean
	products: Product[]
	collections: Collection[]
}

export interface SyncRenderProps {
	loading: boolean
	run: () => Promise<void>
}

interface Props {
	client: ShopifyClient
	children?: ((props: SyncRenderProps) => React.ReactNode) | React.ReactNode
}

const productsPath = ['data', 'products']
const collectionsPath = ['data', 'collections']

const sleep = s => new Promise(resolve => setTimeout(resolve, s))

class SyncBase extends React.Component<Props, State> {
	state = {
		loading: false,
		products: [],
		collections: [],
	}

	syncItem = async (type: 'product' | 'collection', item) => {
		await sleep(Math.random() * 5000)
		console.log(item)
		console.log(`synced ${type}: ${item.title}`)
		return true
	}

	run = async () => {
		console.log(this.props)
		await this.setState({ loading: true })
		const { client } = this.props
		const [productsResult, collectionsResult] = await Promise.all([
			client.queryAll<ProductsQueryResult>(productsQuery, productsPath),
			client.queryAll<CollectionsQueryResult>(
				collectionsQuery,
				collectionsPath,
			),
		])
		console.log(productsResult.data.products)
		const products = productsResult.data.products.edges.map(e => e.node)
		const collections = collectionsResult.data.collections.edges.map(
			e => e.node,
		)
		await limit([
			...products.map(product => () => this.syncItem('product', product)),
			...collections.map(collection => () =>
				this.syncItem('collection', collection),
			),
		])

		this.setState({ loading: false })
	}

	render() {
		const { children } = this.props
		const { loading } = this.state
		const renderProps = {
			loading,
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
	<Provider>{({ client }) => <SyncBase {...props} client={client} />}</Provider>
)
