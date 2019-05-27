import * as React from 'react'
import { ShopifyClient, SanityClient } from '@sane-shopify/types'
import { createSyncingClient, SyncingClient } from '@sane-shopify/sync-utils'
import { Provider, ClientContextValue } from '../../Provider'

interface State {
  loading: boolean
  fetchedProducts: any[]
  productsSynced: any[]
  fetchedCollections: any[]
  collectionsSynced: any[]
}

export interface SyncRenderProps extends State {
  syncProductByHandle: (handle: string) => Promise<void>
  syncCollectionByHandle: (handle: string) => Promise<void>
  syncProducts: () => Promise<void>
  syncCollections: () => Promise<void>
  syncAll: () => Promise<void>
}

interface Props extends ClientContextValue {
  sanityClient: SanityClient
  shopifyClient: ShopifyClient
  children?: ((props: SyncRenderProps) => React.ReactNode) | React.ReactNode
}

const initialState = {
  fetchedProducts: [],
  productsSynced: [],
  fetchedCollections: [],
  collectionsSynced: [],
}

class SyncBase extends React.Component<Props, State> {
  state = {
    loading: false,
    ...initialState,
  }

  syncingClient: SyncingClient = createSyncingClient(this.props.shopifyClient, this.props.sanityClient)

  reset = async () => {
    await this.setState({ loading: true, ...initialState })
  }

  _syncProducts = async () => {
    await this.syncingClient.syncProducts({
      onFetchedItems: (nodes) => {
        this.setState((prevState) => ({
          fetchedProducts: [...prevState.fetchedProducts, ...nodes],
        }))
      },
      onProgress: (product) => {
        console.log(product)
        this.setState((prevState) => ({
          productsSynced: [...prevState.productsSynced, product],
        }))
      },
    })
  }

  _syncCollections = async () => {
    await this.syncingClient.syncCollections({
      onFetchedItems: (nodes) => {
        this.setState((prevState) => ({
          fetchedCollections: [...prevState.fetchedProducts, ...nodes],
        }))
      },
      onProgress: (product) => {
        this.setState((prevState) => ({
          collectionsSynced: [...prevState.productsSynced, product],
        }))
      },
    })
  }

  /** Public Methods */

  syncProductByHandle = async (handle: string) => {
    await this.reset()
    this.syncingClient.syncProductByHandle(handle)
  }

  syncCollectionByHandle = async (handle: string) => {
    await this.reset()
    this.syncingClient.syncProductByHandle(handle)
  }

  syncProducts = async () => {
    await this.reset()
    this._syncProducts()
  }

  syncCollections = async () => {
    await this.reset()
    this._syncCollections()
  }

  syncAll = async () => {
    await this.reset()
    this._syncCollections()
    this._syncProducts()
  }

  render() {
    const { children, ready, valid } = this.props
    const { syncProductByHandle, syncCollectionByHandle, syncProducts, syncCollections, syncAll } = this
    const renderProps = {
      ...this.state,
      syncProductByHandle,
      syncCollectionByHandle,
      syncProducts,
      syncCollections,
      syncAll,
    }

    return children ? (children instanceof Function ? children(renderProps) : children) : null
  }
}

export const Sync = (props: { children: React.ReactNode }) => (
  <Provider>{(providerProps) => (providerProps.ready ? <SyncBase {...props} {...providerProps} /> : null)}</Provider>
)
