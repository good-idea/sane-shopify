import * as React from 'react'
import { unwindEdges } from '@good-idea/unwind-edges'
import { SanityDocumentConfig } from '../types'
import { MissingImage } from '../icons/MissingImage'

export const createProductDocument = ({
  fields,
  ...rest
}: SanityDocumentConfig = {}) => {
  if (rest && rest.name && rest.name !== 'shopifyProduct')
    throw new Error('The document name for a product must be "shopifyProduct"')
  if (rest && rest.type && rest.type !== 'document')
    throw new Error('The type for a Shopify Product must be "document"')
  const additionalFields = fields || []
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
        hidden: true
      },
      {
        title: 'Page URI',
        name: 'handle',
        type: 'string',
        readOnly: true,
        hidden: true
      },
      {
        title: 'Shopify ID',
        name: 'shopifyId',
        type: 'string',
        hidden: true
      },
      {
        title: 'Shopify Data',
        name: 'sourceData',
        readOnly: true,
        type: 'shopifyProductSource'
      },
      {
        title: 'Collections',
        name: 'collections',
        type: 'linkedCollections'
      },
      ...additionalFields
    ],
    preview: {
      select: {
        shopifyItem: 'shopifyItem',
        title: 'title',
        sourceData: 'sourceData'
      },
      prepare: (props) => {
        const { shopifyItem, title, sourceData } = props
        const itemTitle = shopifyItem ? title || shopifyItem.title : title
        const [images] = unwindEdges(sourceData.images)
        // @ts-ignore
        const src = images[0]?.w100
        return {
          title: itemTitle,
          media: (
            <div style={imageWrapperStyles}>
              {src ? (
                <img style={imageStyles} src={src} alt={`Image for ${title}`} />
              ) : (
                <MissingImage />
              )}
            </div>
          )
        }
      }
    },
    ...rest
  }
}

const imageStyles = {
  width: '100%',
  height: '100%',
  objectFit: 'cover' as 'cover'
}

const imageWrapperStyles = {
  height: 'calc(100% - 4px)',
  background: '#d0cfcf',
  overflow: 'hidden',
  borderRadius: '3px',
  padding: '2px'
}
