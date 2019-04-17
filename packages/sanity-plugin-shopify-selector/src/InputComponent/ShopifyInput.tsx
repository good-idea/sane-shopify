import * as React from 'react'
import PatchEvent, {
	set,
	unset,
	setIfMissing,
} from 'part:@sanity/form-builder/patch-event'
import { FaTrashAlt } from 'react-icons/fa'
import Button from 'part:@sanity/components/buttons/default'
import Fieldset from 'part:@sanity/components/fieldsets/default'
import { ShopifyClient, ShopifyItem } from './ClientContext/shopifyClient'
import { SanityInputProps } from './types'
import { SelectorDialog } from './SelectorDialog'
import { SelectedItem } from './SelectedItem'

interface Props extends SanityInputProps {
	client: ShopifyClient
}

const defaultOptions = {
	collections: true,
	products: true,
}

interface State {
	open: boolean
	itemId?: string
}

/**
 * ShopifyInput
 *
 * After setting up credentials, the main base field.
 * Launches the Selector dialog,
 * Displays a thumbnail of the selected item,
 * and handles writing to sanity.
 */

export class ShopifyInput extends React.Component<Props, State> {
	state = {
		open: false,
		itemId: undefined,
	}

	openSelector = () => {
		this.setState({ open: true })
	}

	closeSelector = () => {
		this.setState({ open: false })
	}

	saveItem = (item: ShopifyItem) => {}

	render() {
		const { type, client } = this.props
		const { open, itemId } = this.state
		const { title, options: userOptions } = type

		const options = {
			...defaultOptions,
			...userOptions,
		}

		return (
			<Fieldset legend={title} level={1}>
				{open ? (
					<SelectorDialog
						client={client}
						saveItem={this.saveItem}
						close={this.closeSelector}
						options={options}
					/>
				) : null}
				{!itemId || !itemId.length ? (
					<Button color="primary" kind="default" onClick={this.openSelector}>
						Select an Item
					</Button>
				) : (
					<SelectedItem id={itemId} client={client} />
				)}
			</Fieldset>
		)
	}
}
