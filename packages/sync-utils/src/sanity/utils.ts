import { unwindEdges, Edge } from '@good-idea/unwind-edges'
import { Collection, Product } from '@sane-shopify/types'
import { slugify } from '../utils'

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

const addKeyByCursor = <T extends Edge<any>>(edges: T[], _type: string) =>
  edges.map(({ cursor, node }) => ({
    cursor,
    node,
    _type,
    _key: cursor
  }))

const missingImage = {
  altText: '',
  id: '',
  originalSrc: '',
  w100: '',
  w300: '',
  w800: ''
}

// Pretty much just adds keys to arrays
const prepareSourceData = <T extends Product | Collection>(item: T) => {
  if (item.__typename === 'Product') {
    // Add keys to product images
    return {
      ...item,
      _type: 'shopifySourceProduct',
      // @ts-ignore
      options: item.options.map(({ id, ...option }) => ({
        ...option,
        _key: id
      })),
      collections: {
        // @ts-ignore
        ...item.collections,
        edges: addKeyByCursor(
          // @ts-ignore
          item.collections.edges,
          'shopifySourceCollectionEdge'
        )
      },
      variants: {
        // @ts-ignore
        ...item.variants,
        edges: addKeyByCursor(
          // @ts-ignore
          item.variants.edges,
          'shopifySourceProductVariantEdges'
        )
        // .map((variant) => {
        //   const { node } = variant
        //   return {
        //     ...variant,
        //     node: {
        //       ...node,
        //       image: node.image ? node.image : missingImage
        //     }
        //   }
        // })
      },
      images: {
        // @ts-ignore -- not sure how to tell typescript that this is definitely a product
        ...item.images,
        // @ts-ignore -- not sure how to tell typescript that this is definitely a product
        edges: addKeyByCursor(item.images.edges, 'shopifySourceImageEdge')
      }
    }
  }
  if (item.__typename === 'Collection') {
    // @ts-ignore eslint-disable-next line
    return {
      // @ts-ignore omfg
      ...item,
      _type: 'shopifySourceCollection',
      // @ts-ignore -- not sure how to tell typescript that this is definitely a Collection
      image: item.image || {},
      products: {
        // @ts-ignore
        ...item.products,
        // @ts-ignore
        edges: addKeyByCursor(item.products.edges, 'shopifySourceProductEdge')
      }
    }
  }
  throw new Error('prepareImages can only be used for Products and Collections')
}

const createProductOptions = (item: Product) => {
  const { options } = item
  return options.map((option) => ({
    _type: 'shopifyProductOption',
    _key: option.id,
    shopifyOptionId: option.id,
    name: option.name,
    values: option.values.map((value) => ({
      _type: 'shopifyProductOptionValue',
      _key: slugify(value),
      value: value
    }))
  }))
}

const createProductVariantObjects = (item: Product) => {
  const [variants] = unwindEdges(item.variants)
  return (
    variants.map((v) => ({
      _type: 'shopifyProductVariant',
      _key: v.id,
      id: v.id,
      shopifyVariantID: v.id,
      title: v.title,
      sourceData: {
        ...v,
        _type: 'shopifySourceProductVariant',
        image: v.image ? v.image : missingImage,
        selectedOptions: v.selectedOptions
          ? v.selectedOptions.map(({ name, value }) => ({
              _key: `${name}_${value}`.replace(/\s/, '_'),
              _type: 'shopifySourceSelectedOption',
              name,
              value
            }))
          : []
      }
    })) || []
  )
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
  switch (item.__typename) {
    case 'Product':
      return {
        ...docInfo,
        // @ts-ignore
        options: createProductOptions(item),
        // @ts-ignore
        variants: createProductVariantObjects(item)
      }
    default:
      return docInfo
  }
}
