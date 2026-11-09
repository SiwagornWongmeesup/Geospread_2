<script setup>
// sidebar ของแอดมิน: หน้าตาเหมือน AppSidebar ของผู้ใช้ (โลโก้ + ปุ่มพับ + กลุ่มเมนู) แต่รายการเมนูเป็นของแอดมิน
import { adminMenuGroups, adminSystemItems } from '~/utils/adminNavMenu'

const NuxtLink = resolveComponent('NuxtLink')
const route = useRoute()
const { t } = useLocale()

defineProps({
  collapsed: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle'])

// รายการเมนูอยู่ที่ utils/adminNavMenu.js ใช้ร่วมกับแถบเมนูด้านล่างบนมือถือ
const menuGroups = adminMenuGroups
const systemItems = adminSystemItems

const isActive = (item) => Boolean(item.to) && route.path === item.to

// เมนูที่ยังไม่มีหน้า (ไม่มี to) แสดงเป็นปุ่ม disabled พร้อม tooltip "กำลังพัฒนา"
const itemTitle = (item, collapsed) => {
  if (!item.to) return collapsed ? `${t(item.label)} · ${t('common.inDevelopment')}` : t('common.inDevelopment')
  return collapsed ? t(item.label) : undefined
}
</script>

<template>
  <aside class="app-sidebar" :class="{ 'app-sidebar--collapsed': collapsed }" :aria-label="t('admin.menuLabel')">
    <div class="app-sidebar__topbar">
      <NuxtLink to="/admin" class="app-sidebar__brand" :aria-label="t('brand.homeLink')">
        <img src="/logos/logo.png" alt="" class="app-sidebar__logo" />
        <span v-if="!collapsed" class="app-sidebar__brand-text">
          <span class="app-sidebar__brand-name">GeoSpread</span>
          <span class="app-sidebar__brand-tag">{{ t('admin.menuTitle') }}</span>
        </span>
      </NuxtLink>

      <button
        type="button"
        class="app-sidebar__toggle"
        :aria-label="collapsed ? t('common.expandMenu') : t('common.collapseMenu')"
        :title="collapsed ? t('common.expandMenu') : t('common.collapseMenu')"
        @click="emit('toggle')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
    </div>

    <nav class="app-sidebar__navigation">
      <section v-for="group in menuGroups" :key="group.label" class="app-sidebar__group">
        <h2 v-if="!collapsed" class="app-sidebar__group-title">{{ t(group.label) }}</h2>

        <component
          :is="item.to ? NuxtLink : 'button'"
          v-for="item in group.items"
          :key="item.id"
          :to="item.to"
          :type="item.to ? undefined : 'button'"
          :disabled="item.to ? undefined : true"
          class="app-sidebar__link"
          :class="{ 'app-sidebar__link--active': isActive(item) }"
          :aria-current="isActive(item) ? 'page' : undefined"
          :aria-label="t(item.label)"
          :title="itemTitle(item, collapsed)"
        >
          <span class="app-sidebar__icon" aria-hidden="true"><img :src="item.icon" alt="" /></span>
          <span v-if="!collapsed" class="app-sidebar__link-label">{{ t(item.label) }}</span>
          <span v-if="item.badge" class="app-sidebar__badge">{{ item.badge }}</span>
        </component>
      </section>
    </nav>

    <!-- กลุ่ม "ระบบ" แสดงเมื่อมีเมนูจริงเท่านั้น -->
    <div v-if="systemItems.length" class="app-sidebar__account">
      <h2 v-if="!collapsed" class="app-sidebar__group-title">{{ t('admin.system') }}</h2>
      <component
        :is="item.to ? NuxtLink : 'button'"
        v-for="item in systemItems"
        :key="item.id"
        :to="item.to"
        :type="item.to ? undefined : 'button'"
        :disabled="item.to ? undefined : true"
        class="app-sidebar__link"
        :class="{ 'app-sidebar__link--active': isActive(item) }"
        :aria-label="t(item.label)"
        :title="itemTitle(item, collapsed)"
      >
        <span class="app-sidebar__icon" aria-hidden="true"><img :src="item.icon" alt="" /></span>
        <span v-if="!collapsed" class="app-sidebar__link-label">{{ t(item.label) }}</span>
      </component>
    </div>
  </aside>
</template>

<style scoped>
/* สไตล์เดียวกับ AppSidebar.vue (sidebar ของผู้ใช้) */
.app-sidebar {
  display: flex;
  align-self: stretch;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-height: 0;
  padding: 16px 12px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  border-right: 1px solid var(--gs-line);
  background: var(--gs-surface);
}

.app-sidebar__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 56px;
  padding: 0 4px 12px 4px;
  border-bottom: 1px solid var(--gs-line);
}

.app-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  text-decoration: none;
}

