import execa from 'execa'
import fs from 'fs'
import path from 'path'
import sanityClient from '@sanity/client'

const FIXTURE_PATH = path.join(__dirname, '..', 'src', '__tests__', 'fixtures')

const client = sanityClient({
  projectId: '78m7ywdx',
  dataset: 'development',
  useCdn: false,
})

const fetchAllShopifyDocuments = async () => {
  const allDocs = await client.fetch(`
      *[
        shopifyId != null
       ]{
          collections[]->,
          products[]->,
          "collectionKeys": collections[]{
            ...
          },
          "productKeys": products[]{
            ...
          },
         ...,
        }
      `)
  return allDocs
}

const saveFixture = (filename: string, source: string, data: any) => {
  fs.writeFileSync(
    path.join(FIXTURE_PATH, source, filename),
    JSON.stringify(data, null, 2)
  )
}

const restoreBackup = async (filename: string) => {
  console.log(`Restoring backup: ${filename}`)
  await execa(
    'yarn',
    `workspace saneshopifytest restore fixtures/${filename}.tar.gz development`.split(
      ' '
    )
  )
}

const createSanityFixture = async (fixtureName: string) => {
  // TODO: We can't automate this until
  // the CLI allows us to skip confirmation of deleting
  // datasets :/
  // await restoreBackup(fixtureName)
  const fixture = await fetchAllShopifyDocuments()
  saveFixture(`${fixtureName}.json`, 'sanity', fixture)
  console.log(`Created sanity fixture "${fixtureName}"`)
}

const createShopifyFixture = async (fixtureName: string) => {
  //  const fixture = await fetchAllShopifyDocuments()
  //   saveFixture(`${fixtureName}.json`, 'sanity', fixture)
  //   console.log(`Created sanity fixture "${fixtureName}"`)
}

const run = async () => {
  // await createFixture('bare')
  // await createFixture('partial')
  await createSanityFixture('full')
}

run()
