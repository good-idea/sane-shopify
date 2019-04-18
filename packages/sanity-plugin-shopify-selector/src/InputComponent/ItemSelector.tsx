import * as React from 'react'
import { ShopifyClient, ShopifyItem } from '../Provider/shopifyClient'
import { ShopifySelectorInputOptions, Product, Collection } from './types'
import { buildQuery, QueryResult } from '../queries'
import { ItemCard } from './ItemCard'

interface ItemSelectorProps {
	client: ShopifyClient
	options: ShopifySelectorInputOptions
	setSelection: (item: ShopifyItem) => void
}

interface ItemSelectorState {
	loading: boolean
	products?: Product[]
	collections?: Collection[]
}

const gridStyles = {
	display: 'grid',
	gridTemplateColumns: 'repeat(3, 1fr)',
	gridColumnGap: '5px',
	gridRowGap: '5px',
}

export default class ItemSelector extends React.Component<
	ItemSelectorProps,
	ItemSelectorState
> {
	state = {
		loading: true,
		products: undefined,
		collections: undefined,
	}

	async componentDidMount() {
		const { client, options } = this.props
		const query = buildQuery(options)
		const result = await client.query<QueryResult>(query)
		const { products, collections } = result.data.shop
		console.log(products, collections)
		this.setState({
			products,
			collections,
			loading: false,
		})
	}

	public render() {
		const { loading, products, collections } = this.state

		if (loading) return <p>Loading..</p>

		return (
			<>
				{products && products.length ? (
					<>
						<h3>Products</h3>
						<div style={gridStyles}>
							{products.map(product => (
								<ItemCard {...product} />
							))}
						</div>
					</>
				) : null}
				{collections && collections.length ? (
					<>
						<h3>Collections</h3>
						<div style={gridStyles}>
							{products.map(product => (
								<ItemCard {...product} />
							))}
						</div>
					</>
				) : null}
			</>
		)
	}
}
