import * as React from 'react'
import { unwindEdges } from '@good-idea/unwind-edges'
import { SanityDocumentConfig } from '../types'

const ImagePreview = (props) => {
  return <img src={props.w100} alt={props.altText} />
}

export const createCollectionDocument = ({ fields, ...rest }: SanityDocumentConfig = {}) => {
  if (rest && rest.name && rest.name !== 'shopifyCollection')
    throw new Error('The document name for a collection must be "shopifyCollection"')
  if (rest && rest.type && rest.type !== 'document')
    throw new Error('The type for a Shopify collection must be "document"')
  const additionalFields = fields || []
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
        type: 'object',
        fields: [
          { title: 'Title', name: 'title', type: 'string' },
          {
            title: 'Handle',
            name: 'handle',
            type: 'string'
          },
          {
            title: 'Description',
            name: 'description',
            type: 'text',
            rows: 3
          },
          {
            title: 'ID',
            name: 'id',
            type: 'string',
            hidden: true
          },
          {
            title: 'Image',
            name: 'image',
            type: 'object',
            inputComponent: ImagePreview,
            fields: [
              {
                title: 'altText',
                name: 'altText',
                type: 'string'
              },
              {
                title: 'id',
                name: 'id',
                type: 'string'
              },
              {
                title: 'originalSrc',
                name: 'originalSrc',
                type: 'string'
              },
              {
                title: 'w100',
                name: 'w100',
                type: 'string'
              },
              {
                title: 'w300',
                name: 'w300',
                type: 'string'
              },
              {
                title: 'w800',
                name: 'w800',
                type: 'string'
              }
            ]
          }
        ]
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
        const media =
          sourceData && sourceData.image ? (
            <div style={imageWrapperStyles}>
              <img style={imageStyles} src={sourceData.image.w100} alt={`Image for ${itemTitle}`} />
            </div>
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

const imageStyles = {
  width: '100%',
  height: '100%',
  'object-fit': 'cover'
}

const imageWrapperStyles = {
  height: 'calc(100% - 4px)',
  background: '#d0cfcf',
  overflow: 'hidden',
  borderRadius: '3px',
  padding: '2px'
}
