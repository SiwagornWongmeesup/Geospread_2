<template>
  <!-- Mobile Layout Shell -->
  <!-- ใช้เป็น wrapper สำหรับทุกหน้าเมื่อ layout = 'mobile' -->
  <div class="mobile-shell">
    <!-- Content Area (Scrollable) -->
    <main class="mobile-shell__main">
      <slot />
    </main>

    <!-- Bottom Navigation (Fixed ด้านล่าง) -->
    <AppBottomNav />
  </div>
</template>

<script setup>
import AppBottomNav from '~/components/mobile/AppBottomNav.vue'
</script>

<style scoped>
.mobile-shell {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  overflow: hidden;
  /* เว้นพื้นที่ด้านล่างสำหรับ Bottom Nav และ safe area ของอุปกรณ์ */
  padding-bottom: calc(4.45rem + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.mobile-shell__main {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
