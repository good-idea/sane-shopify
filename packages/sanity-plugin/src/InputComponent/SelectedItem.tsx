import { ShopifyClient } from '@sane-shopify/types'
import * as React from 'react'

interface Props {
  id: string
  shopifyClient: ShopifyClient
}

export class SelectedItem extends React.Component<Props> {
  public render() {
    return <p>hi</p>
  }
}
