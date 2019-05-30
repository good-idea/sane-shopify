import { ShopifyClient, ShopifyItem } from '@sane-shopify/types'
import * as React from 'react'
import { SanityInputProps } from '../types'
import { SelectedItem } from './SelectedItem'
import { SelectorDialog } from './SelectorDialog'
/* tslint:disable */
const Button = require('part:@sanity/components/buttons/default')
const Fieldset = require('part:@sanity/components/fieldsets/default')
/* tslint:enable*/

interface Props extends SanityInputProps {
  shopifyClient: ShopifyClient
}

const defaultOptions = {
  collections: true,
  products: true
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
  public state = {
    open: false,
    itemId: undefined
  }

  public openSelector = () => {
    this.setState({ open: true })
  }

  public closeSelector = () => {
    this.setState({ open: false })
  }

  public saveItem = (item: ShopifyItem) => {
    // ...
  }

  public render() {
    const { type, shopifyClient } = this.props
    const { open, itemId } = this.state
    const { title, options: userOptions } = type

    const options = {
      ...defaultOptions,
      ...userOptions
    }

    return (
      <Fieldset legend={title} level={1}>
        {open ? (
          <SelectorDialog
            shopifyClient={shopifyClient}
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
          <SelectedItem id={itemId} shopifyClient={shopifyClient} />
        )}
      </Fieldset>
    )
  }
}
