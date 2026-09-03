<template>
  <!-- Mobile Bottom Navigation -->
  <!-- Stub component: จะเชื่อมต่อ Router ในระยะต่อไป -->
  <nav class="bottom-nav">
    <button
      v-for="item in navItems"
      :key="item.id"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': item.id === activeTab }"
      @click="activeTab = item.id"
    >
      <span class="bottom-nav__icon">{{ item.icon }}</span>
      <span class="bottom-nav__label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
// Mobile Bottom Navigation Component
// จะเชื่อมต่อ useRouter() ในระยะต่อไป

const activeTab = ref('map')

const navItems = [
  { id: 'map',   icon: '🗺️', label: 'แผนที่' },
  { id: 'feed',  icon: '📋', label: 'ฟีด' },
  { id: 'report',icon: '📢', label: 'แจ้งเหตุ' },
  { id: 'notif', icon: '🔔', label: 'แจ้งเตือน' },
  { id: 'me',    icon: '👤', label: 'โปรไฟล์' },
]
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 64px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: stretch;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
}

.bottom-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #94a3b8;
  transition: color 0.15s ease;
  padding: 4px 0;
}

.bottom-nav__item:active {
  background: #f1f5f9;
}

.bottom-nav__item--active {
  color: #0284c7;
}

.bottom-nav__icon {
  font-size: 20px;
  line-height: 1;
}

.bottom-nav__label {
  font-size: 10px;
  font-weight: 500;
}
</style>
