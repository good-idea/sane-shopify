import * as React from 'react'

const ImagesPreview = (props) => {
  return (
    <>
      {props.value.edges.map((edge) => (
        <img key={edge.cursor} src={edge.node.transformedSrc} alt={edge.node.altText} />
      ))}
    </>
  )
}

const ImagePreview = (props) => {
  return <img src={props.w100} alt={props.altText} />
}

export const imageEdge = {
  title: 'Image Edge',
  name: 'shopifyImageEdge',
  type: 'object',
  fields: [
    { type: 'string', name: 'key', title: 'Key' },
    { type: 'string', name: 'cursor', title: 'Key' },
    { type: 'shopifySourceImage', name: 'node', title: 'Node' }
  ]
}

export const shopifyImages = {
  title: 'Images',
  name: 'shopifySourceImages',
  type: 'object',
  inputComponent: ImagesPreview,
  fields: [
    {
      title: 'edges',
      name: 'edges',
      type: 'array',
      of: [
        {
          type: 'shopifyImageEdge'
        }
      ]
    }
  ]
}

export const shopifyImage = {
  title: 'Image',
  name: 'shopifySourceImage',
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
