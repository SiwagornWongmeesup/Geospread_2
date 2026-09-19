<script setup>
defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle']);

const iconPaths = {
  home: 'M3 10.8 12 3l9 7.8v9.4a.8.8 0 0 1-.8.8H3.8a.8.8 0 0 1-.8-.8v-7.8Zm6 9.4v-5.3h6v5.3',
  map: 'M9 4 3.8 6.6v13.2L9 17.2l6 2.6 5.2-2.6V4L15 6.6 9 4Zm0 0v13.2m6-10.6v13.2',
  incidents: 'M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v14A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Zm3 4h4m-4 4h4m-4 4h2',
  helpRequests: 'M16.5 20.5v-1.3a4.2 4.2 0 0 0-4.2-4.2H7.2A4.2 4.2 0 0 0 3 19.2v1.3m6.7-9A3.2 3.2 0 1 0 9.7 5a3.2 3.2 0 0 0 0 6.5Zm7-5.2a3.1 3.1 0 0 1 0 5.9m3.4 8.3v-1.3a4.2 4.2 0 0 0-2.6-3.9',
  report: 'M12 21s6.8-6.1 6.8-11.5a6.8 6.8 0 1 0-13.6 0C5.2 14.9 12 21 12 21Zm0-13.8v4.1m0 3.1h.01',
  request: 'M12 20.5s-7.5-4.2-7.5-10.1A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.4c0 5.9-7.5 10.1-7.5 10.1ZM8.5 13h7m-3.5-3.5v7',
  followed: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z',
  notifications: 'M18 9.8a6 6 0 0 0-12 0c0 7-2.7 7.3-2.7 8.7h17.4c0-1.4-2.7-1.7-2.7-8.7ZM9.7 21h4.6',
  guide: 'M4 4.8c2.9-.8 5.7-.2 8 1.5 2.3-1.7 5.1-2.3 8-1.5v14.3c-2.9-.8-5.7-.2-8 1.5-2.3-1.7-5.1-2.3-8-1.5V4.8Zm8 1.5v14.3',
  profile: 'M19.5 20.5v-1.2a5 5 0 0 0-5-5h-5a5 5 0 0 0-5 5v1.2m7.5-9.7a3.7 3.7 0 1 0 0-7.4 3.7 3.7 0 0 0 0 7.4Z',
  settings: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm7.4-3.2a7.4 7.4 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.8-1L14.8 3h-5.6l-.3 2.1a8 8 0 0 0-1.8 1l-2.4-1-2 3.4 2 1.5a7.4 7.4 0 0 0-.1 1c0 .3 0 .7.1 1l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 1.8 1l.3 2.1h5.6l.3-2.1a8 8 0 0 0 1.8-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z'
};

const menuGroups = [
  {
    label: 'เมนูหลัก',
    items: [
      { label: 'หน้าหลัก', to: '/', icon: 'home' },
      { label: 'ดูเหตุการณ์', to: '/incidents', icon: 'incidents' },
      { label: 'ดูคำขอช่วยเหลือ', to: '/help-requests', icon: 'helpRequests' }
    ]
  },
  {
    label: 'การดำเนินการ',
    kind: 'actions',
    items: [
      { label: 'แจ้งเหตุใหม่', to: '/report-incident', icon: 'report' },
      { label: 'ขอความช่วยเหลือ', to: '/request-help', icon: 'request' }
    ]
  },
  {
    label: 'พื้นที่ของฉัน',
    items: [
      { label: 'พื้นที่ติดตาม', to: '/followed-locations', icon: 'followed' },
      { label: 'การแจ้งเตือน', to: '/notifications', icon: 'notifications', badge: '3' },
      { label: 'คู่มือความปลอดภัย', to: '/safety-guide', icon: 'guide' }
    ]
  }
];

const accountItems = [
  { label: 'โปรไฟล์', to: '/profile', icon: 'profile' },
  { label: 'ตั้งค่า', to: '/settings', icon: 'settings' }
];
</script>

<template>
  <aside class="app-sidebar" :class="{ 'app-sidebar--collapsed': collapsed }">
    <div class="app-sidebar__topbar">
      <span v-if="!collapsed" class="app-sidebar__label">เมนู</span>

      <button
        type="button"
        class="app-sidebar__toggle"
        :aria-label="collapsed ? 'ขยายแถบเมนู' : 'พับแถบเมนู'"
        :title="collapsed ? 'ขยายแถบเมนู' : 'พับแถบเมนู'"
        @click="emit('toggle')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
    </div>

    <nav class="app-sidebar__navigation" aria-label="เมนูนำทาง">
      <section
        v-for="group in menuGroups"
        :key="group.label"
        class="app-sidebar__group"
        :class="{ 'app-sidebar__group--actions': group.kind === 'actions' }"
      >
        <h2 v-if="!collapsed" class="app-sidebar__group-title">
          {{ group.label }}
        </h2>

        <NuxtLink
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="app-sidebar__link"
          :class="{ 'app-sidebar__link--action': group.kind === 'actions' }"
          :aria-label="item.label"
          :title="collapsed ? item.label : undefined"
        >
          <span class="app-sidebar__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path :d="iconPaths[item.icon]" />
            </svg>
          </span>

          <span v-if="!collapsed" class="app-sidebar__link-label">
            {{ item.label }}
          </span>

          <span v-if="item.badge" class="app-sidebar__badge">
            {{ item.badge }}
          </span>
        </NuxtLink>
      </section>
    </nav>

    <div class="app-sidebar__account">
      <NuxtLink
        v-for="item in accountItems"
        :key="item.to"
        :to="item.to"
        class="app-sidebar__link"
        :aria-label="item.label"
        :title="collapsed ? item.label : undefined"
      >
        <span class="app-sidebar__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path :d="iconPaths[item.icon]" />
          </svg>
        </span>

        <span v-if="!collapsed" class="app-sidebar__link-label">
          {{ item.label }}
        </span>
      </NuxtLink>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  display: flex;
  align-self: stretch;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  min-height: 0;
  padding: 1rem 0.75rem;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  border-right: 1px solid #dce5f2;
  background: #ffffff;
}

