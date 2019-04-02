import * as React from 'react'
import PatchEvent, {
	set,
	unset,
	setIfMissing,
} from 'part:@sanity/form-builder/patch-event'
import { FaTrashAlt } from 'react-icons/fa'
import { Secrets } from '../utils/secrets'
import Button from 'part:@sanity/components/buttons/default'
import Fieldset from 'part:@sanity/components/fieldsets/default'
import { ShopifyClient, createClient } from '../utils/request'
import { SanityInputProps } from '../types'
import { SelectedItem } from './SelectedItem'

interface Props extends SanityInputProps {
	secrets: Secrets
}

const defaultOptions = {
	collections: true,
	products: true,
}

interface State {
	open: boolean
	itemId?: string
}

export class ShopifyInput extends React.Component<Props, State> {
	client: ShopifyClient = createClient(this.props.secrets)

	state = {
		open: false,
		itemId: undefined,
	}

	openSelector = () => {
		this.setState({ open: true })
	}

	render() {
		const { type } = this.props
		const { open, itemId } = this.state
		console.log(this.props)
		const { title } = type

		const options = {
			...defaultOptions,
			...type.options,
		}
		return (
			<Fieldset legend={title} level={1}>
				{open ? (
					<p>open</p>
				) : !itemId || !itemId.length ? (
					<Button color="primary" kind="default" onClick={this.openSelector}>
						Select an Item
					</Button>
				) : (
					<SelectedItem id={itemId} client={this.client} />
				)}
			</Fieldset>
		)
	}
}
