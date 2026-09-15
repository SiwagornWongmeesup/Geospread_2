<script setup>
defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle']);

const navigationItems = [
  { label: 'หน้าหลัก', to: '/' },
  { label: 'เหตุการณ์', to: '/incidents' },
  { label: 'คำขอความช่วยเหลือ', to: '/help-requests' },
  { label: 'แจ้งเหตุ', to: '/report-incident', emphasis: true },
  { label: 'พื้นที่ที่ติดตาม', to: '/followed-locations' },
  { label: 'การแจ้งเตือน', to: '/notifications' },
  { label: 'คู่มือความปลอดภัย', to: '/safety-guide' },
  { label: 'โปรไฟล์', to: '/profile' },
  { label: 'ตั้งค่า', to: '/settings' }
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
        @click="emit('toggle')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
    </div>

    <nav class="app-sidebar__navigation" aria-label="เมนูหลัก">
      <NuxtLink
        v-for="item in navigationItems"
        :key="item.to"
        :to="item.to"
        class="app-sidebar__link"
        :class="{ 'app-sidebar__link--emphasis': item.emphasis }"
        :aria-label="item.label"
      >
        <span v-if="!collapsed">{{ item.label }}</span>
        <span v-else class="app-sidebar__compact-label" aria-hidden="true">
          {{ item.label.slice(0, 1) }}
        </span>
      </NuxtLink>
    </nav>
  </aside>
</template>

<style scoped>
.app-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0.75rem;
  border-right: 1px solid #dce5f2;
  background: #ffffff;
  overflow: hidden;
}

.app-sidebar__topbar {
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.25rem 0 0.75rem;
}

.app-sidebar__label {
  color: #60718c;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.app-sidebar__toggle {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid #cfdaea;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #234978;
  cursor: pointer;
}

.app-sidebar__toggle:hover,
.app-sidebar__toggle:focus-visible {
  outline: none;
  border-color: #0a53b7;
  background: #eaf2ff;
}

.app-sidebar__toggle svg {
  width: 1.125rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.app-sidebar--collapsed .app-sidebar__toggle svg {
  transform: rotate(180deg);
}

.app-sidebar__navigation {
  display: grid;
  gap: 0.25rem;
}

.app-sidebar__link {
  min-height: 2.75rem;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 0.625rem;
  color: #3e587a;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25;
  text-decoration: none;
}

.app-sidebar__link:hover,
.app-sidebar__link:focus-visible,
.app-sidebar__link.router-link-exact-active {
  outline: none;
  background: #eaf2ff;
  color: #063d90;
}

.app-sidebar__link--emphasis {
  margin-top: 0.5rem;
  background: #0a53b7;
  color: #ffffff;
}

.app-sidebar__link--emphasis:hover,
.app-sidebar__link--emphasis:focus-visible,
.app-sidebar__link--emphasis.router-link-exact-active {
  background: #063d90;
  color: #ffffff;
}

.app-sidebar--collapsed .app-sidebar__topbar {
  justify-content: center;
  padding: 0;
}

.app-sidebar--collapsed .app-sidebar__link {
  justify-content: center;
  padding: 0.5rem;
}

.app-sidebar__compact-label {
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.375rem;
  font-size: 0.7rem;
}
</style>
