<script setup>
import DesktopView from '~/components/views/index/Desktop.vue'
import MobileView from '~/components/views/index/Mobile.vue'
import { useAuth } from '../composables/useAuth'

definePageMeta({
  showRightPanel: true,
  // ใช้ Middleware ดักตั้งแต่ก่อนเรนเดอร์หน้า (ป้องกัน Layout ซ้อนกัน)
  middleware: [
    function (to, from) {
      const { isAdmin } = useAuth()
      if (isAdmin.value) {
        return navigateTo('/admin')
      }
    }
  ]
})

// This page is the smart controller for the map. Incident fetching and report
// handlers belong here once the planned /incidents endpoint is implemented.
const { isMobile } = useResponsiveView({ syncLayout: true })

</script>

<template>
  <!-- ไม่ต้องใช้ Loading state แล้ว เพราะ Middleware จะจัดการโยนไปหน้า Admin ตั้งแต่ยังไม่ทันโหลด UI -->
  <MobileView v-if="isMobile" />
  <DesktopView v-else />
</template>

<style scoped>
.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f4f8fc;
  color: #112c66;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(20, 121, 239, 0.2);
  border-top-color: #1479ef;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
