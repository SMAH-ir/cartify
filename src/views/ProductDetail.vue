<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'

const route = useRoute()
const cartStore = useCartStore()
const productsStore = useProductStore()

// Loads the list once; if the user opened this page directly, it loads here.
productsStore.fetchProducts()

const product = computed(() => productsStore.getProductById(route.params.id))

watch(product, (current) => {
     if (current) document.title = `${current.title} | Cartify`
}, { immediate: true })
</script>
<template>
     <div class="container">
          <router-link to="/" class="back-link">&larr; Back to products</router-link>

          <div v-if="productsStore.loading" class="state-message">Loading product details...</div>
          <div v-else-if="productsStore.error" class="state-message error" role="alert">
               {{ productsStore.error }}
          </div>
          <div v-else-if="!product" class="state-message">Product not found.</div>
          <article v-else class="layout">
               <div class="image-container">
                    <img :src="product.thumbnail" :alt="product.title" class="product-image" />
               </div>
               <div class="product-info">
                    <span class="category">{{ product.category }}</span>
                    <h1 class="title">{{ product.title }}</h1>
                    <p class="price">${{ product.price }}</p>
                    <p class="description">{{ product.description }}</p>
                    <button type="button" @click="cartStore.addToCart(product)" class="add-to-cart-btn">
                         Add to Cart
                    </button>
               </div>
          </article>
     </div>
</template>
<style scoped>
.container {
     padding: 20px;
     max-width: 1000px;
     margin: 0 auto;
}

.back-link {
     display: inline-block;
     margin-bottom: 20px;
     color: #2b78a8;
     text-decoration: none;
     font-weight: 500;
}

.back-link:hover {
     text-decoration: underline;
}

.layout {
     display: grid;
     grid-template-columns: 1fr;
     gap: 40px;
     background: #fff;
     padding: 30px;
     border-radius: 12px;
     box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

@media (min-width: 768px) {
     .layout {
          grid-template-columns: 1fr 1fr;
     }
}

.product-image {
     width: 100%;
     border-radius: 8px;
     background-color: #f9f9f9;
     object-fit: contain;
     aspect-ratio: 1 / 1;
}

.category {
     display: inline-block;
     padding: 4px 12px;
     background-color: #eee;
     border-radius: 20px;
     font-size: 0.85rem;
     text-transform: uppercase;
     letter-spacing: 0.5px;
     color: #555;
     margin-bottom: 12px;
}

.title {
     font-size: 1.75rem;
     margin: 0 0 16px 0;
     color: #333;
}

.price {
     font-size: 1.2rem;
     font-weight: bold;
     color: #2c3e50;
     margin: 0 0 24px 0;
}

.description {
     font-size: 1.1rem;
     line-height: 1.6;
     color: #666;
}

.add-to-cart-btn {
     margin-top: 10px;
     padding: 10px 20px;
     background-color: #2ecc71;
     color: white;
     border: none;
     border-radius: 8px;
     font-weight: bold;
     cursor: pointer;
     transition: background-color 0.2s, transform 0.1s;
}

.add-to-cart-btn:hover {
     background-color: #27ae60;
}

.add-to-cart-btn:active {
     transform: scale(0.98);
}

.state-message {
     text-align: center;
     padding: 60px 20px;
     font-size: 1.2rem;
     color: #666;
}

.error {
     color: #dc3545;
}
</style>
