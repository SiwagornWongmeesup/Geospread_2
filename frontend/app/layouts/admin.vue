<script setup>
// Layout ของแอดมิน: โครงเดียวกับ layouts/default.vue (sidebar สูงเต็มจอ + header การ์ด + เนื้อหา)
// ต่างกันแค่รายการเมนูใน sidebar (AdminSidebar) และบนมือถือใช้ AdminBottomNav แทน sidebar
import { useState } from '#app'
import AppHeader from '~/components/layout/AppHeader.vue'
import AdminSidebar from '~/components/layout/AdminSidebar.vue'
import AdminBottomNav from '~/components/mobile/AdminBottomNav.vue'

const sidebarCollapsed = useState('adminSidebarCollapsed', () => false)
</script>

<template>
  <div class="admin-shell" :class="{ 'admin-shell--sidebar-collapsed': sidebarCollapsed }">
    <AdminSidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />

    <div class="admin-shell__content">
      <AppHeader />
      <main class="admin-shell__main">
        <div class="admin-shell__inner"><slot /></div>
      </main>
    </div>

    <!-- มือถือ: ไม่แสดง sidebar ใช้แถบเมนูด้านล่างแทน (CSS ด้านล่างแสดงเฉพาะจอแคบ) -->
    <AdminBottomNav class="admin-shell__bottom-nav" />
  </div>
</template>

<style scoped>
:global(*) { box-sizing: border-box }
:global(button), :global(input) { font: inherit }

.admin-shell {
  --sidebar-width: 264px;
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  height: 100vh;
  /* มือถือ: ความสูงจริงของจอ ไม่รวมแถบที่อยู่ของเบราว์เซอร์ (ไม่งั้นเมนูล่างโดนบัง) */
  height: 100dvh;
  overflow: hidden;
  background-color: var(--gs-paper);
  transition: grid-template-columns 180ms ease;
}

.admin-shell--sidebar-collapsed {
  --sidebar-width: 80px;
}

.admin-shell__content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.admin-shell__main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
}

.admin-shell__inner {
  width: min(100% - 32px, 1600px);
  margin: 0 auto;
  padding: 0 0 32px;
}

/* จอคอม: ซ่อนเมนูด้านล่าง เพราะมี sidebar อยู่แล้ว
   (เขียนเป็น .admin-shell > ... ให้ชนะ display ที่ AdminBottomNav ตั้งไว้เอง) */
.admin-shell > .admin-shell__bottom-nav {
  display: none;
}

/* มือถือ: ไม่แสดง sidebar ใช้แถบเมนูด้านล่างแทน */
@media (max-width: 768px) {
  .admin-shell,
  .admin-shell--sidebar-collapsed {
    grid-template-columns: minmax(0, 1fr);
  }

  .admin-shell > :deep(.app-sidebar) {
    display: none;
  }

  .admin-shell > .admin-shell__bottom-nav {
    display: grid;
  }

  /* เว้นที่ด้านล่างให้เนื้อหา ไม่ให้ถูกเมนูด้านล่างบัง (ความสูงเท่ากับเมนู) */
  .admin-shell__main {
    padding-bottom: calc(71px + env(safe-area-inset-bottom));
  }

  .admin-shell__inner {
    width: min(100% - 16px, 1600px);
  }

  /* header บนจอเล็ก: ซ่อนช่องค้นหาและลดระยะขอบ ไม่ให้ปุ่มล้นจอ */
  .admin-shell__content > :deep(.app-header) {
    gap: 8px;
    margin: 8px;
    padding: 0 8px 0 12px;
  }

  .admin-shell__content > :deep(.app-header) .app-header__search {
    display: none;
  }

  .admin-shell__content > :deep(.app-header) .app-header__title {
    font-size: 17px;
  }
}
</style>
