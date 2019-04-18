import * as React from 'react'
import { path } from 'ramda'
import { ShopifyClient, Provider } from '../../Provider'
import { Product, Collection } from '../../types'
import {
	productsQuery,
	ProductsQueryResult,
	collectionsQuery,
	CollectionsQueryResult,
} from './query'

const sanityClient = require('part:@sanity/base/client')

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

class SyncBase extends React.Component<Props, State> {
	state = {
		loading: false,
		products: [],
		collections: [],
	}

	run = async () => {
		console.log(this.props)
		await this.setState({ loading: true })
		const { client } = this.props
		const [productsResult, collectionsResult] = await Promise.all([
			client.queryAll<ProductsQueryResult>(productsQuery, ['data', 'products']),
			client.queryAll<CollectionsQueryResult>(collectionsQuery, [
				'data',
				'collections',
			]),
		])
		console.log(productsResult.data.products)
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
