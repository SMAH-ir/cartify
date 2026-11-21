import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useToastStore } from './toast'

// Prefixed key: all my demos live on smah-ir.github.io and share one localStorage.
const STORAGE_KEY = 'cartify:cart'
export const MAX_QUANTITY = 99

function isValidItem(item) {
     return Boolean(item)
          && Number.isFinite(item.id)
          && typeof item.title === 'string'
          && Number.isFinite(item.price)
          && Number.isInteger(item.quantity)
          && item.quantity > 0
}

function loadCart() {
     try {
          const saved = localStorage.getItem(STORAGE_KEY)
          const parsed = saved ? JSON.parse(saved) : []
          if (!Array.isArray(parsed)) return []
          return parsed
               .filter(isValidItem)
               .map(item => ({ ...item, quantity: Math.min(item.quantity, MAX_QUANTITY) }))
     }
     catch {
          return []
     }
}

export const useCartStore = defineStore('cart', () => {
     const items = ref(loadCart())

     watch(items, (newItems) => {
          try {
               localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems))
          }
          catch {
               // Storage can be full or disabled: the cart still works for this session.
          }
     }, { deep: true })

     const addToCart = (product) => {
          const toastStore = useToastStore()
          const existingItem = items.value.find(item => item.id === product.id)

          if (existingItem) {
               if (existingItem.quantity >= MAX_QUANTITY) {
                    toastStore.showToast(`You can add up to ${MAX_QUANTITY} of the same product.`, 'error')
                    return
               }
               existingItem.quantity++
          }
          else {
               items.value.push({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    thumbnail: product.thumbnail,
                    quantity: 1
               })
          }
          toastStore.showToast(`${product.title} added to cart!`)
     }

     // Puts a removed item back (used by "Undo"). Merges if the product was added again meanwhile.
     const restoreItem = (item, index) => {
          const existing = items.value.find(current => current.id === item.id)
          if (existing) {
               existing.quantity = Math.min(existing.quantity + item.quantity, MAX_QUANTITY)
               return
          }
          items.value.splice(Math.min(index, items.value.length), 0, { ...item })
     }

     const restoreItems = (list) => {
          if (items.value.length === 0) {
               items.value = list.map(item => ({ ...item }))
               return
          }
          list.forEach(item => restoreItem(item, items.value.length))
     }

     const removeFromCart = (id) => {
          const index = items.value.findIndex(item => item.id === id)
          if (index === -1) return

          const removed = { ...items.value[index] }
          items.value.splice(index, 1)
          useToastStore().showToast(`${removed.title} removed.`, 'success', {
               label: 'Undo',
               handler: () => restoreItem(removed, index)
          })
     }

     const increaseQuantity = (id) => {
          const item = items.value.find(item => item.id === id)
          if (item && item.quantity < MAX_QUANTITY) item.quantity++
     }

     const decreaseQuantity = (id) => {
          const item = items.value.find(item => item.id === id)
          if (!item) return
          if (item.quantity > 1) {
               item.quantity--
          } else {
               removeFromCart(id)
          }
     }

     const clearCart = () => {
          items.value = []
     }

     const totalItems = computed(() => {
          return items.value.reduce((total, item) => total + item.quantity, 0)
     })

     const totalPrice = computed(() => {
          return items.value.reduce((total, item) => total + (item.price * item.quantity), 0)
     })

     return {
          items, addToCart, removeFromCart, restoreItem, restoreItems,
          increaseQuantity, decreaseQuantity, clearCart, totalItems, totalPrice
     }
})
