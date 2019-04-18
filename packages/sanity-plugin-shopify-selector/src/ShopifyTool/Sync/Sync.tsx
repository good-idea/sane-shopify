import * as React from 'react'
import { ShopifyClient, Provider } from '../../Provider'
import { Product, Collection } from '../../types'
import { productsQuery, collectionsQuery } from './query'

const sanityClient = require('part:@sanity/base/client')

interface State {
	loading: boolean
}

export interface SyncRenderProps extends State {
	run: () => Promise<void>
}

interface Props {
	client: ShopifyClient
	children?: ((props: SyncRenderProps) => React.ReactNode) | React.ReactNode
}

class SyncBase extends React.Component<Props, State> {
	state = {
		loading: false,
	}

	run = async () => {
		console.log(this.props)
		await this.setState({ loading: true })
		const { client } = this.props
		const things = await client.queryAll(productsQuery, ['data', 'products'])
		console.log(things)
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
