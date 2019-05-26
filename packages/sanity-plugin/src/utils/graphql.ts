import { Paginated, PageInfo } from '../types'

type EdgeWithCursor<Edge> = Edge & {
	__cursor: string
}

interface PaginationInfo {
	pageInfo: PageInfo
	lastCursor?: string
	firstCursor: string
}

type UnwoundEdges<EdgeType> = [EdgeWithCursor<EdgeType>[], PaginationInfo]

/**
 * unwindEdges
 *
 *  Takes a GraphQL-paginated response and returns a tuple of (1) simple array of the nodes,
 *  with an additional __cursor, and (2) the original page info.
 *
 *  example:
 *  {
 *     pageInfo: { hasNextPage: true, hasPreviousPage: false },
 *     edges: [
 * 		{ cursor: 123, node: { id: 'abc', username: 'frank' }}
 * 		{ cursor: 234, node: { id: 'xyz', username: 'ursula' }}
 *     ]
 *  }
 *
 *  returns:
 *
 *  [
 *     [
 * 		{ id: 'abc', username: 'frank', __cursor: 123 },
 * 		{ id: 'xyz', username: 'ursula', __cursor: 234 },
 * 	 ]
 *     { hasNextPage: true, hasPreviousPage: false }
 *  ]
 *
 * @export
 * @template EdgeType
 * @param {Paginated<EdgeType>} { edges, pageInfo }
 * @returns {UnwoundEdges<EdgeType>}
 */

export const unwindEdges = <EdgeType>({
	edges,
	pageInfo,
}: Paginated<EdgeType>): UnwoundEdges<EdgeType> => {
	return [
		edges.map(edge => ({ ...edge.node, __cursor: edge.cursor })),
		{
			pageInfo,
			lastCursor: edges[edges.length - 1].cursor,
			firstCursor: edges[0].cursor,
		},
	]
}
