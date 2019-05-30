import { unwindEdges } from '@good-idea/unwind-edges'
import {
  COLLECTIONS_QUERY,
  CollectionsQueryResult,
  PRODUCTS_QUERY,
  ProductsQueryResult
} from '@sane-shopify/sync-utils'
import { Collection, Product, ShopifyClient, ShopifyItem } from '@sane-shopify/types'
import * as React from 'react'
import { ShopifySelectorInputOptions } from '../types'
import { ItemCard } from './ItemCard'

interface ItemSelectorProps {
  shopifyClient: ShopifyClient
  options: ShopifySelectorInputOptions
  setSelection: (item: ShopifyItem) => void
}

interface ItemSelectorState {
  fetchingProducts: boolean
  fetchingCollections: boolean
  products?: Product[]
  collections?: Collection[]
}

const gridStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridColumnGap: '5px',
  gridRowGap: '5px'
}

export default class ItemSelector extends React.Component<ItemSelectorProps, ItemSelectorState> {
  public state = {
    fetchingProducts: true,
    fetchingCollections: true,
    products: [],
    collections: []
  }

  public async componentDidMount(): Promise<void> {
    this.fetchProducts()
    this.fetchCollections()
  }

  public fetchProducts = async (after?: string, fetchAll: boolean = false) => {
    if (!this.props.options.products) return
    this.setState({ fetchingProducts: true })
    const result = await this.props.shopifyClient.query<ProductsQueryResult>(PRODUCTS_QUERY, {
      after,
      first: 50
    })
    const [products, { pageInfo, lastCursor }] = unwindEdges(result.data.products)
    const fetchMore = fetchAll && pageInfo.hasNextPage
    this.setState((prevState) => ({
      fetchingProducts: !fetchMore,
      products: [...prevState.products, ...products]
    }))
    if (fetchMore) this.fetchCollections(lastCursor, fetchAll)
  }

  public fetchCollections = async (after?: string, fetchAll: boolean = false) => {
    if (!this.props.options.collections) return
    this.setState({ fetchingCollections: true })
    const result = await this.props.shopifyClient.query<CollectionsQueryResult>(COLLECTIONS_QUERY, {
      after,
      first: 50
    })
    const [collections, { pageInfo, lastCursor }] = unwindEdges(result.data.collections)
    const fetchMore = fetchAll && pageInfo.hasNextPage
    this.setState((prevState) => ({
      fetchingCollections: !fetchMore,
      collections: [...prevState.collections, ...collections]
    }))
    if (fetchMore) this.fetchCollections(lastCursor, fetchAll)
  }

  public render() {
    const { fetchingProducts, fetchingCollections, products, collections } = this.state
    const { options } = this.props

    return (
      <>
        {options.products ? (
          <>
            <h3>Products</h3>
            <div style={gridStyles}>
              {products.map((product) => (
                <ItemCard key={product.id} {...product} />
              ))}
            </div>
            {fetchingProducts ? <h6>Fetching products...</h6> : null}
          </>
        ) : null}
        {options.collections ? (
          <>
            <h3>Collections</h3>
            <div style={gridStyles}>
              {collections.map((collection) => (
                <ItemCard key={collection.id} {...collection} />
              ))}
            </div>
            {fetchingCollections ? <h6>Fetching pollections...</h6> : null}
          </>
        ) : null}
      </>
    )
  }
}
