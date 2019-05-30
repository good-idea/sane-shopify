/**
 * GraphQL
 */

interface Edge<T> {
  cursor: string
  node: T
}

export interface PageInfo {
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface Paginated<T> {
  pageInfo: PageInfo
  edges: Array<Edge<T>>
}
