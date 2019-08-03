import { Collection, Product } from '@sane-shopify/types'

export const prepareImages = (item: Product | Collection) => {
  if (item.__typename === 'Product') {
    // Add keys to product images
    return {
      ...item,
      images: {
        ...item.images,
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
    // Use an empty object by default (sanity will complain if the image is `null`)
    return {
      ...item,
      image: item.image || {}
    }
  }
  throw new Error('prepareImages can only be used for Products and Collections')
}