/* ไฟล์ logo.png มีพื้นที่ว่างรอบรูปเยอะ จึงต้องตั้งขนาดใหญ่กว่าที่เห็นจริง */
.app-sidebar__logo {
  width: 76px;
  height: 76px;
  margin: -14px -12px -14px -14px;
  flex: 0 0 auto;
  object-fit: contain;
}

.app-sidebar__brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.1;
}

.app-sidebar__brand-name {
  color: var(--gs-ink);
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.6px;
}

.app-sidebar__brand-tag {
  margin-top: 3px;
  overflow: hidden;
  color: var(--gs-muted);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-sidebar__toggle {
  display: grid;
  width: 34px;
  height: 34px;
  padding: 0;
  cursor: pointer;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--gs-ink-2);
}

.app-sidebar__toggle:hover {
  background: var(--gs-action-tint);
  color: var(--gs-action);
}

.app-sidebar__toggle:focus-visible {
  outline: 3px solid rgb(29 53 87 / 30%);
  outline-offset: 2px;
}

.app-sidebar__toggle svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
  transition: transform 180ms ease;
}

.app-sidebar__navigation {
  display: grid;
  gap: 20px;
}

.app-sidebar__group {
  display: grid;
  gap: 4px;
}

.app-sidebar__group-title {
  margin: 0 0 6px;
  padding: 0 12px;
  color: var(--gs-muted);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.app-sidebar__link {
  display: flex;
  position: relative;
  width: 100%;
  align-items: center;
  gap: 12px;
  min-height: 42px;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: var(--gs-radius-sm);
  background: transparent;
  color: var(--gs-ink-2);
  font: inherit;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.2;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease,
    box-shadow 160ms ease;
}

.app-sidebar__link:hover:not(:disabled) {
  background: var(--gs-action-tint);
  color: var(--gs-action);
}

.app-sidebar__link:focus-visible {
  outline: 3px solid rgb(29 53 87 / 30%);
  outline-offset: 2px;
}

.app-sidebar__link:disabled {
  cursor: not-allowed;
  opacity: 0.46;
}

.app-sidebar__link--active,
.app-sidebar__link--active:hover:not(:disabled) {
  border-color: var(--gs-action);
  background: var(--gs-action);
  color: #ffffff;
}

.app-sidebar__link--active .app-sidebar__icon img {
  filter: brightness(0) invert(1);
}

.app-sidebar__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
}

.app-sidebar__icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05));
}

.app-sidebar__link-label {
  overflow: hidden;
  /* บรรทัดสูง 1.45 เท่า ให้วรรณยุกต์ไทยด้านบน/ล่างไม่โดนตัด */
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-sidebar__badge {
  display: grid;
  flex: 0 0 auto;
  min-width: 21px;
  height: 21px;
  margin-left: auto;
  padding: 0 4px;
  place-items: center;
  border: 2px solid #ffffff;
  border-radius: 999px;
  background: var(--gs-danger);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
}

.app-sidebar__account {
  display: grid;
  gap: 4px;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--gs-line);
}

.app-sidebar--collapsed {
  align-items: stretch;
  padding-right: 10px;
  padding-left: 10px;
}

/* ตอนพับ: วางโลโก้กับปุ่มขยายเรียงลงมา เพราะความกว้างไม่พอวางข้างกัน */
.app-sidebar--collapsed .app-sidebar__topbar {
  flex-direction: column;
  justify-content: center;
  padding: 0 0 12px;
}

.app-sidebar--collapsed .app-sidebar__logo {
  width: 56px;
  height: 56px;
  margin: -6px 0;
}

.app-sidebar--collapsed .app-sidebar__toggle svg {
  transform: rotate(180deg);
}

.app-sidebar--collapsed .app-sidebar__navigation {
  gap: 16px;
}

.app-sidebar--collapsed .app-sidebar__group,
.app-sidebar--collapsed .app-sidebar__account {
  justify-items: center;
}

.app-sidebar--collapsed .app-sidebar__link {
  justify-content: center;
  width: 42px;
  padding: 8px;
}

.app-sidebar--collapsed .app-sidebar__badge {
  position: absolute;
  top: 2px;
  right: 1.6px;
  min-width: 18px;
  height: 18px;
  padding: 0;
  border-width: 1.5px;
  font-size: 11px;
}

@media (max-width: 768px) {
  .app-sidebar {
    gap: 12px;
  }

  .app-sidebar__navigation {
    gap: 14px;
  }

  .app-sidebar__link {
    min-height: 40px;
  }

}
</style>
