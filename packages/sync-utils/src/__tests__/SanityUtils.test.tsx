import { SanityUtils } from '../sanity'
import { MockSanityClient } from './utils/mockSanityClient'
import { syncStateMachine } from '../syncState'
import { KEYS_ID, KEYS_TYPE } from '../constants'
import { SanityCache } from '../sanity/SanityCache'
import fullFixture from './fixtures/sanity/full.json'

const createMockClient = () => {
  const machine = syncStateMachine({ onStateChange: () => undefined })
  const mockSanityClient = new MockSanityClient()
  const cache = new SanityCache()
  // @ts-ignore TODO get the client class interface to typecheck
  const client = new SanityUtils(mockSanityClient, machine, cache)
  return { mockSanityClient, client }
}

describe('Sanity Utils', () => {
  it('should save sanity secrets', async () => {
    const someSecrets = {
      shopName: 'some-storefront',
      accessToken: 'abc123',
    }
    const { client, mockSanityClient } = createMockClient()

    await client.saveSecrets(someSecrets)

    expect(mockSanityClient.createIfNotExists).toHaveBeenCalledTimes(1)
    expect(mockSanityClient.createIfNotExists).toHaveBeenCalledWith({
      _id: KEYS_ID,
      _type: KEYS_TYPE,
      ...someSecrets,
    })
    expect(mockSanityClient.patch).toHaveBeenCalledTimes(1)
    expect(mockSanityClient.patch).toHaveBeenCalledWith(KEYS_ID)
    expect(mockSanityClient.set).toHaveBeenCalledTimes(1)
    expect(mockSanityClient.set).toHaveBeenCalledWith(someSecrets)
    expect(mockSanityClient.commit).toHaveBeenCalledTimes(1)
  })

  it('should clear sanity secrets', async () => {
    const { client, mockSanityClient } = createMockClient()
    const emptySecrets = {
      shopName: '',
      accessToken: '',
    }

    await client.clearSecrets()

    expect(mockSanityClient.patch).toHaveBeenCalledTimes(1)
    expect(mockSanityClient.patch).toHaveBeenCalledWith(KEYS_ID)
    expect(mockSanityClient.set).toHaveBeenCalledTimes(1)
    expect(mockSanityClient.set).toHaveBeenCalledWith(emptySecrets)
    expect(mockSanityClient.commit).toHaveBeenCalledTimes(1)
  })

  it('should populate the cache when fetching all items', async () => {
    const { client, mockSanityClient } = createMockClient()
    mockSanityClient.fetch = jest.fn().mockResolvedValue(fullFixture)
    await client.fetchAllSanityDocuments()
    expect(mockSanityClient.fetch).toHaveBeenCalledTimes(1)
    const firstDoc = fullFixture[0]
    expect(client.cache.getById(firstDoc._id)).toBe(firstDoc)
  })
})
