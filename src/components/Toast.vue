<script setup>
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
</script>
<template>
     <!-- The live region always exists so screen readers announce the message when it appears. -->
     <div role="status" aria-live="polite">
          <Transition name="slide-up">
               <div v-if="toastStore.isVisible" class="toast" :class="{ 'toast--error': toastStore.type === 'error' }">
                    <span class="icon" aria-hidden="true">{{ toastStore.type === 'error' ? '!' : '✓' }}</span>
                    <span class="message">{{ toastStore.message }}</span>
                    <button v-if="toastStore.action" type="button" class="toast-action"
                         @click="toastStore.runAction()">
                         {{ toastStore.action.label }}
                    </button>
               </div>
          </Transition>
     </div>
</template>
<style scoped>
.toast {
     position: fixed;
     bottom: 30px;
     right: 30px;
     background-color: #1e293b;
     color: #f8fafc;
     padding: 14px 20px;
     border-radius: 10px;
     box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
     font-weight: 500;
     font-size: 0.95rem;
     display: flex;
     align-items: center;
     gap: 12px;
     z-index: 1000;
     max-width: 400px;
}

.icon {
     background-color: #10b981;
     color: white;
     border-radius: 50%;
     width: 22px;
     height: 22px;
     flex-shrink: 0;
     display: flex;
     align-items: center;
     justify-content: center;
     font-size: 0.8rem;
     font-weight: bold;
}

.toast--error .icon {
     background-color: #ef4444;
}

.toast-action {
     margin-left: 4px;
     padding: 4px 12px;
     background: transparent;
     color: #f8fafc;
     border: 1px solid #94a3b8;
     border-radius: 6px;
     font-weight: 600;
     cursor: pointer;
     transition: background-color 0.2s;
}

.toast-action:hover {
     background-color: #334155;
}

@media (max-width: 600px) {
     .toast {
          bottom: 20px;
          left: 20px;
          right: 20px;
          width: auto;
          max-width: none;
          justify-content: center;
     }
}

.slide-up-enter-active,
.slide-up-leave-active {
     transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.slide-up-enter-from,
.slide-up-leave-to {
     opacity: 0;
     transform: translateY(40px) scale(0.9);
}
</style>
