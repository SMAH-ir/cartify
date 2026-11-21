<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useCartStore, MAX_QUANTITY } from '@/stores/cart'
import { useToastStore } from '@/stores/toast'

const cartStore = useCartStore()
const toastStore = useToastStore()

const isCheckoutOpen = ref(false)
const isSubmitting = ref(false)
const orderPlaced = ref(false)
const orderNumber = ref('')
const nameInput = ref(null)
const modalCard = ref(null)
const cancelClearBtn = ref(null)
const isClearModalOpen = ref(false)
let previouslyFocused = null

const form = ref({
     name: '',
     address: '',
     paymentMethod: 'card'
})

function openCheckout() {
     previouslyFocused = document.activeElement
     isCheckoutOpen.value = true
     orderPlaced.value = false
}

function closeCheckout() {
     if (isSubmitting.value) return
     isCheckoutOpen.value = false
}

function handleCheckoutSubmit() {
     if (!form.value.name.trim() || !form.value.address.trim()) {
          toastStore.showToast('Please fill in all required fields.', 'error')
          return
     }

     isSubmitting.value = true

     setTimeout(() => {
          isSubmitting.value = false
          orderPlaced.value = true
          orderNumber.value = 'ORD-' + Math.floor(100000 + Math.random() * 900000)
          cartStore.clearCart()
          form.value = { name: '', address: '', paymentMethod: 'card' }
          toastStore.showToast('Order placed successfully!')
     }, 1000)
}

const isModalOpen = computed(() => isCheckoutOpen.value || isClearModalOpen.value)

// "Clear cart" opens a confirmation dialog first, so a mis-click can't wipe the cart.
function startClearCart() {
     previouslyFocused = document.activeElement
     isClearModalOpen.value = true
}

function closeClearModal() {
     isClearModalOpen.value = false
}

function confirmClearCart() {
     const snapshot = cartStore.items.map(item => ({ ...item }))
     cartStore.clearCart()
     isClearModalOpen.value = false
     toastStore.showToast('Cart cleared.', 'success', {
          label: 'Undo',
          handler: () => cartStore.restoreItems(snapshot)
     })
}

// When a dialog opens: lock the page scroll and move focus inside it.
// When it closes: unlock the scroll and give focus back to the button that opened it.
watch(isModalOpen, async (open) => {
     if (open) {
          document.body.style.overflow = 'hidden'
          await nextTick()
          if (isClearModalOpen.value) cancelClearBtn.value?.focus()
          else nameInput.value?.focus()
     }
     else {
          document.body.style.overflow = ''
          await nextTick()
          if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus()
          previouslyFocused = null
     }
})

function getFocusableElements() {
     if (!modalCard.value) return []
     return [...modalCard.value.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
     )]
}

// Esc closes the open dialog, and Tab / Shift+Tab stay inside it (focus trap).
function onKeydown(event) {
     if (!isModalOpen.value) return

     if (event.key === 'Escape') {
          if (isClearModalOpen.value) closeClearModal()
          else closeCheckout()
          return
     }
     if (event.key !== 'Tab') return

     const focusable = getFocusableElements()
     if (focusable.length === 0) return

     const first = focusable[0]
     const last = focusable[focusable.length - 1]

     if (!modalCard.value.contains(document.activeElement)) {
          event.preventDefault()
          first.focus()
     }
     else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
     }
     else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
     }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
     document.removeEventListener('keydown', onKeydown)
     document.body.style.overflow = ''
})
</script>

