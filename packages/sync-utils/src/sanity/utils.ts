import { unwindEdges, Edge } from '@good-idea/unwind-edges'
import {
  Collection,
  Product,
  ShopifyImage,
  SanityArray,
  SanityShopifyDocumentPartial,
  SanityShopifyProductOption,
  SanityShopifyProductVariant,
  SanityShopifyProductDocumentPartial,
  SanityShopifyCollectionDocumentPartial,
} from '@sane-shopify/types'
import { isMatch as lodashIsMatch, pick } from 'lodash'
import { slugify, definitely } from '../utils'
import { isShopifyProduct, isShopifyCollection } from '../typeGuards'

export const sleep = (ms: number): Promise<void> =>
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
    _key: cursor,
  }))

const missingImage: ShopifyImage = {
  __typename: 'Image',
  altText: '',
  id: '',
  originalSrc: '',
  w100: '',
  w300: '',
  w800: '',
  w1200: '',
  w1600: '',
}

// Pretty much just adds keys to arrays
const prepareSourceData = <T extends Product | Collection>(item: T): T => {
  if (isShopifyProduct(item)) {
    // Add keys to product images
    return {
      ...item,
      _type: 'shopifySourceProduct',
      options: item.options.map(({ id, ...option }) => ({
        ...option,
        _key: id,
      })),
      collections: {
        ...item.collections,
        edges: addKeyByCursor(
          definitely(item?.collections?.edges),
          'shopifySourceCollectionEdge'
        ),
      },
      variants: {
        ...item.variants,
        edges: addKeyByCursor(
          definitely(item?.variants.edges),
          'shopifySourceProductVariantEdges'
        ),
      },
      images: {
        ...item.images,
        edges: addKeyByCursor(
          definitely(item.images.edges),
          'shopifySourceImageEdge'
        ),
      },
    }
  }
  if (isShopifyCollection(item)) {
    return {
      ...item,
      _type: 'shopifySourceCollection',
      image: item.image || {},
      products: {
        ...item.products,
        edges: addKeyByCursor(
          definitely(item.products.edges),
          'shopifySourceProductEdge'
        ),
      },
    }
  }
  throw new Error('prepareImages can only be used for Products and Collections')
}

const createProductOptions = (
  item: Product
): SanityArray<SanityShopifyProductOption> => {
  const { options } = item
  return options.map((option) => ({
    _type: 'shopifyProductOption',
    _key: option.id,
    shopifyOptionId: option.id,
    name: option.name,
    values: option.values.map((value) => ({
      _type: 'shopifyProductOptionValue',
      _key: slugify(value),
      value: value,
    })),
  }))
}

const defaultMissingPrice = {
  amount: '0',
  currencyCode: 'NONE',
}

const createProductVariantObjects = (
  item: Product
): SanityArray<SanityShopifyProductVariant> => {
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
        compareAtPriceV2: v.compareAtPriceV2 ?? defaultMissingPrice,
        image: v.image ? v.image : missingImage,
        selectedOptions: v.selectedOptions
          ? v.selectedOptions.map(({ name, value }) => ({
              _key: `${name}_${value}`.replace(/\s/, '_'),
              _type: 'shopifySourceSelectedOption',
              name,
              value,
            }))
          : [],
      },
    })) || []
  )
}

const parsePrice = (amount?: string): number =>
  amount ? parseInt(amount, 10) : 0

export const prepareDocument = <T extends Product | Collection>(
  item: T
): SanityShopifyDocumentPartial => {
  const _type = getItemType(item)
  if (isShopifyProduct(item)) {
    const sourceData = prepareSourceData<Product>(item)

    const minVariantPrice = parsePrice(item.priceRange?.minVariantPrice?.amount)
    const maxVariantPrice = parsePrice(
      item?.priceRange?.maxVariantPrice?.amount
    )

    const options = createProductOptions(item)
    const variants = createProductVariantObjects(item)

    const productDocInfo: SanityShopifyProductDocumentPartial = {
      _type,
      archived: false,
      minVariantPrice,
      maxVariantPrice,
      title: item.title,
      shopifyId: item.id,
      handle: item.handle,
      sourceData: {
        ...sourceData,
      },
      options,
      variants,
    }
    return productDocInfo
  }
  if (isShopifyCollection(item)) {
    const sourceData = prepareSourceData<Collection>(item)
    const docInfo: SanityShopifyCollectionDocumentPartial = {
      _type,
      archived: false,
      title: item.title,
      shopifyId: item.id,
      handle: item.handle,
      sourceData,
    }
    return docInfo
  }
  throw new Error(`Could not prepare document with type "${item.__typename}"`)
}

interface IsMatchConfig {
  keys: string[]
}

/**
 * Compares if a prepared document and original document are a match.
 * We ignore keys like _createdAt and _updatedAt because those aren't included
 * in the prepared document.
 *
 */
export const isMatch = (a: any, b: any, { keys }: IsMatchConfig): boolean => {
  return lodashIsMatch(pick(b, keys), pick(a, keys))
}

export const uniqueObjects = <T extends object>(arr: T[]): T[] =>
  arr.reduce<T[]>(
    (acc, item) =>
      acc.some((i) => lodashIsMatch(i, item)) ? acc : [...acc, item],
    []
  )
