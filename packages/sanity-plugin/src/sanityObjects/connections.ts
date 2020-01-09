export const pageInfo = {
  name: 'pageInfo',
  type: 'object',
  fields: [
    {
      name: 'hasNextPage',
      type: 'boolean'
    },
    {
      name: 'hasPreviousPage',
      type: 'boolean'
    }
  ]
}

export const shopifyNode = {
  name: 'shopifyNode',
  type: 'object',
  fields: [
    {
      name: 'handle',
      type: 'string'
    },
    {
      name: 'id',
      type: 'string'
    }
  ]
}

export const shopifyEdge = {
  name: 'edge',
  type: 'object',
  fields: [
    {
      name: 'cursor',
      type: 'string'
    },
    { name: 'node', type: 'shopifyNode' }
  ]
}

export const shopifyEdges = {
  name: 'shopifyEdges',
  type: 'array',
  of: [{ type: 'edge', name: 'edge' }]
}
