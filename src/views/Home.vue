<script setup>
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'

const productsStore = useProductStore()
const cartStore = useCartStore()

productsStore.fetchProducts()
</script>
<template>
     <div class="container">
          <h1 class="visually-hidden">Products</h1>

          <div v-if="productsStore.loading" class="product-grid" aria-busy="true">
               <div v-for="n in 8" :key="n" class="product-card skeleton-card">
                    <div class="skeleton skeleton-img"></div>
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-price"></div>
                    <div class="skeleton skeleton-btn"></div>
               </div>
          </div>

          <div v-else-if="productsStore.error" class="state-message error" role="alert">
               <p>{{ productsStore.error }}</p>
               <button class="retry-btn" @click="productsStore.fetchProducts()">Try again</button>
          </div>

          <div v-else-if="productsStore.filteredProducts.length === 0" class="state-message">
               No products found.
          </div>

          <div v-else class="product-grid">
               <article v-for="product in productsStore.filteredProducts" :key="product.id" class="product-card">
                    <div class="card-visual">
                         <span class="category-badge">{{ product.category }}</span>
                         <img :src="product.thumbnail" alt="" width="220" height="220" loading="lazy"
                              class="product-image" />
                    </div>
                    <div class="card-details">
                         <div class="text-content">
                              <h2 class="product-title">
                                   <router-link :to="{ name: 'product-detail', params: { id: product.id } }"
                                        class="title-link">{{ product.title }}</router-link>
                              </h2>
                              <p class="product-meta">{{ product.brand || 'In Stock' }}</p>
                         </div>
                         <div class="price-action-row">
                              <span class="product-price">${{ product.price }}</span>
                              <button type="button" @click="cartStore.addToCart(product)" class="icon-btn"
                                   :aria-label="`Add ${product.title} to cart`">
                                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                                        stroke-linejoin="round" aria-hidden="true" focusable="false">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                   </svg>
                              </button>
                         </div>
                    </div>
               </article>
          </div>
     </div>
</template>
<style scoped>
.container {
     padding: 20px;
     max-width: 1200px;
     margin: 0 auto;
}

.product-grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
     gap: 20px;
}

.product-card {
     position: relative;
     display: flex;
     flex-direction: column;
     border-radius: 15px;
     transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
     border: 1px solid #ddd;
     height: 100%;
     padding: 0 10px;
}

.product-card:hover {
     transform: translateY(-8px);
     box-shadow: 0 24px 36px -12px rgba(15, 23, 42, 0.08);
}

.product-card:has(:focus-visible) {
     outline: 2px solid #3498db;
     outline-offset: 2px;
}

.card-visual {
     position: relative;
     width: 100%;
     aspect-ratio: 1 / 1;
     border-radius: 16px;
     overflow: hidden;
     display: flex;
     align-items: center;
     justify-content: center;
}

.product-image {
     width: 73%;
     height: 73%;
     object-fit: contain;
     transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
     mix-blend-mode: multiply;
     margin-top: 20px;
}

.category-badge {
     position: absolute;
     top: 10px;
     left: 0;
     background: rgba(255, 255, 255, 0.85);
     backdrop-filter: blur(4px);
     color: #475569;
     font-size: 0.7rem;
     font-weight: 700;
     text-transform: uppercase;
     letter-spacing: 0.5px;
     padding: 6px 10px;
     border-radius: 20px;
     z-index: 10;
     pointer-events: none;
}

.card-details {
     display: flex;
     flex-direction: column;
     flex-grow: 1;
     padding: 0 8px 8px 8px;
}

.text-content {
     margin-bottom: 16px;
     flex-grow: 1;
}

.product-title {
     font-size: 1.05rem;
     font-weight: 700;
     color: #0f172a;
     margin: 0 0 4px 0;
     display: -webkit-box;
     line-clamp: 2;
     -webkit-line-clamp: 2;
     -webkit-box-orient: vertical;
     overflow: hidden;
     line-height: 1.3;
}

/* The link stretches over the whole card, so the card stays fully clickable
   while the "add to cart" button remains a separate, valid control. */
.title-link {
     color: inherit;
     text-decoration: none;
}

.title-link::after {
     content: '';
     position: absolute;
     inset: 0;
     border-radius: 15px;
}

.product-meta {
     font-size: 0.85rem;
     color: #64748b;
     margin: 0;
     font-weight: 500;
}

.price-action-row {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-top: auto;
     margin-bottom: 10px;
}

.product-price {
     font-size: 1.2rem;
     font-weight: 700;
     color: #0f172a;
     letter-spacing: -0.5px;
}

.icon-btn {
     position: relative;
     z-index: 2;
     width: 40px;
     height: 40px;
     border-radius: 50%;
     background-color: #2ecc71;
     color: #ffffff;
     border: none;
     display: flex;
     align-items: center;
     justify-content: center;
     cursor: pointer;
     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-btn:hover {
     background-color: #27ae60;
     transform: scale(1.1) rotate(90deg);
     box-shadow: 0 8px 16px -4px rgba(46, 204, 113, 0.4);
}

.icon-btn:active {
     transform: scale(0.95);
}

.state-message {
     text-align: center;
     padding: 40px;
     font-size: 1.2rem;
     color: #666;
}

.error {
     color: #dc3545;
}

.retry-btn {
     margin-top: 16px;
     padding: 10px 20px;
     border: none;
     border-radius: 8px;
     background-color: #2ecc71;
     color: white;
     font-weight: bold;
     cursor: pointer;
}

.retry-btn:hover {
     background-color: #27ae60;
}

/* --- SKELETON STYLES --- */
.skeleton-card {
     border: 1px solid #eaeaea;
     box-shadow: none;
}

.skeleton {
     background: #f6f7f8;
     background: linear-gradient(110deg,
               #ececec 8%,
               #f5f5f5 18%,
               #ececec 33%);
     background-size: 200% 100%;
     animation: 1.5s shimmer linear infinite;
     border-radius: 4px;
}

.skeleton-img {
     width: 100%;
     aspect-ratio: 1 / 1;
     border-radius: 8px;
     margin-bottom: 16px;
}

.skeleton-title {
     height: 22px;
     width: 80%;
     margin-bottom: 8px;
}

.skeleton-price {
     height: 28px;
     width: 40%;
     margin-bottom: auto;
}

.skeleton-btn {
     height: 40px;
     width: 100%;
     border-radius: 6px;
     margin-top: 15px;
}

@keyframes shimmer {
     to {
          background-position-x: -200%;
     }
}
</style>
