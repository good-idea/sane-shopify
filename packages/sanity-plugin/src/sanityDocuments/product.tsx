import * as React from 'react'
import { unwindEdges } from '@good-idea/unwind-edges'
import { SanityDocumentConfig } from '@sane-shopify/types'
import { MissingImage } from '../icons/MissingImage'
import { getFieldConfig } from '../utils'
import { ArchivedInput } from '../components/ArchivedInput'

export const createProductOptionValue = ({
  fields,
  ...rest
}: SanityDocumentConfig = {}) => {
  if (rest && rest.name && rest.name !== 'productOption')
    throw new Error(
      'The object name for a product option must be "shopifyProductOptionValue"'
    )
  if (rest && rest.type && rest.type !== 'object')
    throw new Error('The type for a Product Variant must be "object"')

  const additionalFields = fields || []
  return {
    title: 'Option Value',
    name: 'shopifyProductOptionValue',
    type: 'object',
    fields: [
      {
        name: 'value',
        title: 'Value',
        type: 'string',
        readOnly: true,
      },
      ...additionalFields,
    ],
    preview: {
      select: {
        title: 'value',
      },
    },
    ...rest,
  }
}

export const createProductOption = ({
  fields,
  ...rest
}: SanityDocumentConfig = {}) => {
  if (rest && rest.name && rest.name !== 'shopifyProductOption')
    throw new Error(
      'The object name for a product must be "shopifyProductOption"'
    )
  if (rest && rest.type && rest.type !== 'object')
    throw new Error('The type for a Product Variant must be "object"')

  const additionalFields = fields || []
  return {
    title: 'Product Option',
    name: 'shopifyProductOption',
    type: 'object',
    fields: [
      {
        name: 'shopifyOptionId',
        title: 'Option ID',
        readOnly: true,
        type: 'string',
        hidden: true,
      },
      {
        name: 'name',
        title: 'Name',
        readOnly: true,
        type: 'string',
      },
      {
        name: 'values',
        title: 'Values',
        type: 'array',
        of: [{ type: 'shopifyProductOptionValue' }],
      },
      ...additionalFields,
    ],
    preview: {
      select: {
        title: 'name',
      },
    },
    ...rest,
  }
}

export const createProductVariant = ({
  fields,
  ...rest
}: SanityDocumentConfig = {}) => {
  if (rest && rest.name && rest.name !== 'shopifyProductVariant')
    throw new Error(
      'The object name for a product must be "shopifyProductVariant"'
    )
  if (rest && rest.type && rest.type !== 'object')
    throw new Error('The type for a Product Variant must be "object"')
  const additionalFields = fields || []
  return {
    title: 'Product Variant',
    name: 'shopifyProductVariant',
    type: 'object',
    fields: [
      {
        name: 'shopifyVariantID',
        title: 'Variant ID',
        type: 'string',
        readOnly: true,
        hidden: true,
      },
      {
        name: 'title',
        title: 'Variant Title',
        type: 'string',
        readOnly: true,
      },
      ...additionalFields,
      {
        title: 'Shopify Data',
        name: 'sourceData',
        readOnly: true,
        hidden: true,
        type: 'shopifySourceProductVariant',
      },
    ],
    preview: {
      select: {
        title: 'title',
      },
    },
    ...rest,
  }
}

const imageStyles = {
  width: '100%',
  height: '100%',
  objectFit: 'cover' as 'cover',
}

const imageWrapperStyles = {
  height: 'calc(100% - 4px)',
  background: '#d0cfcf',
  overflow: 'hidden',
  borderRadius: '3px',
  padding: '2px',
}

export const createProductDocument = ({
  fields,
  ...rest
}: SanityDocumentConfig = {}) => {
  if (rest && rest.name && rest.name !== 'shopifyProduct')
    throw new Error('The document name for a product must be "shopifyProduct"')
  if (rest && rest.type && rest.type !== 'document')
    throw new Error('The type for a Shopify Product must be "document"')
  const { namedFields, additionalFields } = getFieldConfig(fields, [
    'title',
    'handle',
    'shopifyId',
    'sourceData',
    'collections',
    'options',
    'variants',
  ])
  return {
    title: 'Product',
    name: 'shopifyProduct',
    type: 'document',
    fields: [
      {
        title: 'Title',
        name: 'title',
        readOnly: true,
        type: 'string',
        ...namedFields.title,
      },
      {
        title: 'Page URI',
        name: 'handle',
        type: 'string',
        readOnly: true,
        hidden: true,
        ...namedFields.handle,
      },
      {
        title: 'Shopify ID',
        name: 'shopifyId',
        type: 'string',
        hidden: true,
        ...namedFields.shopifyId,
      },
      {
        title: 'Archived',
        name: 'archived',
        type: 'boolean',
        inputComponent: ArchivedInput,
      },
      {
        title: 'Shopify Data',
        name: 'sourceData',
        type: 'shopifySourceProduct',
        readOnly: true,
        ...namedFields.sourceData,
      },
      {
        title: 'Collections',
        name: 'collections',
        type: 'linkedCollections',
        readOnly: true,
        ...namedFields.collections,
      },
      {
        title: 'Options',
        name: 'options',
        type: 'array',
        of: [{ type: 'shopifyProductOption' }],
        ...namedFields.options,
      },
      {
        title: 'Variants',
        name: 'variants',
        type: 'array',
        of: [{ type: 'shopifyProductVariant' }],
        ...namedFields.variants,
      },
      ...additionalFields,
    ],
    preview: {
      select: {
        title: 'title',
        sourceData: 'sourceData',
        archived: 'archived',
      },
      prepare: (props) => {
        const { title, sourceData, archived } = props
        const [images] = unwindEdges(sourceData.images)
        // @ts-ignore
        const src = images[0]?.w100
        const alt = `Image for ${title}`
        const subtitle = archived ? '📁 Archived' : undefined
        return {
          title,
          subtitle,
          media: (
            <div style={imageWrapperStyles}>
              {src ? (
                <img style={imageStyles} src={src} alt={alt} />
              ) : (
                <MissingImage />
              )}
            </div>
          ),
        }
      },
    },
    ...rest,
  }
}
