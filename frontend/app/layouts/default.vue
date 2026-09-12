<template>
  <!-- Desktop Layout Shell -->
  <!-- ใช้เป็น wrapper สำหรับทุกหน้าเมื่อ layout = 'default' (Desktop) -->
  <div class="desktop-shell">
    <!-- Desktop App Header (Slot ให้แต่ละหน้าสามารถ override ได้ในอนาคต) -->
    <AppHeader />

    <!-- Content Area -->
    <main class="desktop-shell__main">
      <slot />
    </main>
  </div>
</template>

<script setup>
import AppHeader from '~/components/desktop/AppHeader.vue'
</script>

<style scoped>
.desktop-shell {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f1f5f9;
}

.desktop-shell__main {
  flex: 1;
  min-height: 0;
  padding: 0;
  overflow: hidden;
}
</style>
