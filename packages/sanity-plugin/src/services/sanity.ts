// @ts-ignore
import createSanityClient from 'part:@sanity/base/client'

export const defaultSanityClient = createSanityClient.withConfig({
  apiVersion: '2021-04-01',
})
