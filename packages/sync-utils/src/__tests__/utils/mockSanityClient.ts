import type { SanityClient } from '@sanity/client'

// @ts-ignore
export class MockSanityClient implements SanityClient {
  createIfNotExists = jest.fn()
  fetch = jest.fn()
  set = jest.fn().mockReturnValue(this)
  patch = jest.fn().mockReturnValue(this)
  commit = jest.fn()
}
