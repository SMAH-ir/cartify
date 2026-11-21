import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import { useCartStore, MAX_QUANTITY } from './cart'
import { useToastStore } from './toast'

const STORAGE_KEY = 'cartify:cart'

function createMemoryStorage() {
     let data = {}
     return {
          getItem: (key) => (key in data ? data[key] : null),
          setItem: (key, value) => { data[key] = String(value) },
          removeItem: (key) => { delete data[key] },
          clear: () => { data = {} }
     }
}

const phone = { id: 1, title: 'Phone', price: 100, thumbnail: 'phone.webp', description: 'ignored' }
const laptop = { id: 2, title: 'Laptop', price: 250.5, thumbnail: 'laptop.webp' }

describe('cart store', () => {
     beforeEach(() => {
          vi.useFakeTimers()
          vi.stubGlobal('localStorage', createMemoryStorage())
          setActivePinia(createPinia())
     })

     afterEach(() => {
          vi.useRealTimers()
          vi.unstubAllGlobals()
     })

     it('adds a new product with quantity 1 and keeps only the needed fields', () => {
          const cart = useCartStore()
          cart.addToCart(phone)

          expect(cart.items).toEqual([
               { id: 1, title: 'Phone', price: 100, thumbnail: 'phone.webp', quantity: 1 }
          ])
     })

     it('increases the quantity when the same product is added again', () => {
          const cart = useCartStore()
          cart.addToCart(phone)
          cart.addToCart(phone)

          expect(cart.items).toHaveLength(1)
          expect(cart.items[0].quantity).toBe(2)
     })

     it(`never goes above ${MAX_QUANTITY} of the same product`, () => {
          const cart = useCartStore()
          for (let i = 0; i < MAX_QUANTITY + 5; i++) cart.addToCart(phone)
          cart.increaseQuantity(phone.id)

          expect(cart.items[0].quantity).toBe(MAX_QUANTITY)
          expect(useToastStore().type).toBe('error')
     })

     it('removes an item when its quantity is decreased from 1', () => {
          const cart = useCartStore()
          cart.addToCart(phone)
          cart.decreaseQuantity(phone.id)

          expect(cart.items).toHaveLength(0)
     })

     it('calculates total items and total price', () => {
          const cart = useCartStore()
          cart.addToCart(phone)
          cart.addToCart(phone)
          cart.addToCart(laptop)

          expect(cart.totalItems).toBe(3)
          expect(cart.totalPrice).toBeCloseTo(450.5)
     })

     it('clears the whole cart', () => {
          const cart = useCartStore()
          cart.addToCart(phone)
          cart.addToCart(laptop)
          cart.clearCart()

          expect(cart.items).toEqual([])
          expect(cart.totalItems).toBe(0)
     })

     it('can undo a removal and keeps the original position', () => {
          const cart = useCartStore()
          cart.addToCart(phone)
          cart.addToCart(laptop)
          cart.removeFromCart(phone.id)
          expect(cart.items.map(item => item.id)).toEqual([2])

          useToastStore().runAction()

          expect(cart.items.map(item => item.id)).toEqual([1, 2])
     })

     it('can restore a cleared cart', () => {
          const cart = useCartStore()
          cart.addToCart(phone)
          cart.addToCart(laptop)
          const snapshot = cart.items.map(item => ({ ...item }))

          cart.clearCart()
          cart.restoreItems(snapshot)

          expect(cart.items).toEqual(snapshot)
     })

     it('saves the cart to localStorage', async () => {
          const cart = useCartStore()
          cart.addToCart(phone)
          await nextTick()

          const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
          expect(saved).toHaveLength(1)
          expect(saved[0].id).toBe(1)
     })

     it('starts with an empty cart when the saved data is corrupted', () => {
          localStorage.setItem(STORAGE_KEY, '{not valid json')
          setActivePinia(createPinia())

          expect(useCartStore().items).toEqual([])
     })

     it('drops invalid saved items and clamps huge quantities', () => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([
               { id: 1, title: 'Phone', price: 100, quantity: 5000 },
               { id: 'x', title: 'Broken', price: 'free', quantity: 1 },
               null
          ]))
          setActivePinia(createPinia())

          const cart = useCartStore()
          expect(cart.items).toHaveLength(1)
          expect(cart.items[0].quantity).toBe(MAX_QUANTITY)
     })
})
