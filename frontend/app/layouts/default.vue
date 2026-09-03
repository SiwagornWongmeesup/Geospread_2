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

<script setup lang="ts">
import AppHeader from '~/components/desktop/AppHeader.vue'
</script>

<style scoped>
.desktop-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f1f5f9;
}

.desktop-shell__main {
  flex: 1;
  padding: 0;
}
</style>
