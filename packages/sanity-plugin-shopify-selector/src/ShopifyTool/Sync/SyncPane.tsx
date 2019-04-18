import * as React from 'react'
import { Sync } from './Sync'

const SyncPaneBase = props => {
	return <p>Sync me</p>
}

export const SyncPane = () => (
	<Sync>{syncProps => <SyncPaneBase {...syncProps} />}</Sync>
)
