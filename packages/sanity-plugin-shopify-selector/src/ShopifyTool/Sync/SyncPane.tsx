import * as React from 'react'
import { Sync, SyncRenderProps } from './Sync'
import Button from 'part:@sanity/components/buttons/default'
import Fieldset from 'part:@sanity/components/fieldsets/default'

interface Props extends SyncRenderProps {}

const SyncPaneBase = ({ loading, run }: Props) => {
	const handleSyncButton = () => run()
	return (
		<Fieldset legend="Sync" level={1}>
			<Button loading={loading} color="primary" onClick={handleSyncButton}>
				Sync from Shopify
			</Button>
		</Fieldset>
	)
}

export const SyncPane = () => (
	<Sync>{syncProps => <SyncPaneBase {...syncProps} />}</Sync>
)
