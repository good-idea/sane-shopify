import { unwindEdges, Edge } from '@good-idea/unwind-edges'
import deepMerge from 'deepmerge'
import { isMatch as lodashIsMatch, pick } from 'lodash'
import {
  Collection,
  Product,
  ShopifyImage,
  SanityArray,
  SanityShopifyDocument,
  SanityShopifyDocumentPartial,
  SanityShopifyProductOption,
  SanityShopifyProductOptionValue,
  SanityShopifyProductVariant,
  SanityShopifyProductDocumentPartial,
  SanityShopifyCollectionDocumentPartial,
} from '@sane-shopify/types'
import { slugify, definitely } from '../utils'
import {
  isSanityProduct,
  isSanityCollection,
  isShopifyProduct,
  isShopifyCollection,
} from '../typeGuards'

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

const parsePrice = (amount?: string): number | undefined =>
  amount ? parseFloat(amount) : undefined

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
const isMatch = (a: any, b: any, { keys }: IsMatchConfig): boolean => {
  return lodashIsMatch(pick(b, keys), pick(a, keys))
}

export const documentsMatch = (
  doc1: SanityShopifyDocumentPartial,
  doc2: SanityShopifyDocument
): boolean =>
  isMatch(doc1, doc2, {
    keys: [
      '_type',
      'title',
      'handle',
      'shopifyId',
      'minVariantPrice',
      'maxVariantPrice',
      'sourceData',
      'options',
      'variants',
    ],
  })

export const uniqueObjects = <T extends object>(arr: T[]): T[] =>
  arr.reduce<T[]>(
    (acc, item) =>
      acc.some((i) => lodashIsMatch(i, item)) ? acc : [...acc, item],
    []
  )

export const mergeExistingFields = (
  docInfo: SanityShopifyDocumentPartial,
  existingDoc: SanityShopifyDocumentPartial
): SanityShopifyDocumentPartial => {
  if (isSanityCollection(docInfo) && isSanityCollection(existingDoc)) {
    const merged = deepMerge(existingDoc, docInfo)
    const doc: SanityShopifyCollectionDocumentPartial = {
      ...merged,
      sourceData: {
        ...docInfo.sourceData,
        products: {
          ...docInfo.sourceData.products,
          edges: uniqueObjects(definitely(docInfo.sourceData.products.edges)),
        },
      },
    }
    return doc
  }
  if (isSanityProduct(docInfo) && isSanityProduct(existingDoc)) {
    const merged = deepMerge(existingDoc, docInfo)
    const variants = docInfo.variants || []
    const options = docInfo.options || []
    const doc: SanityShopifyProductDocumentPartial = {
      ...merged,
      sourceData: {
        ...docInfo.sourceData,
        collections: {
          ...docInfo.sourceData.collections,
          edges: uniqueObjects(
            definitely(docInfo?.sourceData?.collections?.edges)
          ),
        },
        images: {
          ...docInfo.sourceData.images,
          edges: uniqueObjects(definitely(docInfo.sourceData.images.edges)),
        },
      },

      options: options.map((updatedOption) => {
        const existingOption = existingDoc.options
          ? existingDoc?.options.find((o) => o._key === updatedOption._key)
          : undefined

        const existingOptionValues = existingOption ? existingOption.values : []
        const updatedOptionValues = updatedOption ? updatedOption.values : []

        const values = [...existingOptionValues, ...updatedOptionValues].reduce<
          SanityShopifyProductOptionValue[]
        >((acc, value) => {
          const existsIndex = acc.findIndex((v) => v._key === value._key)

          if (existsIndex > -1) {
            const mergedValue = {
              ...acc[existsIndex],
              ...value,
            }
            return [
              ...acc.slice(0, existsIndex),
              mergedValue,
              ...acc.slice(existsIndex + 1),
            ]
          } else {
            return [...acc, value]
          }
        }, [])

        return {
          ...existingOption,
          ...updatedOption,
          values,
        }
      }),

      variants: variants.map((variant) => {
        const existingVariant = existingDoc.variants
          ? existingDoc.variants.find(
              (v) => v.shopifyVariantID === variant.shopifyVariantID
            ) || {}
          : {}

        return {
          ...existingVariant,
          ...variant,
        }
      }),
    }
    return doc
  }
  throw new Error(
    `The document with the shopifyId "${existingDoc.shopifyId}" could not be merged. Be sure that the document includes a _type property`
  )
}
