import * as React from 'react'
import { uniqueId } from 'lodash'
import Button from 'part:@sanity/components/buttons/default'
import Fieldset from 'part:@sanity/components/fieldsets/default'
import FormField from 'part:@sanity/components/formfields/default'
import TextInput from 'part:@sanity/components/textinputs/default'
import { Provider, ClientContextValue } from '../Provider'
import { SanityInputProps } from '../types'
import { SyncPane } from './Sync'
import { Setup } from './Setup'

interface Props {
	clientProps: ClientContextValue
	inputProps: any
}

export const ShopifyTool = () => {
	return (
		<div style={{ margin: '0 auto', maxWidth: '920px' }}>
			<SyncPane />
			<Setup />
		</div>
	)
}
