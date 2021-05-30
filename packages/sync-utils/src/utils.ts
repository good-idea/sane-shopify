import { SanityClient } from '@sanity/client'
import { Paginated, unwindEdges } from '@good-idea/unwind-edges'
import {
  SanityShopifyProductDocument,
  Collection,
  Product,
} from '@sane-shopify/types'
import { isShopifyProduct, isShopifyCollection } from './typeGuards'

type Maybe<T> = T | null | undefined | void

export function definitely<T>(items?: Maybe<T>[] | null): T[] {
  if (!items) return []
  return items.filter((i): i is T => Boolean(i))
}

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

const last = <T>(arr: T[]): T => arr[arr.length - 1]

export const getLastCursor = <NodeType>(connection: Paginated<NodeType>) => {
  if (!connection.edges || connection.edges.length === 0) return null
  const lastEdge = last(connection?.edges)
  if (!lastEdge) return null
  return lastEdge.cursor
}

export const mergePaginatedResults = <NodeType>(
  p1: Paginated<NodeType>,
  p2: Paginated<NodeType>
): Paginated<NodeType> => {
  if (!p1.pageInfo || !p2.pageInfo) throw new Error('Page info was not suplied')

  return {
    pageInfo: {
      hasPrevPage: p1.pageInfo.hasPreviousPage,
      hasPreviousPage: p1.pageInfo.hasPreviousPage,
      hasNextPage: p2.pageInfo.hasNextPage,
    },
    edges: [...definitely(p1.edges), ...definitely(p2.edges)],
  }
}

interface ProductRef {
  _type: string
  _ref: string
  _key: string
}

export const buildProductReferences = async (
  sanityClient: SanityClient,
  products: Paginated<Product>
): Promise<ProductRef[]> => {
  const [productNodes] = unwindEdges(products)
  const productIds = productNodes.map((node) => node.id)
  const query = `*[_type == "shopifyProduct" && shopifyId in $productIds && !(_id in path('drafts.**'))]`
  const productDocuments = await sanityClient.fetch<
    SanityShopifyProductDocument[]
  >(query, { productIds })
  const productRefs = productDocuments.map((doc) => ({
    _type: 'reference',
    _ref: doc._id,
    _key: `${doc._rev}-${doc._id}`,
  }))
  return productRefs
}

export const prepareSourceData = <T extends Product | Collection>(item: T) => {
  if (isShopifyProduct(item)) {
    // Add keys to product images
    return {
      ...item,
      options: item.options.map(({ id, ...option }) => ({
        ...option,
        _key: id,
      })),
      media: {
        ...item.media,
        edges: definitely(item.media.edges).map(({ cursor, node }) => {
          return {
            cursor,
            node,
            _key: cursor,
          }
        }),
      },
      images: {
        ...item.images,
        edges: definitely(item.images.edges).map(({ cursor, node }) => {
          return {
            cursor,
            node,
            _key: cursor,
          }
        }),
      },
    }
  }
  if (isShopifyCollection(item)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { products, ...collection } = item
    return {
      ...collection,
      image: item.image || {},
    }
  }
  throw new Error('prepareImages can only be used for Products and Collections')
}