<template>
     <div class="container">
          <div class="cart-header">
               <h1>Your Shopping Cart</h1>

               <button v-if="cartStore.items.length > 0" type="button" class="clear-btn" @click="startClearCart">
                    Clear cart
               </button>
          </div>

          <div v-if="cartStore.items.length === 0" class="empty-state">
               <p>Your cart is currently empty.</p>
               <router-link to="/" class="continue-shopping">Continue Shopping</router-link>
          </div>

          <div v-else class="cart-content">
               <TransitionGroup name="list" tag="ul" class="cart-items">
                    <li v-for="item in cartStore.items" :key="item.id" class="cart-item">
                         <div class="item-info">
                              <img :src="item.thumbnail" alt="" class="item-image" />
                              <div>
                                   <h2>{{ item.title }}</h2>
                                   <p class="price">Price: ${{ item.price }}</p>
                              </div>
                         </div>
                         <div class="item-actions">
                              <div class="quantity-controls">
                                   <button type="button" @click="cartStore.decreaseQuantity(item.id)" class="qty-btn"
                                        :aria-label="`Decrease quantity of ${item.title}`">-</button>
                                   <span class="quantity">{{ item.quantity }}</span>
                                   <button type="button" @click="cartStore.increaseQuantity(item.id)" class="qty-btn"
                                        :disabled="item.quantity >= MAX_QUANTITY"
                                        :aria-label="`Increase quantity of ${item.title}`">+</button>
                              </div>
                              <span class="subtotal">${{ (item.price * item.quantity).toFixed(2) }}</span>
                              <button type="button" @click="cartStore.removeFromCart(item.id)" class="remove-btn"
                                   :aria-label="`Remove ${item.title} from cart`">
                                   Remove
                              </button>
                         </div>
                    </li>
               </TransitionGroup>

               <div class="cart-summary">
                    <p class="item-count">{{ cartStore.totalItems }} {{ cartStore.totalItems === 1 ? 'item' : 'items' }}</p>
                    <p class="total">Total: ${{ cartStore.totalPrice.toFixed(2) }}</p>
                    <button type="button" class="checkout-btn" @click="openCheckout">Proceed to Checkout</button>
               </div>
          </div>

          <Teleport to="body">
               <div v-if="isCheckoutOpen" class="modal-overlay" @click.self="closeCheckout">
                    <div ref="modalCard" class="modal-card" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
                         <div v-if="!orderPlaced">
                              <div class="modal-header">
                                   <h2 id="checkout-title">Checkout</h2>
                                   <button type="button" class="close-btn" aria-label="Close checkout"
                                        @click="closeCheckout">&times;</button>
                              </div>

                              <form @submit.prevent="handleCheckoutSubmit" class="checkout-form">
                                   <div class="form-group">
                                        <label for="checkout-name">Full Name *</label>
                                        <input id="checkout-name" ref="nameInput" v-model="form.name" type="text"
                                             autocomplete="name" placeholder="e.g. Jason Carter" required />
                                   </div>

                                   <div class="form-group">
                                        <label for="checkout-address">Shipping Address *</label>
                                        <textarea id="checkout-address" v-model="form.address" rows="3"
                                             autocomplete="street-address" placeholder="Street, City, Postal Code"
                                             required></textarea>
                                   </div>

                                   <div class="form-group">
                                        <label for="checkout-payment">Payment Method</label>
                                        <select id="checkout-payment" v-model="form.paymentMethod">
                                             <option value="card">Credit / Debit Card (Simulated)</option>
                                             <option value="cod">Cash on Delivery</option>
                                        </select>
                                   </div>

                                   <div class="checkout-summary-row">
                                        <span>Total Amount:</span>
                                        <strong>${{ cartStore.totalPrice.toFixed(2) }}</strong>
                                   </div>

                                   <div class="modal-actions">
                                        <button type="button" class="cancel-modal-btn" @click="closeCheckout"
                                             :disabled="isSubmitting">
                                             Cancel
                                        </button>
                                        <button type="submit" class="place-order-btn" :disabled="isSubmitting">
                                             {{ isSubmitting ? 'Processing...' : 'Place Order' }}
                                        </button>
                                   </div>
                              </form>
                         </div>

                         <div v-else class="order-success">
                              <div class="success-icon" aria-hidden="true">&#10003;</div>
                              <h2 id="checkout-title">Thank You for Your Order!</h2>
                              <p>Your order has been placed successfully.</p>
                              <div class="order-badge">Order ID: {{ orderNumber }}</div>
                              <router-link to="/" class="continue-shopping" @click="closeCheckout">
                                   Back to Home
                              </router-link>
                         </div>
                    </div>
               </div>

               <div v-if="isClearModalOpen" class="modal-overlay" @click.self="closeClearModal">
                    <div ref="modalCard" class="modal-card modal-card--small" role="alertdialog" aria-modal="true"
                         aria-labelledby="clear-title" aria-describedby="clear-description">
                         <h2 id="clear-title" class="modal-title">Clear your cart?</h2>
                         <p id="clear-description" class="modal-text">
                              This removes all {{ cartStore.totalItems }}
                              {{ cartStore.totalItems === 1 ? 'item' : 'items' }} from your cart.
                              You can undo it right after.
                         </p>
                         <div class="modal-actions">
                              <button ref="cancelClearBtn" type="button" class="cancel-modal-btn"
                                   @click="closeClearModal">Cancel</button>
                              <button type="button" class="danger-btn" @click="confirmClearCart">
                                   Yes, clear cart
                              </button>
                         </div>
                    </div>
               </div>
          </Teleport>
     </div>
