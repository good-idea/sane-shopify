import * as React from 'react'
import { ShopifyClient } from '../utils/request'

interface Props {
	id: string
	client: ShopifyClient
}

export class SelectedItem extends React.Component<Props> {
	render() {
		console.log(this.props)
		return <p>hi</p>
	}
}
