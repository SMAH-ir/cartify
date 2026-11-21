<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'
import { useRoute } from 'vue-router'
import Toast from '@/components/Toast.vue'

const cartStore = useCartStore()
const productsStore = useProductStore()
const route = useRoute()

const isScrolled = ref(false)
const updateScrolled = () => {
     isScrolled.value = window.scrollY > 10
}

onMounted(() => {
     updateScrolled()
     window.addEventListener('scroll', updateScrolled, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', updateScrolled))
</script>
<template>
     <div>
          <header class="navbar" :class="{ 'navbar--scrolled': isScrolled }">
               <nav class="nav-container" aria-label="Main">
                    <router-link to="/" class="nav-brand">Cartify</router-link>
                    <div v-if="route.name === 'home'" class="search-container"
                         :class="{ 'has-text': productsStore.searchQuery.length > 0 }">
                         <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                              aria-hidden="true">
                              <circle cx="11" cy="11" r="8"></circle>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                         </svg>
                         <input type="search" v-model="productsStore.searchQuery" placeholder="Search products..."
                              aria-label="Search products" class="expandable-input">
                    </div>
                    <router-link to="/cart" class="cart-link"
                         :aria-label="cartStore.totalItems > 0 ? `Cart, ${cartStore.totalItems} items` : 'Cart'">
                         Cart
                         <span v-if="cartStore.totalItems > 0" class="badge" aria-hidden="true">
                              {{ cartStore.totalItems }}
                         </span>
                    </router-link>
               </nav>
          </header>
          <main>
               <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                         <component :is="Component" />
                    </transition>
               </router-view>
          </main>
          <Toast />
     </div>
</template>
<style scoped>
main {
     margin: 8px 0;
}

.navbar {
     position: sticky;
     top: 0;
     z-index: 100;
     background-color: rgba(255, 255, 255, 0.75);
     backdrop-filter: blur(8px);
     border-bottom: 1px solid rgba(0, 0, 0, 0.05);
     transition: box-shadow 0.3s ease;
}

.navbar--scrolled {
     box-shadow: 0 1px 30px 0 rgb(31 49 78 / .24);
}

.nav-container {
     max-width: 1200px;
     margin: 0 auto;
     padding: 15px;
     display: flex;
     justify-content: space-between;
     align-items: center;
}

.nav-brand {
     color: #2c3e50;
     text-decoration: none;
     font-size: 1.3rem;
     font-weight: 800;
     letter-spacing: -0.5px;
}

.search-container {
     position: relative;
     display: flex;
     align-items: center;
     width: 40px;
     height: 40px;
     border-radius: 20px;
     transition: width 0.35s ease, background-color 0.3s, box-shadow 0.3s, border-color 0.3s;
     overflow: hidden;
     margin-right: 20px;
}

.search-container:hover,
.search-container:focus-within,
.search-container.has-text {
     width: 300px;
     background-color: white;
     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
     border: 1px solid #ccc;
}

.search-icon {
     position: absolute;
     left: 10px;
     width: 20px;
     height: 20px;
     color: #64748b;
     pointer-events: none;
     transition: color 0.3s;
}

.expandable-input {
     width: 100%;
     height: 100%;
     border: none;
     background: transparent;
     padding: 0 16px 0 40px;
     font-size: 0.95rem;
     color: #333;
     outline: none;
     opacity: 0;
     transition: opacity 0.3s;
}

.search-container:hover .expandable-input,
.search-container:focus-within .expandable-input,
.search-container.has-text .expandable-input {
     opacity: 1;
}

@media (max-width: 600px) {

     .search-container:hover,
     .search-container:focus-within,
     .search-container.has-text {
          width: 200px;
     }

     .nav-brand {
          margin-right: 20px;
     }
}

.cart-link {
     color: #2c3e50;
     text-decoration: none;
     font-size: 1.05rem;
     font-weight: 600;
     position: relative;
     padding: 10px;
     border-radius: 8px;
     transition: all 0.2s;
}

.cart-link:hover {
     color: #2ecc71;
     background-color: #e2e8f0;
}

.badge {
     position: absolute;
     top: -6px;
     right: -6px;
     background-color: #ef4444;
     color: white;
     font-size: 0.75rem;
     font-weight: 700;
     min-width: 22px;
     height: 22px;
     display: flex;
     align-items: center;
     justify-content: center;
     border-radius: 50%;
     border: 2px solid white;
     box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.fade-enter-active,
.fade-leave-active {
     transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
     opacity: 0;
}
</style>