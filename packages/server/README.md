This package contains functions to use with Shopify's Webhooks.

<!-- toc -->
- [Setup](#setup)
- [Usage](#usage)
    - [Shopify config & Metafields](#shopify-config--metafields)
    - [Error Handling](#error-handling)
  - [Micro.js (Next.js)](#microjs-nextjs)
  - [Lambdas (AWS, Netlify, etc)](#lambdas-aws-netlify-etc)
  - [Roll your own](#roll-your-own)
    - [Debugging](#debugging)
- [Shopify Setup](#shopify-setup)

<!-- tocstop -->

## Setup

Create a Sanity token:

1. Go to https://manage.sanity.io
2. Select your Sanity project
3. Go to Settings
4. Create a new token with Read + Write privileges.

## Usage

Create the configuration settings. This uses `dotenv`, but you can create these values however you would like. Be sure not to publish your Sanity token!

There are three ways to create webhooks:

1. If you are using Lambdas (for AWS, Netlify, and others), import `createAWSWebhooks`
2. If you are using Micro (Next.js), import `createNextWebhooks`
3. If you are using something else, import `createWebhooks`.

See the follow-up instructions below for each method.

Create a file that sets up the webhooks with your configuration, i.e. `src/webhooks.js`

```js
import { createNextWebhooks } from '@sane-shopify/server'
// or
// import { createAWSWebhooks } from '@sane-shopify/server'
// or
// import { createWebhooks } from '@sane-shopify/server'
import dotEnv from 'dotenv'

dotEnv.config()

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET
const authToken = process.env.SANITY_AUTH_TOKEN
const shopName = process.env.SHOPIFY_SHOP_NAME
const accessToken = process.env.SHOPIFY_STOREFRONT_TOKEN

if (!projectId) throw new Error('You must provide a sanity project ID')
if (!dataset) throw new Error('You must provide a sanity dataset')
if (!authToken) throw new Error('You must provide a sanity auth token')
if (!shopName) throw new Error('You must provide a shopify shop name')
if (!accessToken) throw new Error('You must provide a shopify access token')


// optional, see below
const handleError = (err: Error) => {
  Sentry.captureException(err)
}


// 🚨 Alpha breaking change: This configuration changed in 0.20.0. If you are getting errors after updating, put your `onError` handler on the `config` object, and pass that object into `createWebhooks` as the sole argument.

const config = {
  secrets: {
    sanity: {
      projectId,
      dataset,
      authToken,
    },
    shopify: {
      shopName,
      accessToken,
    },
  },
  /* Optional */
  onError: handleError
  /* Optional, see more below */
  shopify: {
    // ...
  }
}

export const webhooks = createNextWebhooks(config)
// or
// export const webhooks = createAWSWebhooks(config)
// or
// export const webhooks = createWebhooks(config)
```

#### Shopify config & Metafields

As of version 0.24.0, you must provide the namespace & key values of any metafields you would like to fetch. Metafield configuration is in the format of `{ namespace: string, key: string }` and should match what you have in shopify. You can define metafield configuration for collections, products, or their variants, like so:

```ts
const config = {
  // ...
  shopify: {
    products: {
      metafields: [{ namespace: 'foo', key: 'bar' }],
    },
    variants: {
      metafields: [{ namespace: 'foo', key: 'baz' }],
    },
    collections: {
      metafields: [{ namespace: 'foo', key: 'qux' }],
    },
  },
}
```

#### Error Handling

You can provide your own `onError` handler. This is optional, but is a good way to make sure everything is working as expected. Shopify requires a 200 response within 5 seconds, and after multiple failed calls to your webhook, it will be removed from your Shopify settings. This package returns a 200 response even if there is an error updating the item.

### Micro.js (Next.js)

You'll need to create 4 API endpoints in your project. Within your `pages`, create an `api` directory with the following files:

- `onCollectionUpdate.js`
- `onCollectionDelete.js`
- `onProductUpdate.js`
- `onProductDelete.js`
- `onOrderCreate.js`

Within each of those, import the `webhooks` you created and export the appropriate method:

`onCollectionUpdate.js`

```js
import { webhooks } from '../src/webhooks'

export default webhooks.onCollectionUpdate
```

`onCollectionDelete.js`

```js
import { webhooks } from '../src/webhooks'

export default webhooks.onCollectionDelete
```

`onProductUpdate.js`

```js
import { webhooks } from '../src/webhooks'

export default webhooks.onProductUpdate
```

`onProductDelete.js`

```js
import { webhooks } from '../src/webhooks'

export default webhooks.onProductDelete
```

`onOrderCreate.js`

```js
import { webhooks } from '../src/webhooks'

export default webhooks.onOrderCreate
```

Your site now has 5 new endpoints:

- `https://www.your-site.com/api/onCollectionUpdate`
- `https://www.your-site.com/api/onCollectionDelete`
- `https://www.your-site.com/api/onProductUpdate`
- `https://www.your-site.com/api/onProductDelete`
- `https://www.your-site.com/api/onOrderCreate`

Add these to your Shopify settings (see [Shopify Setup](#Shopify-Setup) below)

### Lambdas (AWS, Netlify, etc)

Create 5 lamba files, i.e.:

- `/lambdas/onCollectionUpdate`
- `/lambdas/onCollectionDelete`
- `/lambdas/onProductUpdate`
- `/lambdas/onProductDelete`
- `/lambdas/onOrderCreate`

Within these files, import the `webhooks` you created and export them as `exports.handler`

`onCollectionUpdate.js`

```js
import { webhooks } from '../src/webhooks'

exports.handler = webhooks.onCollectionUpdate
```

`onCollectionDelete.js`

```js
import { webhooks } from '../src/webhooks'

exports.handler = webhooks.onCollectionDelete
```

`onProductUpdate.js`

```js
import { webhooks } from '../src/webhooks'

exports.handler = webhooks.onProductUpdate
```

`onProductDelete.js`

```js
import { webhooks } from '../src/webhooks'

exports.handler = webhooks.onProductDelete
```

`onOrderCreate.js`

```js
import { webhooks } from '../src/webhooks'

exports.handler = webhooks.onOrderCreate
```

Deploy your webhooks and add their URLs to your Shopify settings (see [Shopify Setup](#Shopify-Setup) below).

### Roll your own

If you are using another service to create the endpoints, you can use `createWebhooks` to generate simple functions to handle the syncing.

`onCollectionUpdate`, `onCollectionDelete`, `onProductUpdate` and `onProductDelete` each accept a single object with an `id` property, which is provided in the body sent by Shopify.

`onOrderCreate` accepts a single object with an `updated_at` property (the date that the order was created/updated) and `line_items`, an array of line items in the checkout: `{ updated_at: number, line_items: CheckoutLineItem[] }`

An example express.js route might be:

```
import { webhooks } from './src/webhooks'

app.post('/api/onProductCreate', async (req, res) => {
  const { body } = req;
  await webhooks.onProductCreate(body)
  res.status(200).send('success')
})
```

#### Debugging

To log messages to your console, set the environment variable `DEBUG=sane-shopify:server` (or `DEBUG=sane-shopify:*` if you want all messages to be logged)

## Shopify Setup

You'll need to create 4 webhooks pointing to the endpionts you just created. Within your Shopify settings, go to _Notifications_, and add new webhooks for the appropriate events. Note that you do not need to create a Collection Created or Product Created webhook - shopify will call the Update webhook for both of these when a collection or product is created.

**⚠️ Warning**: It is recommended that you set up an error monitoring service like Sentry to alert you of issues with your webhooks. If shopify receives a non-200 status code on a webhook, it will try it several more times, and if it is still receiving an error, removes it from your settings (without sending you a notification!) These webhooks will sent a `200` response right away, before processing the webhook data - but server timeouts or other problems may result in your webhooks being removed.
