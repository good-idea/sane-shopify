/**
 * Changing this version may result in a breaking change.
 *
 * After updating, check the changes to the Storefront API:
 *
 * https://help.shopify.com/en/api/versioning
 *
 * Their changes will be marked as BREAKING.
 *
 * For BREAKING changes that modify the structure of anything stored
 * in `sourceData`:
 *  - if these changes remove fields or alter their structure, this is
 *    a breaking change for this package. Even if it does not affect
 *    the package internally, consumers of the package may be relying
 *    on that structure.
 *  - if the changes made add new fields, this is not a breaking change.
 *    Include the new fields in `sourceData` - when users re-sync, they
 *    will have access.
 *
 */

export const STOREFRONT_API_VERSION = '2022-10'
