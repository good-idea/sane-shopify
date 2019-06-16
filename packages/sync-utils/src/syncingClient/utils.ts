import { Collection, Product } from '@sane-shopify/types'

export const addImageKeys = (item: Product | Collection) =>
  item.__typename === 'Product'
    ? {
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
    : item
