import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import Cart from '@/views/Cart.vue'
import NotFound from '@/views/NotFound.vue'

// Hash history (#/product/5) is used on purpose: GitHub Pages is a static host
// and can't serve deep links like /product/5 on page refresh.
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { title: 'Products' }
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: ProductDetail,
      meta: { title: 'Product' }
    },
    {
      path: '/cart',
      name: 'cart',
      component: Cart,
      meta: { title: 'Cart' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
      meta: { title: 'Page not found' }
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | Cartify` : 'Cartify'
})

export default router
