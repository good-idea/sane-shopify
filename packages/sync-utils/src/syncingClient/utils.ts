import { Collection, Product } from '@sane-shopify/types'

export const prepareImages = <T extends Product | Collection>(item: T): T => {
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
    // Use an empty object by default (sanity will complain if the image is `null`)
    return {
      ...item,
      // @ts-ignore -- not sure how to tell typescript that this is definitely a Collection
      image: item.image || {}
    }
  }
  throw new Error('prepareImages can only be used for Products and Collections')
}
