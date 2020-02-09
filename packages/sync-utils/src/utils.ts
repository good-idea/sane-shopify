import { Paginated, unwindEdges } from '@good-idea/unwind-edges'
import {
  Collection,
  Product,
  SanityClient,
  SanityDocumentConfig
} from '@sane-shopify/types'

export const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text

export const getItemType = (item: Product | Collection) => {
  switch (item.__typename) {
    case 'Product':
      return 'shopifyProduct'
    case 'Collection':
      return 'shopifyCollection'
    case undefined:
      throw new Error('The supplied item does not have a __typename')
    default:
      throw new Error(
        // @ts-ignore
        `The __typename '${item.__typename}' is not currently supported`
      )
  }
}

export const getLastCursor = <NodeType>(connection: Paginated<NodeType>) =>
  connection.edges && connection.edges.length > 0
    ? connection.edges[connection.edges.length - 1].cursor
    : null

export const mergePaginatedResults = <NodeType>(
  p1: Paginated<NodeType>,
  p2: Paginated<NodeType>
) => ({
  pageInfo: {
    hasPreviousPage: p1.pageInfo.hasPreviousPage,
    hasNextPage: p2.pageInfo.hasNextPage
  },
  edges: [...p1.edges, ...p2.edges]
})

interface ProductRef {
  _type: 'shopifyProduct'
  _ref: string
  _key: string
}

export const buildProductReferences = async (
  sanityClient: SanityClient,
  products: Paginated<Product>
): Promise<ProductRef> => {
  const [productNodes] = unwindEdges(products)
  const productIds = productNodes.map((node) => node.id)
  const query = '*[_type == "shopifyProduct" && shopifyId in $productIds]'
  const productDocuments = await sanityClient.fetch(query, { productIds })
  const productRefs = productDocuments.map((doc) => ({
    _type: 'reference',
    _ref: doc._id,
    _key: `${doc._rev}-${doc._id}`
  }))
  return productRefs
}

export const prepareSourceData = <T extends Product | Collection>(item: T) => {
  if (item.__typename === 'Product') {
    // Add keys to product images
    return {
      ...item,
      // @ts-ignore
      options: item.options.map(({ id, ...option }) => ({
        ...option,
        _key: id
      })),
      images: {
        // @ts-ignore -- not sure how to tell typescript that this is definitely a product
        ...item.images,
        // @ts-ignore -- not sure how to tell typescript that this is definitely a product
        edges: item.images.edges.map(({ cursor, node }) => {
          return {
            cursor,
            node,
            _key: cursor
          }
        })
      }
    }
  }
  if (item.__typename === 'Collection') {
    // @ts-ignore eslint-disable-next line
    const { products, ...collection } = item
    return {
      // @ts-ignore omfg
      ...collection,
      // @ts-ignore -- not sure how to tell typescript that this is definitely a Collection
      image: item.image || {}
    }
  }
  throw new Error('prepareImages can only be used for Products and Collections')
}
