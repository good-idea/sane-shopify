import { SyncUtils, Operation } from '@sane-shopify/types'
import * as React from 'react'
import { ClientContextValue, SaneConsumer } from '../../Provider'
import { uniqueBy } from './utils'

interface State {
  syncState: 'ready' | 'syncing' | 'complete'
  fetchedProducts: any[]
  productsSynced: any[]
  fetchedCollections: any[]
  collectionsSynced: any[]
}

export interface SyncRenderProps extends State {
  syncItemByID: (id: string) => Promise<void>
  syncProducts: () => Promise<void>
  syncCollections: () => Promise<void>
  syncAll: () => Promise<void>
}

interface Props extends ClientContextValue {
  syncingClient: SyncUtils
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
  public state = {
    ...initialState,
  }

  public reset = async () => {
    this.setState(initialState)
  }

  _handleProgress = (op: Operation) => {
    if (op.type === 'fetched') {
      const docs = op.shopifyDocuments
      const fetchedProducts = docs.filter((d) => d.__typename === 'Product')
      const fetchedCollections = docs.filter(
        (d) => d.__typename === 'Collection'
      )
      this.setState((initialState) => ({
        fetchedProducts: uniqueBy('id', [
          ...initialState.fetchedProducts,
          ...fetchedProducts,
        ]),
        fetchedCollections: uniqueBy('id', [
          ...initialState.fetchedCollections,
          ...fetchedCollections,
        ]),
      }))
    }

    if (op.type === 'link') {
      const { sourceDoc } = op
      if (sourceDoc._type === 'shopifyProduct') {
        this.setState((initialState) => ({
          productsSynced: [...initialState.productsSynced, sourceDoc],
        }))
      } else {
        this.setState((initialState) => ({
          collectionsSynced: [...initialState.collectionsSynced, sourceDoc],
        }))
      }
    }
  }

  _syncProducts = async () => {
    await this.props.syncingClient.syncProducts({
      onProgress: this._handleProgress,
    })
  }

  _syncCollections = async () => {
    await this.props.syncingClient.syncCollections({
      onProgress: this._handleProgress,
    })
  }

  _syncAll = async () => {
    await this.props.syncingClient.syncAll({
      onProgress: this._handleProgress,
    })
  }

  /** Public Methods */

  public syncItemByID = async (id: string) => {
    await this.reset()
    this.setState({ syncState: 'syncing' as 'syncing' })
    this.props.syncingClient.syncItemByID(id)
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
    await this._syncAll()
    this.setState({ syncState: 'complete' as 'complete' })
  }

  public render() {
    const { children } = this.props
    const { syncItemByID, syncProducts, syncCollections, syncAll } = this

    const renderProps = {
      ...this.state,
      syncItemByID,
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
  <SaneConsumer>
    {(providerProps) =>
      providerProps ? <SyncBase {...props} {...providerProps} /> : null
    }
  </SaneConsumer>
)
