import * as React from 'react'
import { unwindEdges } from '@good-idea/unwind-edges'
import { SanityDocumentConfig } from '../types'

export const shopifyCollectionSource = {
  title: 'Shopify Data',
  readOnly: true,
  name: 'shopifyCollectionSource',
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
      type: 'shopifySourceImage'
    }
  ]
}
