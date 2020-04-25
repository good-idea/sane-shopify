import Debug from 'debug'

export const log = Debug('sane-shopify:server')

export const sleep = async (ms = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const btoa = (a: string) => Buffer.from(a).toString('base64')
