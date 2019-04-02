import * as React from 'react'
import {
	Secrets,
	SecretUtils,
	fetchSecrets,
	testSecrets,
	saveSecrets,
} from '../utils/secrets'
import { Setup } from './Setup'
import { ShopifyInput } from './ShopifyInput'
import { SanityInputProps } from '../types'

interface InputProps extends SecretUtils {
	inputProps: SanityInputProps
}

interface State {
	initialized: boolean
	secrets: Secrets | null
	valid?: boolean
}

export class MainBase extends React.Component<InputProps, State> {
	state = {
		initialized: false,
		valid: undefined,
		secrets: undefined,
	}

	async componentDidMount() {
		const { fetchSecrets, testSecrets } = this.props
		const secrets = await fetchSecrets()
		const { valid } = await testSecrets(secrets)

		this.setState({
			initialized: true,
			valid,
			secrets,
		})
	}

	/* Called by the Setup component after secrest have been supplied and validated */
	updateSecrets = (secrets: Secrets) => {
		this.setState({
			initialized: true,
			valid: true,
			secrets,
		})
	}

	render() {
		const { inputProps } = this.props
		const { initialized, secrets, valid } = this.state

		if (!initialized) return null
		if (
			!valid ||
			Boolean(!secrets.storefrontName || !secrets.storefrontApiKey)
		) {
			return (
				<Setup
					{...this.props}
					secrets={secrets}
					updateSecrets={this.updateSecrets}
				/>
			)
		}
		if (secrets) return <ShopifyInput secrets={secrets} {...inputProps} />
	}
}

/* Pass the secrets in as props so we can inject for testing */
export const Main = (props: SanityInputProps) => (
	<MainBase
		inputProps={props}
		testSecrets={testSecrets}
		fetchSecrets={fetchSecrets}
		saveSecrets={saveSecrets}
	/>
)
