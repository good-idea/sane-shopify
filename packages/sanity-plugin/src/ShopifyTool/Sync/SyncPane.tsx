import * as React from 'react'
import { Sync, SyncRenderProps } from './Sync'
import Button from 'part:@sanity/components/buttons/default'
import Fieldset from 'part:@sanity/components/fieldsets/default'

interface Props extends SyncRenderProps {}

const SyncPaneBase = ({
	ready,
	valid,
	loading,
	totalProducts,
	productsSynced,
	run,
}: Props) => {
	const handleSyncButton = () => run()
	if (!valid) return null
	if (!ready) return 'Loading...'

	return (
		<Fieldset legend="Sync" level={1}>
			{productsSynced.length ? (
				<p>
					synced {productsSynced.length}/{totalProducts.length} products
				</p>
			) : null}
			<Button loading={loading} color="primary" onClick={handleSyncButton}>
				Sync from Shopify
			</Button>
		</Fieldset>
	)
}

export const SyncPane = () => (
	<Sync>{syncProps => <SyncPaneBase {...syncProps} />}</Sync>
)
