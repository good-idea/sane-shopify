/**
 * GraphQL
 */

interface Edge<T> {
	cursor: string | number
	node: T
}

export interface PageInfo {
	hasNextPage: boolean
	hasPrevPage: boolean
}

export interface Paginated<T> {
	pageInfo: PageInfo
	edges: Edge<T>[]
}
