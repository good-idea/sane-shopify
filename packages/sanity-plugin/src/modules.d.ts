import { SanityClientConstructor } from '@sanity/client'

declare module 'part:@sanity/base/client' {
  export = SanityClientConstructor
}
