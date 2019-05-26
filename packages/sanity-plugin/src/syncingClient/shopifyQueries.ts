import { Paginated, Product, Collection } from '../types'

export const PRODUCT_QUERY = /* GraphQL */ `
	query ProductQuery($handle: String!) {
		productByHandle(handle: $handle) {
			id
			handle
			title
			description
		}
	}
`

export interface ProductQueryResult {
	data: {
		productByHandle: Product
	}
}

export const productsQuery = /* GraphQL */ `
	query ProductsQuery($first: Int!, $after: String) {
		products(first: $first, after: $after) {
			pageInfo {
				hasNextPage
				hasPreviousPage
			}
			edges {
				cursor
				node {
					id
					handle
					title
					description
					__typename
					images(first: 1) {
						edges {
							node {
								id
								altText
								originalSrc
								transformedSrc(maxWidth: 100)
							}
						}
					}
				}
			}
		}
	}
`

export interface ProductsQueryResult {
	data: {
		products: Paginated<Product>
	}
}

export const collectionsQuery = /* GraphQL */ `
	query CollectionsQuery($first: Int!, $after: String) {
		collections(first: $first, after: $after) {
			pageInfo {
				hasNextPage
				hasPreviousPage
			}
			edges {
				cursor
				node {
					id
					handle
					title
					description
					__typename
					image {
						id
						altText
						originalSrc
						transformedSrc(maxWidth: 100)
					}
				}
			}
		}
	}
`

export interface CollectionsQueryResult {
	data: {
		collections: Paginated<Collection>
	}
}
