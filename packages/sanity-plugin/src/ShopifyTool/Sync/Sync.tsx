import { SyncingClient } from '@sane-shopify/sync-utils'
import { SanityClient, ShopifyClient } from '@sane-shopify/types'
import * as React from 'react'
import { ClientContextValue, Provider } from '../../Provider'

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
  syncingClient: SyncingClient
  children?: ((props: SyncRenderProps) => React.ReactNode) | React.ReactNode
}

const initialState = {
  syncState: 'ready' as 'ready',
  fetchedProducts: [],
  productsSynced: [],
  fetchedCollections: [],
  collectionsSynced: []
}

class SyncBase extends React.Component<Props, State> {
  public state = {
    ...initialState
  }

  public reset = async () => {
    await this.setState(initialState)
  }

  public _syncProducts = async () => {
    await this.props.syncingClient.syncProducts({
      onFetchedItems: (nodes) => {
        this.setState((prevState) => ({
          fetchedProducts: [...prevState.fetchedProducts, ...nodes]
        }))
      },
      onProgress: (product) => {
        this.setState((prevState) => ({
          productsSynced: [...prevState.productsSynced, product]
        }))
      }
    })
  }

  public _syncCollections = async () => {
    await this.props.syncingClient.syncCollections({
      onFetchedItems: (nodes) => {
        this.setState((prevState) => ({
          fetchedCollections: [...prevState.fetchedProducts, ...nodes]
        }))
      },
      onProgress: (collection) => {
        this.setState((prevState) => ({
          collectionsSynced: [...prevState.collectionsSynced, collection]
        }))
      }
    })
  }

  /** Public Methods */

  public syncProductByHandle = async (handle: string) => {
    await this.reset()
    this.setState({ syncState: 'syncing' as 'syncing' })
    await this.props.syncingClient.syncProductByHandle(handle)
    this.setState({ syncState: 'complete' as 'complete' })
  }

  public syncCollectionByHandle = async (handle: string) => {
    await this.reset()
    this.setState({ syncState: 'syncing' as 'syncing' })
    await this.props.syncingClient.syncProductByHandle(handle)
    this.setState({ syncState: 'complete' as 'complete' })
  }

  public syncProducts = async () => {
    await this.reset()
    this.setState({ syncState: 'syncing' as 'syncing' })
    await this._syncProducts()
    this.setState({ syncState: 'complete' as 'complete' })
  }

  public syncCollections = async () => {
    await this.reset()
    this.setState({ syncState: 'syncing' as 'syncing' })
    await this._syncCollections()
    this.setState({ syncState: 'complete' as 'complete' })
  }

  public syncAll = async () => {
    await this.reset()
    this.setState({ syncState: 'syncing' as 'syncing' })
    await Promise.all([this._syncCollections(), this._syncProducts()])
    this.setState({ syncState: 'complete' as 'complete' })
  }

  public render() {
    const { children, ready, valid } = this.props
    const {
      syncProductByHandle,
      syncCollectionByHandle,
      syncProducts,
      syncCollections,
      syncAll
    } = this
    const renderProps = {
      ...this.state,
      syncProductByHandle,
      syncCollectionByHandle,
      syncProducts,
      syncCollections,
      syncAll
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
