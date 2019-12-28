import { Collection, Product } from '@sane-shopify/types'

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

const getItemType = (item: Product | Collection) => {
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

const prepareSourceData = <T extends Product | Collection>(item: T) => {
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
    return {
      // @ts-ignore omfg
      ...item,
      // @ts-ignore -- not sure how to tell typescript that this is definitely a Collection
      image: item.image || {}
    }
  }
  throw new Error('prepareImages can only be used for Products and Collections')
}

export const prepareDocument = <T extends Product | Collection>(item: T) => {
  const _type = getItemType(item)
  const sourceData = prepareSourceData(item)
  const docInfo = {
    _type,
    title: item.title,
    shopifyId: item.id,
    handle: item.handle,
    sourceData
  }
  return docInfo
}
