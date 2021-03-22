import { uniqueId } from 'lodash'
import * as React from 'react'
import { ClientContextValue, SaneConsumer } from '../Provider'
/* tslint:disable */
const Button = require('part:@sanity/components/buttons/default').default
const Fieldset = require('part:@sanity/components/fieldsets/default').default
const FormField = require('part:@sanity/components/formfields/default').default
const TextInput = require('part:@sanity/components/textinputs/default').default
/* tslint:enable */

interface State {
  _id: string
  shopName: string
  accessToken: string
  loading: boolean
  error: boolean
  success: boolean
}

const buttonWrapperStyles = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '10px',
}

const buttonStyles = {
  margin: '0 15px',
}

export class SetupBase extends React.Component<ClientContextValue, State> {
  public urlInputId = uniqueId('storefrontUrlInput')
  public keyInputId = uniqueId('storefrontKeyInput')

  public state = {
    _id: this.props?.secrets?._id || '',
    shopName: this.props?.secrets?.shopName || '',
    accessToken: this.props?.secrets?.accessToken || '',
    loading: false,
    success: false,
    error: false,
  }

  public handleInputChange = (field: 'shopName' | 'accessToken') => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (field === 'shopName') this.setState({ shopName: e.target.value })
    if (field === 'accessToken') this.setState({ accessToken: e.target.value })
  }

  public clear = (): void => {
    this.setState({
      _id: this.props?.secrets?._id || '',
      shopName: this.props?.secrets?.shopName || '',
      accessToken: this.props?.secrets?.accessToken || '',
      error: false,
    })
  }

  public handleSubmit = async (): Promise<void> => {
    this.setState({ loading: true })
    const { saveSecrets } = this.props
    const { _id, shopName, accessToken } = this.state
    await saveSecrets({ _id, shopName, accessToken })
    this.setState({ loading: false })
  }

  public handleUnlink = async (): Promise<void> => {
    if (
      window.confirm(
        'Are you sure you want to remove your Shopify credentials?'
      )
    ) {
      this.setState({ loading: true })
      if (this.props.syncingClient)
        await this.props.syncingClient.clearSecrets()
      this.setState({ loading: false })
    }
  }

  public render(): React.ReactNode {
    const { shopName, accessToken, loading, success } = this.state
    const { syncState } = this.props
    const { ready, valid, errorMessage } = syncState.context

    if (!ready) return null
    if (valid) {
      const { shopName } = syncState.context
      return (
        <Fieldset legend="Account Setup" level={1} description="">
          <p>
            Connected to shopify storefront <strong>{shopName || null}</strong>
          </p>

          <Button color="danger" disabled={loading} onClick={this.handleUnlink}>
            Unlink
          </Button>
          <h5>
            <em>
              Unlinking your Shopify account will not remove any data in Sanity.
              But, it may cause syncing issues if you add new credentials later.
              Be sure to back up your content before unlinking.
            </em>
          </h5>
        </Fieldset>
      )
    }

    return (
      <Fieldset legend="Account Setup" level={1}>
        {errorMessage ? (
          <p style={errorMessage ? { color: 'red' } : {}}>{errorMessage}</p>
        ) : null}
        {!success && (
          <React.Fragment>
            <FormField
              label="Storefront Name"
              description="This is the first part of your shopify url,
              i.e. 'my-store.myshopify.com'"
              labelFor={this.urlInputId}
              level={0}
            >
              <TextInput
                id={this.urlInputId}
                onChange={this.handleInputChange('shopName')}
                type="text"
                disabled={success || loading}
                value={shopName}
              />
            </FormField>
            <FormField
              description="In the 'App' section of your shopify settings,
              create a new private app with the Storefront API enabled."
              label="Storefront Access Token"
              labelFor={this.keyInputId}
              level={0}
            >
              <TextInput
                id={this.keyInputId}
                disabled={success || loading}
                onChange={this.handleInputChange('accessToken')}
                value={accessToken}
                type="text"
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
    )
  }
}

export const Setup = () => (
  <SaneConsumer>
    {(clientProps) => (clientProps ? <SetupBase {...clientProps} /> : null)}
  </SaneConsumer>
)
