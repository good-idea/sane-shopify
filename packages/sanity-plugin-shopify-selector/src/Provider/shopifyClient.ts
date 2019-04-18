import { Secrets, Paginated } from '../types'
import { path, last, lensPath, set } from 'ramda'

interface ShopifyResult<Response> {
	data: Response
}

interface Variables {
	[key: string]: string | number | boolean | Variables
}

export interface ShopifyClient {
	query: <ResponseType>(
		query: string,
		variables?: Variables,
	) => Promise<ShopifyResult<ResponseType>>
	queryAll: <ResponseType>(
		query: string,
		pagePath: string[],
		variables?: Variables,
	) => Promise<ShopifyResult<ResponseType>>
}

export interface ShopifyItem {}

const combinePages = (r1, r2) => ({
	...r2,
	edges: [...r1.edges, ...r2.edges],
})

const getErrorMessage = (r: Response): string => {
	switch (r.status) {
		case 401:
		case 403:
			return 'Authentication failed. Please make sure you have entered the correct Storefront name and API Key.'
		default:
			return `There was an error connecting to Shopify (${r.status}: ${
				r.statusText
			})`
	}
}

export const createClient = (secrets: Secrets): ShopifyClient => {
	const { storefrontName, storefrontApiKey } = secrets
	const url = `https://${storefrontName}.myshopify.com/api/graphql`
	const headers = {
		'Content-Type': 'application/json',
		'X-Shopify-Storefront-Access-Token': storefrontApiKey,
	}

	const query = async <ResponseType>(
		queryString: string,
		variables?: Variables,
	): Promise<ShopifyResult<ResponseType>> =>
		fetch(url, {
			headers,
			method: 'POST',
			body: JSON.stringify({ query: queryString, variables }),
		}).then(async r => {
			if (!r.ok) throw new Error(getErrorMessage(r))
			const json = await r.json()
			return json
		})

	const queryAll = async <ResponseType>(
		queryString: string,
		pagePath: string[],
		variables: Variables = {},
		prevResult?: ResponseType,
	): Promise<ShopifyResult<ResponseType>> => {
		const paginatedVariables = {
			...variables,
			first: variables.first || 200,
		}
		const response = await query<ResponseType>(queryString, paginatedVariables)
		const page: Paginated<any> = path(pagePath, response)
		if (page.pageInfo.hasNextPage) {
			const nextVariables = {
				...variables,
				after: last(page.edges).cursor,
			}
			const nextResponse = await queryAll<ResponseType>(
				queryString,
				pagePath,
				nextVariables,
				page,
			)
			const nextPage: Paginated<any> = path(pagePath, nextResponse)
			const combined = combinePages(page, nextPage)
			const pageLens = lensPath(pagePath)
			const fullResponse: ShopifyResult<ResponseType> = set(
				pageLens,
				combined,
				nextResponse,
			)
			return fullResponse
		}

		return response
	}

	return {
		query,
		queryAll,
	}
}
