import { uniqueId } from 'lodash'
import * as React from 'react'
import { Stack, Button, Text, TextInput, Card } from '@sanity/ui'
import { ClientContextValue, SaneConsumer } from '../Provider'

/* tslint:disable */
const FormField = require('part:@sanity/components/formfields/default').default
/* tslint:enable */

interface State {
  _id: string
  shopName: string
  accessToken: string
  loading: boolean
  error: boolean
  success: boolean
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
        await this.props.syncingClient.clearSecrets(this.props.secrets)
      this.setState({ loading: false })
    }
  }

  public render(): React.ReactNode {
    const { shopName, accessToken, loading, success } = this.state
    const { syncState } = this.props
    const { ready, valid, errorMessage } = syncState.context

    if (!ready) return null
    if (valid) {
      return (
        <Card>
          <Card
            marginBottom={[1, 2, 4]}>
            <Text
              size={1}
              weight="bold"
            >
              Unlink
            </Text>
          </Card>
          <Card marginBottom={[1, 2, 4]}>
            <Button
              style={{width: '100%'}}
              radius={0}
              fontSize={2}
              padding={[3, 3, 4]}
              tone="critical" 
              disabled={loading}
              text="Unlink Storefront"
              onClick={this.handleUnlink}
            />
          </Card>
          <Text weight="bold" size={1}>
            Unlinking your Shopify account will not remove any data in Sanity.
            But, it may cause syncing issues if you add new credentials later.
            Be sure to back up your content before unlinking.
          </Text>
        </Card>
      )
    }

    return (
      <Card>
        {errorMessage ? (
          <Text size={1} style={errorMessage ? { color: 'red' } : {}}>{errorMessage}</Text>
        ) : null}
        {!success && (
          <Stack space={[3, 3, 4, 5]}>
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
            <Card>
              <Button
                radius={0}
                fontSize={2}
                padding={[3, 3, 4]}
                tone="primary" 
                disabled={success}
                text="Save Credentials"
                onClick={this.handleSubmit}
              />
            </Card>
          </Stack>
        )}
      </Card>
    )
  }
}

export const Setup = () => (
  <SaneConsumer>
    {(clientProps) => (clientProps ? <SetupBase {...clientProps} /> : null)}
  </SaneConsumer>
)
