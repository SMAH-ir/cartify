import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const API_URL = 'https://dummyjson.com/products?limit=20'

// Tries the live API first. The timeout keeps the page from hanging
// when the API is slow or unreachable.
async function loadFromApi() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4000)
  try {
    const response = await fetch(API_URL, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const { products } = await response.json()
    return products.map(({ id, title, description, category, price, brand, thumbnail }) => ({
      id, title, description, category, price, brand: brand ?? null, thumbnail
    }))
  }
  finally {
    clearTimeout(timer)
  }
}

// Fallback: the local snapshot created by scripts/download-products.mjs
async function loadFromLocal() {
  const base = import.meta.env.BASE_URL
  const response = await fetch(`${base}products.json`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const list = await response.json()
  return list.map(product => ({ ...product, thumbnail: `${base}${product.thumbnail}` }))
}

export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  const source = ref(null) // 'api' or 'local'
  const searchQuery = ref('')

  const filteredProducts = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    if (!query) return products.value
    return products.value.filter(product =>
      product.title.toLowerCase().includes(query)
    )
  })

  const getProductById = (id) => {
    return products.value.find(product => product.id === Number(id)) ?? null
  }

  const fetchProducts = async () => {
    // Already loaded (or loading): don't fetch again when switching pages.
    if (products.value.length > 0 || loading.value) return

    loading.value = true
    error.value = null
    try {
      try {
        products.value = await loadFromApi()
        source.value = 'api'
      }
      catch (apiError) {
        console.warn('Live API unavailable, using the local copy:', apiError)
        products.value = await loadFromLocal()
        source.value = 'local'
      }
    }
    catch (err) {
      console.error('Failed to load products:', err)
      error.value = 'Could not load the products. Please try again.'
    }
    finally {
      loading.value = false
    }
  }

  return { products, loading, error, source, searchQuery, filteredProducts, getProductById, fetchProducts }
})
