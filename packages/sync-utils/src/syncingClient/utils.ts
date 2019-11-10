import { Paginated, unwindEdges } from '@good-idea/unwind-edges'
import { Collection, Product, SanityClient } from '@sane-shopify/types'

interface ProductRef {
  _type: 'Product'
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
