import {
  makeRemoteExecutableSchema,
  introspectSchema,
  mergeSchemas,
  transformSchema,
  RenameTypes
} from 'graphql-tools'
import { GraphQLSchema } from 'graphql'
import { ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { SaneShopifyConfig } from '@sane-shopify/types'

import fetch from 'node-fetch'

// type Fetch = GlobalFetch['fetch']

const createRemoteExecutableSchema = async (link: ApolloLink) => {
  const remoteSchema = await introspectSchema(link)
  const remoteExecutableSchema = makeRemoteExecutableSchema({
    link,
    schema: remoteSchema
  })
  return remoteExecutableSchema
}

const createShopifySchema = async ({ shopify }: SaneShopifyConfig) => {
  const shopifyLink = new HttpLink({
    fetch,
    uri: `https://${shopify.shopName}.myshopify.com/api/graphql`,
    headers: {
      'X-Shopify-Storefront-Access-Token': shopify.accessToken
    }
    /* This was necessary before... leaving it in in case the problem crops up again */
    // Node-fetch type signatures do not match what apollo wants
    // fetch: (fetch as unknown) as Fetch
  })

  return createRemoteExecutableSchema(shopifyLink)
}

const createSanitySchema = async ({ sanity }: SaneShopifyConfig) => {
  const sanityLink = new HttpLink({
    fetch,
    uri: `https://${sanity.projectId}.api.sanity.io/v1/graphql/${
      sanity.dataset
    }/default
  `
    /* This was necessary before... leaving it in in case the problem crops up again */
    // Node-fetch type signatures do not match what apollo wants
    // fetch: (fetch as unknown) as Fetch
  })
  const schema = await createRemoteExecutableSchema(sanityLink)
  const transformedSchema = transformSchema(schema, [
    new RenameTypes((name) => {
      switch (name) {
        case 'Image':
          return 'SanityImage'
        default:
          return name
      }
    })
  ])
  return transformedSchema
}

interface Stuff {
  schema: GraphQLSchema
}

let merged: GraphQLSchema | void

export const createSchema = async (config: SaneShopifyConfig) => {
  if (merged) return merged
  const [shopify, sanity] = await Promise.all([
    createShopifySchema(config),
    createSanitySchema(config)
  ])

  const schema = mergeSchemas({
    schemas: [shopify, sanity]
  })

  // @ts-ignore
  merged = schema

  return schema
}
