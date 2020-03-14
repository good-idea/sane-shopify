import * as React from 'react'
import { SanityDocumentConfig } from '@sane-shopify/types'
import { MissingImage } from '../icons/MissingImage'
import { getFieldConfig } from '../utils'

const imageStyles = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
}

const imageWrapperStyles = {
  height: 'calc(100% - 4px)',
  background: '#d0cfcf',
  overflow: 'hidden',
  borderRadius: '3px',
  padding: '2px'
}

export const createCollectionDocument = ({
  fields,
  ...rest
}: SanityDocumentConfig = {}) => {
  if (rest && rest.name && rest.name !== 'shopifyCollection')
    throw new Error(
      'The document name for a collection must be "shopifyCollection"'
    )
  if (rest && rest.type && rest.type !== 'document')
    throw new Error('The type for a Shopify collection must be "document"')
  const { namedFields, additionalFields } = getFieldConfig(fields, [
    'title',
    'handle',
    'shopifyId',
    'products',
    'sourceData'
  ])
  return {
    title: 'Collection',
    name: 'shopifyCollection',
    type: 'document',
    fields: [
      {
        title: 'Title',
        name: 'title',
        readOnly: true,
        type: 'string',
        hidden: true,
        ...namedFields.title
      },
      {
        title: 'Page URI',
        name: 'handle',
        type: 'string',
        readOnly: true,
        hidden: true,
        ...namedFields.handle
      },
      {
        title: 'Shopify ID',
        name: 'shopifyId',
        type: 'string',
        hidden: true,
        ...namedFields.shopifyId
      },
      {
        title: 'Shopify Data',
        name: 'sourceData',
        readOnly: true,
        type: 'shopifySourceCollection'
      },
      {
        title: 'Products',
        name: 'products',
        type: 'array',
        description: 'Synced from Shopify',
        readOnly: true,
        of: [
          {
            type: 'reference',
            to: [
              {
                type: 'shopifyProduct'
              }
            ]
          }
        ],
        ...namedFields.products
      },
      ...additionalFields
    ],
    preview: {
      select: {
        title: 'title',
        sourceData: 'sourceData'
      },
      prepare: (props) => {
        const { title, sourceData } = props
        const itemTitle = sourceData ? title || sourceData.title : title
        const alt = `Image for ${itemTitle}`
        const src = sourceData?.image?.w100
        const media =
          sourceData && sourceData.image ? (
            <>
              {src ? (
                <div style={imageWrapperStyles}>
                  <img
                    // @ts-ignore
                    style={imageStyles}
                    src={sourceData.image.w100}
                    alt={alt}
                  />
                </div>
              ) : (
                <MissingImage />
              )}
            </>
          ) : (
            undefined
          )
        return {
          media,
          title: itemTitle
        }
      }
    },
    ...rest
  }
}
