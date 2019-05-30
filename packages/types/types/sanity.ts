/**
 * Types that are shared between the plugin, the hooks server, and the syncing client.
 *
 * Types for the Sanity Desk Tool should go in the sanity-plugin directory.
 */

export interface SanityDocument {
  _id: string
  _type: string
  [key: string]: any
}

export interface SanityShopifyDocument extends SanityDocument {
  shopifyId: string
}

interface Patch<ExpectedResult = any> {
  set: (
    document: object
  ) => {
    commit: () => Promise<ExpectedResult>
  }
}

export interface SanityClient {
  fetch: <ExpectedResult = SanityDocument | SanityDocument[]>(
    query: string,
    params?: object
  ) => Promise<ExpectedResult>
  createIfNotExists: <ExpectedResult = SanityDocument>(
    doc: SanityDocument
  ) => Promise<ExpectedResult>
  create: <ExpectedResult = SanityDocument>(input: object) => Promise<ExpectedResult>
  patch: <ExpectedResult = SanityDocument>(id: string) => Patch<ExpectedResult>
}
