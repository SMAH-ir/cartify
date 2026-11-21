// One-time script: saves a local snapshot of the DummyJSON products
// (JSON + thumbnails) so the demo works without any external API.
//
// Usage (from the project root):  node scripts/download-products.mjs

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const API_URL = 'https://dummyjson.com/products?limit=20'
const publicDir = path.resolve('public')
const imagesDir = path.join(publicDir, 'images')

await mkdir(imagesDir, { recursive: true })

console.log('Fetching product list...')
const response = await fetch(API_URL)
if (!response.ok) throw new Error(`Could not fetch products: HTTP ${response.status}`)
const { products } = await response.json()

const result = []

for (const product of products) {
  const extension = path.extname(new URL(product.thumbnail).pathname) || '.webp'
  const fileName = `${product.id}${extension}`

  const imageResponse = await fetch(product.thumbnail)
  if (!imageResponse.ok) {
    throw new Error(`Could not download image for product ${product.id}: HTTP ${imageResponse.status}`)
  }
  await writeFile(path.join(imagesDir, fileName), Buffer.from(await imageResponse.arrayBuffer()))

  result.push({
    id: product.id,
    title: product.title,
    description: product.description,
    category: product.category,
    price: product.price,
    brand: product.brand ?? null,
    thumbnail: `images/${fileName}`,
  })

  console.log(`  saved #${product.id} ${product.title}`)
}

await writeFile(path.join(publicDir, 'products.json'), JSON.stringify(result, null, 2))
console.log(`\nDone: ${result.length} products saved to public/products.json`)
