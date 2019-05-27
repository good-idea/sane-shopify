import * as React from 'react'
import { ShopifyClient } from '@sane-shopify/types'

interface Props {
  id: string
  shopifyClient: ShopifyClient
}

export class SelectedItem extends React.Component<Props> {
  render() {
    console.log(this.props)
    return <p>hi</p>
  }
}
