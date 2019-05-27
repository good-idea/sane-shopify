import * as React from 'react'
import { unwindEdges } from '@good-idea/unwind-edges'
import { ShopifyClient, ShopifyItem, Product, Collection } from '@sane-shopify/types'
import { ShopifySelectorInputOptions } from '../types'
import { ItemCard } from './ItemCard'
import { PRODUCTS_QUERY, COLLECTIONS_QUERY, CollectionsQueryResult, ProductsQueryResult } from '@sane-shopify/sync-utils'

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
  gridRowGap: '5px',
}

export default class ItemSelector extends React.Component<ItemSelectorProps, ItemSelectorState> {
  state = {
    fetchingProducts: true,
    fetchingCollections: true,
    products: [],
    collections: [],
  }

  async componentDidMount() {
    this.fetchProducts()
    this.fetchCollections()
  }

  fetchProducts = async (after?: string, fetchAll: boolean = false) => {
    if (!this.props.options.products) return
    this.setState({ fetchingProducts: true })
    const result = await this.props.shopifyClient.query<ProductsQueryResult>(PRODUCTS_QUERY, { first: 50, after })
    const [products, { pageInfo, lastCursor }] = unwindEdges(result.data.products)
    const fetchMore = fetchAll && pageInfo.hasNextPage
    this.setState((prevState) => ({
      fetchingProducts: !fetchMore,
      products: [...prevState.products, ...products],
    }))
    if (fetchMore) this.fetchCollections(lastCursor, fetchAll)
  }

  fetchCollections = async (after?: string, fetchAll: boolean = false) => {
    if (!this.props.options.collections) return
    this.setState({ fetchingCollections: true })
    const result = await this.props.shopifyClient.query<CollectionsQueryResult>(COLLECTIONS_QUERY, { first: 50, after })
    const [collections, { pageInfo, lastCursor }] = unwindEdges(result.data.collections)
    const fetchMore = fetchAll && pageInfo.hasNextPage
    this.setState((prevState) => ({
      fetchingCollections: !fetchMore,
      collections: [...prevState.collections, ...collections],
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
                <ItemCard {...product} />
              ))}
            </div>
            {fetchingProducts ? <h6>Fetching products...</h6> : null}
          </>
        ) : null}
        {options.collections ? (
          <>
            <h3>Collections</h3>
            <div style={gridStyles}>
              {collections.map((product) => (
                <ItemCard {...product} />
              ))}
            </div>
            {fetchingCollections ? <h6>Fetching pollections...</h6> : null}
          </>
        ) : null}
      </>
    )
  }
}
