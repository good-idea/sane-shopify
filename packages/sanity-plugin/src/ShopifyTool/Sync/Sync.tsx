import * as React from 'react'
import { ShopifyClient, SanityClient } from '@sane-shopify/types'
import { createSyncingClient, SyncingClient } from '@sane-shopify/sync-utils'
import { Provider, ClientContextValue } from '../../Provider'

interface State {
  syncState: 'ready' | 'syncing' | 'complete'
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
  syncState: 'ready' as 'ready',
  fetchedProducts: [],
  productsSynced: [],
  fetchedCollections: [],
  collectionsSynced: [],
}

class SyncBase extends React.Component<Props, State> {
  state = {
    ...initialState,
  }

  syncingClient: SyncingClient = createSyncingClient(
    this.props.shopifyClient,
    this.props.sanityClient,
  )

  reset = async () => {
    await this.setState(initialState)
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
      onProgress: (collection) => {
        console.log(collection)
        this.setState((prevState) => ({
          collectionsSynced: [...prevState.collectionsSynced, collection],
        }))
      },
    })
  }

  /** Public Methods */

  syncProductByHandle = async (handle: string) => {
    await this.reset()
    this.setState({ syncState: 'syncing' as 'syncing' })
    await this.syncingClient.syncProductByHandle(handle)
    this.setState({ syncState: 'complete' as 'complete' })
  }

  syncCollectionByHandle = async (handle: string) => {
    await this.reset()
    this.setState({ syncState: 'syncing' as 'syncing' })
    this.syncingClient.syncProductByHandle(handle)
    this.setState({ syncState: 'complete' as 'complete' })
  }

  syncProducts = async () => {
    await this.reset()
    this.setState({ syncState: 'syncing' as 'syncing' })
    this._syncProducts()
    this.setState({ syncState: 'complete' as 'complete' })
  }

  syncCollections = async () => {
    await this.reset()
    this.setState({ syncState: 'syncing' as 'syncing' })
    this._syncCollections()
    this.setState({ syncState: 'complete' as 'complete' })
  }

  syncAll = async () => {
    await this.reset()
    this.setState({ syncState: 'syncing' as 'syncing' })
    this._syncCollections()
    this._syncProducts()
    this.setState({ syncState: 'complete' as 'complete' })
  }

  render() {
    const { children, ready, valid } = this.props
    const {
      syncProductByHandle,
      syncCollectionByHandle,
      syncProducts,
      syncCollections,
      syncAll,
    } = this
    const renderProps = {
      ...this.state,
      syncProductByHandle,
      syncCollectionByHandle,
      syncProducts,
      syncCollections,
      syncAll,
    }

    return children
      ? children instanceof Function
        ? children(renderProps)
        : children
      : null
  }
}

export const Sync = (props: { children: React.ReactNode }) => (
  <Provider>
    {(providerProps) =>
      providerProps.ready ? <SyncBase {...props} {...providerProps} /> : null
    }
  </Provider>
)
