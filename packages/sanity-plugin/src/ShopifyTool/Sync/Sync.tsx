import * as React from 'react'
import { ShopifyClient, SanityClient } from '@sane-shopify/types'
import { createSyncingClient, SyncingClient } from '@sane-shopify/sync-utils'
import { Provider, ClientContextValue } from '../../Provider'

interface State {
  fetchedProducts: any[]
  productsSynced: any[]
  productsState: string
  fetchedCollections: any[]
  collectionsSynced: any[]
  collectionsState: string
}

export interface SyncRenderProps extends State {
  loading: boolean
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
  productsState: 'rest',
  fetchedCollections: [],
  collectionsSynced: [],
  collectionsState: 'rest',
}

class SyncBase extends React.Component<Props, State> {
  state = {
    ...initialState,
  }

  syncingClient: SyncingClient = createSyncingClient(this.props.shopifyClient, this.props.sanityClient)

  reset = async () => {
    await this.setState(initialState)
  }

  _syncProducts = async () => {
    this.setState({ productsState: 'syncing' })
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
      onComplete: () => {
        this.setState({ productsState: 'complete' })
      },
    })
  }

  _syncCollections = async () => {
    this.setState({ collectionsState: 'syncing' })
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
      onComplete: () => {
        this.setState({ collectionsState: 'complete' })
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
    const loading = Boolean(this.state.productsState === 'syncing' || this.state.collectionsState === 'syncing')
    const renderProps = {
      ...this.state,
      loading,
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
