import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', () => {
     const message = ref('')
     const type = ref('success')
     const action = ref(null) // optional { label, handler }, e.g. an "Undo" button
     const isVisible = ref(false)
     let timeout = null

     const hideToast = () => {
          isVisible.value = false
          if (timeout) {
               clearTimeout(timeout)
               timeout = null
          }
     }

     const showToast = (text, toastType = 'success', toastAction = null) => {
          message.value = text
          type.value = toastType
          action.value = toastAction
          isVisible.value = true

          if (timeout) clearTimeout(timeout)

          // Toasts with an action stay longer so there is time to click it.
          timeout = setTimeout(hideToast, toastAction ? 6000 : 3000)
     }

     const runAction = () => {
          const current = action.value
          hideToast()
          current?.handler()
     }

     return { message, type, action, isVisible, showToast, hideToast, runAction }
})
