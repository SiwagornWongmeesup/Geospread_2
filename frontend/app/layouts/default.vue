<template>
  <!-- Desktop Layout Shell -->
  <!-- ใช้เป็น wrapper สำหรับทุกหน้าเมื่อ layout = 'default' (Desktop) -->
  <!-- แบ่งเป็น 2 คอลัมน์: ซ้ายคือ sidebar สูงเต็มจอ (มีโลโก้ด้านบน), ขวาคือ header + เนื้อหา -->
  <div
    class="desktop-shell"
    :class="{ 'desktop-shell--sidebar-collapsed': isSidebarCollapsed }"
  >
    <AppSidebar :collapsed="isSidebarCollapsed" @toggle="toggleSidebar" />

    <div class="desktop-shell__content">
      <AppHeader />

      <div
        class="desktop-shell__body"
        :class="{ 'desktop-shell__body--with-right-panel': showRightPanel }"
      >
        <main class="desktop-shell__main">
          <slot />
        </main>

        <AppRightPanel v-if="showRightPanel" class="desktop-shell__right-panel" />
      </div>
    </div>

    <!-- เมนูด้านล่างสำหรับจอมือถือ: CSS ด้านล่างจะแสดงเฉพาะตอนจอแคบ (ตอนที่ sidebar ถูกซ่อน) -->
    <AppBottomNav class="desktop-shell__bottom-nav" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import AppRightPanel from '~/components/layout/AppRightPanel.vue'
import AppSidebar from '~/components/layout/AppSidebar.vue'
import AppBottomNav from '~/components/mobile/AppBottomNav.vue'

const route = useRoute()
const isSidebarCollapsed = ref(false)
const showRightPanel = computed(() => route.meta.showRightPanel === true)

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}
</script>

<style scoped>
.desktop-shell {
  --sidebar-width: 264px;
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  height: 100vh;
  overflow: hidden;
  background-color: var(--gs-paper);
  transition: grid-template-columns 180ms ease;
}

.desktop-shell--sidebar-collapsed {
  --sidebar-width: 80px;
}

/* คอลัมน์ขวา: header อยู่บน เนื้อหาอยู่ล่าง */
.desktop-shell__content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.desktop-shell__body {
  flex: 1;
  display: grid;
  min-height: 0;
  grid-template-columns: minmax(0, 1fr);
  overflow: hidden;
}

.desktop-shell__body--with-right-panel {
  grid-template-columns: minmax(0, 1fr) minmax(288px, 336px);
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

/* จอคอม: ซ่อนเมนูด้านล่าง เพราะมี sidebar อยู่แล้ว
   (เขียนเป็น .desktop-shell > ... ให้ชนะ display ที่ AppBottomNav ตั้งไว้เอง) */
.desktop-shell > .desktop-shell__bottom-nav {
  display: none;
}

@media (max-width: 58rem) {
  .desktop-shell__body--with-right-panel {
    grid-template-columns: minmax(0, 1fr);
  }

  .desktop-shell__right-panel {
    display: none;
  }
}

@media (max-width: 48rem) {
  .desktop-shell,
  .desktop-shell--sidebar-collapsed {
    grid-template-columns: minmax(0, 1fr);
  }

  /* จอมือถือ: ไม่แสดง sidebar และ header ใช้เมนูด้านล่างแทน */
  .desktop-shell > :deep(.app-sidebar),
  .desktop-shell__content > :deep(.app-header) {
    display: none;
  }

  /* จอมือถือ: sidebar ถูกซ่อน จึงแสดงเมนูด้านล่างแทน */
  .desktop-shell > .desktop-shell__bottom-nav {
    display: grid;
  }

  /* เว้นที่ด้านล่างให้เนื้อหา ไม่ให้ถูกเมนูด้านล่างบัง (ความสูงเท่ากับเมนู) */
  .desktop-shell__main {
    padding-bottom: calc(4.45rem + env(safe-area-inset-bottom));
  }
}
</style>
