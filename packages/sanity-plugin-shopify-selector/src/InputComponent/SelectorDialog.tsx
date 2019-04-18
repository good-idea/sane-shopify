import * as React from 'react'
import DefaultDialog from 'part:@sanity/components/dialogs/default'
import ItemSelector from './ItemSelector'
import { ShopifySelectorInputOptions } from './types'
import { ShopifyClient, ShopifyItem } from '../Provider/shopifyClient'

interface SelectorDialogProps {
	close: () => void
	client: ShopifyClient
	saveItem: (i: ShopifyItem) => void
	options: ShopifySelectorInputOptions
}

interface SelectorDialogState {
	selectedItem?: any
}

const dialogButtonActions = [
	{
		index: '1',
		title: 'Select',
		color: 'primary',
	},
	{
		index: '2',
		title: 'Cancel',
		color: 'white',
		secondary: true,
	},
]

export class SelectorDialog extends React.Component<
	SelectorDialogProps,
	SelectorDialogState
> {
	handleAction = action => {
		const { close } = this.props
		console.log(action)
		switch (action.title) {
			case 'Select':
				console.log('SELECTED')
				close()
				return
			case 'Cancel':
				this.setSelection(undefined)
				close()
				return
			default:
				throw new Error(`There is no handler for acion "${action.title}"`)
		}
	}

	cancel = () => {
		this.setSelection(undefined)
		this.props.close()
	}

	setSelection = (selectedItem: ShopifyItem) => {
		this.setState({
			selectedItem,
		})
	}

	public render() {
		const { client, options } = this.props
		return (
			<DefaultDialog
				onClose={this.cancel}
				onEscape={this.cancel}
				onClickOutside={this.cancel}
				title="Select Shopify Item"
				actions={dialogButtonActions}
				onAction={this.handleAction}
			>
				<ItemSelector
					client={client}
					setSelection={this.setSelection}
					options={options}
				/>
			</DefaultDialog>
		)
	}
}