.app-sidebar__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 2.25rem;
  padding: 0 0.25rem 0 0.75rem;
}

.app-sidebar__label {
  color: #334e80;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.app-sidebar__toggle {
  display: grid;
  width: 2.1rem;
  height: 2.1rem;
  padding: 0;
  cursor: pointer;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 0.625rem;
  background: transparent;
  color: #264577;
}

.app-sidebar__toggle:hover {
  background: #edf5ff;
  color: #0876eb;
}

.app-sidebar__toggle:focus-visible {
  outline: 3px solid rgb(8 118 235 / 28%);
  outline-offset: 2px;
}

.app-sidebar__toggle svg {
  width: 1.25rem;
  height: 1.25rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
  transition: transform 180ms ease;
}

.app-sidebar__navigation {
  display: grid;
  gap: 1.25rem;
}

.app-sidebar__group {
  display: grid;
  gap: 0.25rem;
}

.app-sidebar__group-title {
  margin: 0 0 0.35rem;
  padding: 0 0.75rem;
  color: #7890ad;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.app-sidebar__group--actions {
  gap: 0.35rem;
  padding: 0.75rem 0;
  border-top: 1px solid #edf2f8;
  border-bottom: 1px solid #edf2f8;
}

.app-sidebar__group--actions .app-sidebar__group-title {
  margin-bottom: 0.2rem;
}

.app-sidebar__link {
  display: flex;
  position: relative;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.65rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 0.7rem;
  color: #183c75;
  font-size: 0.875rem;
  font-weight: 650;
  line-height: 1.2;
  text-decoration: none;
  transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease,
    box-shadow 160ms ease;
}

.app-sidebar__link:hover {
  background: #edf5ff;
  color: #0876eb;
}

.app-sidebar__link:focus-visible {
  outline: 3px solid rgb(8 118 235 / 28%);
  outline-offset: 2px;
}

.app-sidebar__link--action {
  border-color: #dcecff;
  background: #f7fbff;
  color: #0a67c7;
}

.app-sidebar__link--action:hover {
  border-color: #b8dcff;
  background: #eaf5ff;
  color: #0561be;
}

.app-sidebar__link.router-link-exact-active {
  border-color: #0876eb;
  background: #0876eb;
  color: #ffffff;
  box-shadow: 0 7px 14px rgb(8 118 235 / 18%);
}

.app-sidebar__icon {
  display: grid;
  flex: 0 0 auto;
  width: 1.25rem;
  height: 1.25rem;
  place-items: center;
}

.app-sidebar__icon svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.85;
}

.app-sidebar__link-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-sidebar__badge {
  display: grid;
  flex: 0 0 auto;
  min-width: 1.3rem;
  height: 1.3rem;
  margin-left: auto;
  padding: 0 0.24rem;
  place-items: center;
  border: 2px solid #ffffff;
  border-radius: 999px;
  background: #eb2631;
  color: #ffffff;
  font-size: 0.64rem;
  font-weight: 800;
  line-height: 1;
}

.app-sidebar__link.router-link-exact-active .app-sidebar__badge {
  border-color: #0876eb;
  background: #ffffff;
  color: #0876eb;
}

.app-sidebar__account {
  display: grid;
  gap: 0.25rem;
  margin-top: auto;
  padding-top: 0.85rem;
  border-top: 1px solid #dfe8f3;
}

.app-sidebar--collapsed {
  align-items: stretch;
  padding-right: 0.65rem;
  padding-left: 0.65rem;
}

.app-sidebar--collapsed .app-sidebar__topbar {
  justify-content: center;
  padding: 0;
}

.app-sidebar--collapsed .app-sidebar__toggle svg {
  transform: rotate(180deg);
}

.app-sidebar--collapsed .app-sidebar__navigation {
  gap: 1rem;
}

.app-sidebar--collapsed .app-sidebar__group {
  justify-items: center;
}

.app-sidebar--collapsed .app-sidebar__group--actions {
  width: 100%;
  padding: 0.7rem 0;
}

.app-sidebar--collapsed .app-sidebar__link {
  justify-content: center;
  width: 2.65rem;
  padding: 0.5rem;
}

.app-sidebar--collapsed .app-sidebar__badge {
  position: absolute;
  top: 0.15rem;
  right: 0.1rem;
  min-width: 1.15rem;
  height: 1.15rem;
  padding: 0;
  border-width: 1.5px;
  font-size: 0.58rem;
}

.app-sidebar--collapsed .app-sidebar__account {
  justify-items: center;
}

@media (max-width: 48rem) {
  .app-sidebar {
    gap: 0.75rem;
  }

  .app-sidebar__navigation {
    gap: 0.9rem;
  }

  .app-sidebar__link {
    min-height: 2.5rem;
  }
}
</style>
