<template>
  <!-- Desktop Layout Shell -->
  <!-- ใช้เป็น wrapper สำหรับทุกหน้าเมื่อ layout = 'default' (Desktop) -->
  <div class="desktop-shell">
    <!-- Desktop App Header (Slot ให้แต่ละหน้าสามารถ override ได้ในอนาคต) -->
    <AppHeader />

  <div
    class="desktop-shell__body"
    :class="{
      'desktop-shell__body--sidebar-collapsed': isSidebarCollapsed,
      'desktop-shell__body--with-right-panel': showRightPanel
    }"
  >
    <AppSidebar :collapsed="isSidebarCollapsed" @toggle="toggleSidebar" />

      <main class="desktop-shell__main">
        <slot />
      </main>

      <AppRightPanel v-if="showRightPanel" class="desktop-shell__right-panel" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import AppRightPanel from '~/components/layout/AppRightPanel.vue'
import AppSidebar from '~/components/layout/AppSidebar.vue'

const route = useRoute()
const isSidebarCollapsed = ref(false)
const showRightPanel = computed(() => route.meta.showRightPanel === true)

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}
</script>

<style scoped>
.desktop-shell {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f1f5f9;
}

.desktop-shell__body {
  --sidebar-width: 16.5rem;

  flex: 1;
  display: grid;
  min-height: 0;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  overflow: hidden;
  transition: grid-template-columns 180ms ease;
}

.desktop-shell__body--sidebar-collapsed {
  --sidebar-width: 5rem;
}

.desktop-shell__body--with-right-panel {
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr) minmax(18rem, 21rem);
}

.desktop-shell__main {
  min-width: 0;
  min-height: 0;
  overflow: auto;
}

.desktop-shell__right-panel {
  min-width: 0;
  border-left: 1px solid #dce5f2;
  background: #ffffff;
  overflow: auto;
}

@media (max-width: 70rem) {
  .desktop-shell__body--with-right-panel {
    grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  }

  .desktop-shell__right-panel {
    display: none;
  }
}

@media (max-width: 48rem) {
  .desktop-shell__body {
    --sidebar-width: 5rem;
  }
}
</style>