</template>

<style scoped>
.container {
     padding: 20px;
     max-width: 900px;
     margin: 0 auto;
}

.cart-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     flex-wrap: wrap;
     gap: 12px;
     margin-bottom: 30px;
}

h1 {
     font-size: 1.5rem;
     color: #2c3e50;
}

.clear-btn {
     padding: 8px 14px;
     background: transparent;
     color: #c0392b;
     border: 1px solid #e74c3c;
     border-radius: 6px;
     font-weight: 600;
     cursor: pointer;
     transition: background-color 0.2s;
}

.clear-btn:hover {
     background-color: #fdecea;
}

.modal-card--small {
     max-width: 380px;
}

.modal-title {
     font-size: 1.3rem;
     color: #2c3e50;
     margin-bottom: 10px;
}

.modal-text {
     color: #555;
     line-height: 1.5;
     margin-bottom: 20px;
}

.danger-btn {
     background: #e74c3c;
     color: #fff;
     border: none;
     padding: 10px 18px;
     border-radius: 6px;
     cursor: pointer;
     font-weight: bold;
}

.danger-btn:hover {
     background: #c0392b;
}

.item-count {
     color: #666;
     margin-bottom: 4px;
}

.empty-state {
     text-align: center;
     padding: 60px 20px;
     background-color: #f9f9f9;
     border-radius: 12px;
}

.continue-shopping {
     display: inline-block;
     margin-top: 15px;
     padding: 10px 20px;
     background-color: #2b78a8;
     color: white;
     text-decoration: none;
     border-radius: 6px;
     font-weight: bold;
}

.cart-items {
     position: relative;
     list-style: none;
     max-height: 420px;
     overflow-y: auto;
     overflow-x: hidden;
     scrollbar-width: thin;
     scrollbar-color: #ccc transparent;
}

.cart-items::-webkit-scrollbar {
     width: 6px;
}

.cart-items::-webkit-scrollbar-thumb {
     background-color: #ccc;
     border-radius: 4px;
}

.cart-items::-webkit-scrollbar-track {
     background: transparent;
}

.cart-item {
     display: flex;
     justify-content: space-between;
     align-items: center;
     padding: 20px;
     margin-bottom: 10px;
     background: #fff;
     border: 1px solid #eee;
     border-radius: 8px;
     box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.list-move,
.list-enter-active,
.list-leave-active {
     transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
     opacity: 0;
     transform: translateX(30px);
}

.list-leave-active {
     position: absolute;
     width: 100%;
}

.item-info {
     display: flex;
     align-items: center;
     gap: 20px;
}

.item-info h2 {
     font-size: 1.05rem;
}

.item-image {
     width: 80px;
     height: 80px;
     object-fit: contain;
     border-radius: 8px;
     background-color: #f9f9f9;
}

.item-actions {
     display: flex;
     align-items: center;
     gap: 30px;
}

.quantity-controls {
     display: flex;
     align-items: center;
     gap: 12px;
     background-color: #f9f9f9;
     border: 1px solid #ddd;
     padding: 4px;
     border-radius: 8px;
}

.qty-btn {
     width: 28px;
     height: 28px;
     border: none;
     background-color: white;
     border-radius: 6px;
     cursor: pointer;
     font-weight: bold;
     font-size: 1.2rem;
     display: flex;
     align-items: center;
     justify-content: center;
     color: #333;
     box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
     transition: background-color 0.2s;
}

.qty-btn:hover {
     background-color: #eee;
}

.qty-btn:disabled {
     opacity: 0.4;
     cursor: not-allowed;
}

.quantity {
     font-weight: bold;
     font-size: 1.1rem;
     min-width: 20px;
     text-align: center;
     color: #2c3e50;
}

.subtotal {
     min-width: 100px;
     text-align: right;
     font-weight: bold;
     font-size: 1.1rem;
     color: #2c3e50;
}

.remove-btn {
     background-color: #e74c3c;
     color: white;
     border: none;
     padding: 8px 12px;
     border-radius: 6px;
     cursor: pointer;
     transition: background-color 0.2s;
}

.remove-btn:hover {
     background-color: #c0392b;
}

.cart-summary {
     margin-top: 10px;
     padding: 20px;
     background-color: #f9f9f9;
     border-radius: 8px;
     text-align: right;
     border: 1px solid #eee;
}

.total {
     font-size: 1.5rem;
     font-weight: bold;
     color: #2c3e50;
}

.checkout-btn {
     margin-top: 15px;
     background-color: #2ecc71;
     color: white;
     border: none;
     padding: 12px 24px;
     border-radius: 6px;
     font-size: 1.1rem;
     font-weight: bold;
     cursor: pointer;
     transition: background-color 0.2s;
}

.checkout-btn:hover {
     background-color: #27ae60;
}

.modal-overlay {
     position: fixed;
     inset: 0;
     background-color: rgba(0, 0, 0, 0.5);
     display: flex;
     align-items: center;
     justify-content: center;
     z-index: 1000;
     padding: 15px;
}

.modal-card {
     background: #fff;
     border-radius: 12px;
     width: 100%;
     max-width: 450px;
     padding: 24px;
     box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
     animation: fadeInModal 0.2s ease-out;
}

.modal-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 20px;
}

