import * as React from 'react'

const ImagesPreview = (props) => {
  return (
    <>
      {props.value.edges.map((imageEdge) => (
        <img
          key={imageEdge.cursor}
          src={imageEdge.node.transformedSrc}
          alt={imageEdge.node.altText}
        />
      ))}
    </>
  )
}

const ImagePreview = (props) => {
  return <img src={props.w100} alt={props.altText} />
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
          name: 'node',
          type: 'shopifySourceImage'
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
