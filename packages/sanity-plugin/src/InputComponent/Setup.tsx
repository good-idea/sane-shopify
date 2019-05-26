import * as React from 'react'
import { uniqueId } from 'lodash'

import Button from 'part:@sanity/components/buttons/default'
import Fieldset from 'part:@sanity/components/fieldsets/default'
import FormField from 'part:@sanity/components/formfields/default'
import TextInput from 'part:@sanity/components/textinputs/default'
import { ClientContextValue } from '../Provider'

interface Props extends ClientContextValue {}

interface State {
	storefrontName: string
	storefrontApiKey: string
	loading: boolean
	error: boolean
	message: string
	success: boolean
}

const wrapperStyles = {
	padding: '15px',
	borderRadius: '5px',
	border: '1px solid #e68987',
	backgroundColor: '#fbebed',
}

const errorStyles = {
	color: 'red',
	fontStyle: 'italic',
}

const buttonWrapperStyles = {
	display: 'flex',
	justifyContent: 'center',
	marginTop: '10px',
}

const buttonStyles = {
	margin: '0 15px',
}

export class Setup extends React.Component<Props, State> {
	urlInputId = uniqueId('storefrontUrlInput')
	keyInputId = uniqueId('storefrontKeyInput')

	state = {
		storefrontName: this.props.secrets.storefrontName || '',
		storefrontApiKey: this.props.secrets.storefrontApiKey || '',
		loading: false,
		success: false,
		error: undefined,
		message: undefined,
	}

	handleInputChange = (field: 'storefrontName' | 'storefrontApiKey') => e => {
		if (field === 'storefrontName')
			this.setState({ storefrontName: e.target.value })
		if (field === 'storefrontApiKey')
			this.setState({ storefrontApiKey: e.target.value })
	}

	clear = () => {
		this.setState({
			storefrontName: this.props.secrets.storefrontName || '',
			storefrontApiKey: this.props.secrets.storefrontApiKey || '',
			error: false,
			message: undefined,
		})
	}

	updateCredentials = async () => {
		const { saveSecrets } = this.props
		const { storefrontName, storefrontApiKey } = this.state
		await saveSecrets({ storefrontName, storefrontApiKey })
	}

	handleSubmit = async () => {
		await this.setState({ loading: true })
		const { testSecrets } = this.props
		const { storefrontName, storefrontApiKey } = this.state
		const { valid, message } = await testSecrets({
			storefrontName,
			storefrontApiKey,
		})
		if (!valid) {
			this.setState({
				loading: false,
				error: true,
				message,
			})
			return
		}
		this.setState({
			loading: false,
			error: false,
			success: true,
			message,
		})
		setTimeout(this.updateCredentials, 2000)
	}

	render() {
		const {
			storefrontName,
			storefrontApiKey,
			loading,
			error,
			message,
			success,
		} = this.state
		return (
			<div style={wrapperStyles}>
				<Fieldset
					legend="Shopify Setup"
					level={1}
					description="You need to provide your Shopify info before you can use this
					field. These credentials will be stored safely in a hidden document only available to editors."
				>
					{message ? (
						<p style={error ? { color: 'red' } : {}}>{message}</p>
					) : null}
					{!success && (
						<React.Fragment>
							<FormField
								label="Storefront Name"
								description="This is the first part of your shopify url, i.e. 'my-store.myshopify.com'"
								labelFor={this.urlInputId}
								level={0}
							>
								<TextInput
									id={this.urlInputId}
									onChange={this.handleInputChange('storefrontName')}
									type="text"
									disabled={success || loading}
									value={storefrontName}
								/>
							</FormField>
							<FormField
								description="In the 'App' section of your shopify settings, create a new private app with the Storefront API enabled."
								label="Storefront API Key"
								labelFor={this.keyInputId}
								level={0}
							>
								<TextInput
									id={this.keyInputId}
									disabled={success || loading}
									onChange={this.handleInputChange('storefrontApiKey')}
									value={storefrontApiKey}
									type="password"
								/>
							</FormField>
						</React.Fragment>
					)}
					<div style={buttonWrapperStyles}>
						<Button
							loading={success || loading}
							disabled={success}
							color="primary"
							kind="default"
							onClick={this.handleSubmit}
							style={buttonStyles}
						>
							Save Credentials
						</Button>
					</div>
				</Fieldset>
			</div>
		)
	}
}