.modal-header h2 {
     font-size: 1.3rem;
     color: #2c3e50;
}

.close-btn {
     background: none;
     border: none;
     font-size: 24px;
     cursor: pointer;
     color: #666;
}

.checkout-form .form-group {
     margin-bottom: 16px;
     text-align: left;
}

.checkout-form label {
     display: block;
     font-size: 0.9rem;
     font-weight: 600;
     color: #444;
     margin-bottom: 6px;
}

.checkout-form input,
.checkout-form textarea,
.checkout-form select {
     width: 100%;
     padding: 10px;
     border: 1px solid #ccc;
     border-radius: 6px;
     font-size: 0.95rem;
}

.checkout-form input:focus,
.checkout-form textarea:focus,
.checkout-form select:focus {
     outline: none;
     border-color: #3498db;
     box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.checkout-summary-row {
     display: flex;
     justify-content: space-between;
     align-items: center;
     padding: 12px 0;
     border-top: 1px solid #eee;
     border-bottom: 1px solid #eee;
     margin: 16px 0;
     font-size: 1.1rem;
}

.modal-actions {
     display: flex;
     justify-content: flex-end;
     gap: 10px;
}

.cancel-modal-btn {
     background: #eee;
     border: none;
     padding: 10px 18px;
     border-radius: 6px;
     cursor: pointer;
     font-weight: 600;
     color: #555;
}

.place-order-btn {
     background: #2ecc71;
     color: #fff;
     border: none;
     padding: 10px 20px;
     border-radius: 6px;
     cursor: pointer;
     font-weight: bold;
}

.place-order-btn:disabled,
.cancel-modal-btn:disabled {
     opacity: 0.6;
     cursor: not-allowed;
}

.order-success {
     display: flex;
     flex-direction: column;
     text-align: center;
}

.order-success h2 {
     font-size: 1.3rem;
     margin-bottom: 8px;
}

.success-icon {
     width: 50px;
     height: 50px;
     background: #2ecc71;
     color: #fff;
     border-radius: 50%;
     display: flex;
     align-items: center;
     justify-content: center;
     font-size: 26px;
     margin: 0 auto 16px;
}

.order-badge {
     background: #f0fdf4;
     color: #166534;
     display: inline-block;
     padding: 6px 14px;
     border-radius: 20px;
     font-weight: bold;
     margin-top: 15px;
     border: 1px solid #bbf7d0;
}

@keyframes fadeInModal {
     from {
          opacity: 0;
          transform: scale(0.96);
     }

     to {
          opacity: 1;
          transform: scale(1);
     }
}

@media (max-width: 600px) {
     .cart-item {
          flex-wrap: wrap;
          gap: 16px;
          padding: 16px;
     }

     .item-actions {
          flex-wrap: wrap;
          gap: 16px;
     }

     .remove-btn {
          flex-basis: 100%;
          margin-top: 8px;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
     }
}
</style>
