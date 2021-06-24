import Debug from 'debug'

export const log = Debug('sane-shopify:server')

export const sleep = async (ms = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms))

const btoa = (a: string) => Buffer.from(a).toString('base64')

type NodeType = 'Product' | 'Collection' | 'Order'

export const getStorefrontId = (
  restId: string | number,
  type: NodeType
): string => btoa(['gid://shopify', type, restId.toString()].join('/'))
