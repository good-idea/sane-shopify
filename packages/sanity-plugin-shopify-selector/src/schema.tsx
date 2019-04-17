import * as React from 'react'
import InputComponent from './InputComponent'

export default {
	title: 'Shopify Item',
	name: 'shopifyItem',
	type: 'object',
	fields: [
		{
			name: 'itemId',
			title: 'Item ID',
			type: 'string',
		},
		{
			name: 'title',
			type: 'string',
			readOnly: true,
		},
		{
			name: 'itemType',
			type: 'string',
			readOnly: true,
		},
		{
			name: 'handle',
			type: 'string',
			readOnly: true,
		},
		{
			name: 'description',
			type: 'string',
			readOnly: true,
		},
		{
			name: 'originalImage',
			type: 'string',
			readOnly: true,
		},
		{
			name: 'previewImage',
			type: 'string',
			readOnly: true,
		},
	],
	inputComponent: InputComponent,

	preview: {
		select: {
			title: 'title',
			subtitle: 'description',
			previewImage: 'previewImage',
		},
		prepare: values => {
			const { title, description, previewImage } = values
			return {
				title,
				subtitle: description,
				media: <img alt={title} src={previewImage} />,
			}
		},
	},
}
