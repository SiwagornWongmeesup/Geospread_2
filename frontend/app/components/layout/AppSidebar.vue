<script setup>
const route = useRoute();
const { t } = useLocale();

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle']);

const guideMenuOpen = ref(route.path === '/safety-guide');

const guideItems = [
  { id: 'flood' },
  { id: 'flash-flood' },
  { id: 'storm' },
  { id: 'wildfire' },
  { id: 'earthquake' },
  { id: 'tsunami' },
  { id: 'landslide' },
  { id: 'drought' }
];

const menuGroups = [
  {
    label: 'nav.groups.main',
    items: [
      { label: 'nav.home', to: '/', icon: '/icons/House.svg' },
      { label: 'nav.incidents', to: '/incidents', icon: '/icons/Alert.svg' },
      { label: 'nav.helpRequests', to: '/help-requests', icon: '/icons/Help.svg' }
    ]
  },
  {
    label: 'nav.groups.actions',
    kind: 'actions',
    items: [
      { label: 'nav.reportIncident', to: '/report-incident', icon: '/icons/Report.svg', tone: 'report' },
      { label: 'nav.requestHelp', to: '/request-help', icon: '/icons/Life-saving.svg', tone: 'help' }
    ]
  },
  {
    label: 'nav.groups.mine',
    items: [
      { label: 'nav.followedLocations', to: '/followed-locations', icon: '/icons/Location.svg' },
      { label: 'nav.notifications', to: '/notifications', icon: '/icons/Notification.svg', badge: '3' },
      { label: 'nav.safetyGuide', to: '/safety-guide', icon: '/icons/Safety-and-security.svg', kind: 'guide' }
    ]
  }
];

const accountItems = [
  { label: 'nav.profile', to: '/profile', icon: '/icons/User.svg' },
  { label: 'nav.settings', to: '/settings', icon: '/icons/Settings.svg' }
];
</script>

<template>
  <aside class="app-sidebar" :class="{ 'app-sidebar--collapsed': collapsed }">
    <!-- โลโก้อยู่บนสุดของ sidebar (ย้ายมาจาก header) ตอนพับจะเหลือแค่รูปโลโก้ -->
    <div class="app-sidebar__topbar">
      <NuxtLink to="/" class="app-sidebar__brand" :aria-label="t('brand.homeLink')">
        <img src="/logos/logo.png" alt="" class="app-sidebar__logo" />

        <span v-if="!collapsed" class="app-sidebar__brand-text">
          <span class="app-sidebar__brand-name">GeoSpread</span>
          <span class="app-sidebar__brand-tagline">{{ t('brand.tagline') }}</span>
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

    <nav class="app-sidebar__navigation" :aria-label="t('nav.navigation')">
      <section
        v-for="group in menuGroups"
        :key="group.label"
        class="app-sidebar__group"
        :class="{ 'app-sidebar__group--actions': group.kind === 'actions' }"
      >
        <h2 v-if="!collapsed" class="app-sidebar__group-title">
          {{ t(group.label) }}
        </h2>

        <template v-for="item in group.items" :key="item.to">
          <div v-if="item.kind === 'guide' && !collapsed" class="app-sidebar__guide-menu">
            <button
              type="button"
              class="app-sidebar__link app-sidebar__guide-toggle"
              :class="{ 'app-sidebar__link--guide-active': route.path === item.to }"
              :aria-expanded="guideMenuOpen"
              aria-controls="safety-guide-submenu"
              @click="guideMenuOpen = !guideMenuOpen"
            >
              <span class="app-sidebar__icon" aria-hidden="true">
                <img :src="item.icon" alt="" />
              </span>

              <span class="app-sidebar__link-label">{{ t(item.label) }}</span>

              <svg class="app-sidebar__guide-chevron" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7 9 5 5 5-5" />
              </svg>
            </button>

            <Transition name="guide-submenu">
              <div v-if="guideMenuOpen" id="safety-guide-submenu" class="app-sidebar__guide-submenu">
                <div class="app-sidebar__guide-submenu-content">
                  <NuxtLink
                    v-for="guide in guideItems"
                    :key="guide.id"
                    :to="{ path: '/safety-guide', hash: `#${guide.id}` }"
                    class="app-sidebar__guide-link"
                    :class="{ 'app-sidebar__guide-link--current': route.hash === `#${guide.id}` }"
                  >
                    <span class="app-sidebar__guide-dot" aria-hidden="true"></span>
                    <span>{{ t(`guideTopics.${guide.id}`) }}</span>
                  </NuxtLink>
                </div>
              </div>
            </Transition>
          </div>

          <NuxtLink
            v-else
            :to="item.to"
            class="app-sidebar__link"
            :class="[{ 'app-sidebar__link--action': group.kind === 'actions' }, item.tone && `app-sidebar__link--${item.tone}`]"
            :aria-label="t(item.label)"
            :title="collapsed ? t(item.label) : undefined"
          >
            <span class="app-sidebar__icon" aria-hidden="true">
              <img :src="item.icon" alt="" />
            </span>

            <span v-if="!collapsed" class="app-sidebar__link-label">
              {{ t(item.label) }}
            </span>

            <span v-if="item.badge" class="app-sidebar__badge">
              {{ item.badge }}
            </span>
          </NuxtLink>
        </template>
      </section>
    </nav>

    <div class="app-sidebar__account">
      <NuxtLink
        v-for="item in accountItems"
        :key="item.to"
        :to="item.to"
        class="app-sidebar__link"
        :aria-label="t(item.label)"
        :title="collapsed ? t(item.label) : undefined"
      >
        <span class="app-sidebar__icon" aria-hidden="true">
          <img :src="item.icon" alt="" />
        </span>

        <span v-if="!collapsed" class="app-sidebar__link-label">
          {{ t(item.label) }}
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

.app-sidebar__brand-tagline {
  margin-top: 2px;
  overflow: hidden;
  color: var(--gs-muted);
  font-size: 12px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  color: var(--gs-muted);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.app-sidebar__group--actions {
  gap: 0.35rem;
  padding: 0.75rem 0;
  border-top: 1px solid var(--gs-line);
  border-bottom: 1px solid var(--gs-line);
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
  border-radius: var(--gs-radius-sm);
  color: var(--gs-ink-2);
  font-size: 0.875rem;
  font-weight: 650;
  line-height: 1.2;
  text-decoration: none;
  transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease,
    box-shadow 160ms ease;
}

.app-sidebar__link:hover {
  background: var(--gs-action-tint);
  color: var(--gs-action);
}

.app-sidebar__link:focus-visible {
  outline: 3px solid rgb(29 53 87 / 30%);
  outline-offset: 2px;
}

.app-sidebar__link--action {
  border-color: var(--gs-line);
  background: var(--gs-surface);
  color: var(--gs-ink);
}

.app-sidebar__link--report:hover {
  border-color: #efc2c0;
  background: var(--gs-danger-tint);
  color: var(--gs-danger-hover);
}

.app-sidebar__link--help:hover {
  border-color: #b7d9d1;
  background: var(--gs-help-tint);
  color: var(--gs-help-hover);
}

.app-sidebar__guide-menu {
  display: grid;
  gap: 0.15rem;
}

.app-sidebar__guide-toggle {
  width: 100%;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.app-sidebar__link--guide-active {
  background: var(--gs-action-tint);
  color: var(--gs-action);
}

.app-sidebar__guide-chevron {
  width: 1.1rem;
  height: 1.1rem;
  margin-left: auto;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.app-sidebar__guide-toggle[aria-expanded='true'] .app-sidebar__guide-chevron {
  transform: rotate(180deg);
}

.app-sidebar__guide-submenu {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 220ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 180ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.app-sidebar__guide-submenu-content {
  display: grid;
  min-height: 0;
  gap: 0.1rem;
  overflow: hidden;
  padding: 0.1rem 0 0.25rem;
}

.app-sidebar__guide-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-height: 2rem;
  padding: 0.35rem 0.65rem 0.35rem 2.35rem;
  border-radius: 0.55rem;
  color: var(--gs-muted);
  font-size: 0.8rem;
  font-weight: 650;
  line-height: 1.25;
  text-decoration: none;
  transition: background-color 160ms ease, color 160ms ease;
}

.app-sidebar__guide-link:hover,
.app-sidebar__guide-link--current {
  background: var(--gs-action-tint);
  color: var(--gs-action);
}

.app-sidebar__guide-link:focus-visible {
  outline: 3px solid rgb(29 53 87 / 30%);
  outline-offset: 2px;
}

.app-sidebar__guide-dot {
  width: 0.42rem;
  height: 0.42rem;
  flex: 0 0 auto;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.72;
}

.guide-submenu-enter-from,
.guide-submenu-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
  transform: translateY(-0.35rem);
}

@media (prefers-reduced-motion: reduce) {
  .app-sidebar__guide-chevron,
  .app-sidebar__guide-submenu {
    transition: none;
  }
}

.app-sidebar__link.router-link-exact-active {
  border-color: var(--gs-action);
  background: var(--gs-action);
  color: #ffffff;

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
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.05)); /* เพิ่มมิติให้รูปดูชัดเจนขึ้นนิดหน่อย */
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
  background: var(--gs-danger);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1;
}

.app-sidebar__link.router-link-exact-active .app-sidebar__badge {
  border-color: var(--gs-action);
  background: var(--gs-surface);
  color: var(--gs-action);
}

.app-sidebar__account {
  display: grid;
  gap: 0.25rem;
  margin-top: auto;
  padding-top: 0.85rem;
  border-top: 1px solid var(--gs-line);
}

.app-sidebar--collapsed {
  align-items: stretch;
  padding-right: 0.65rem;
  padding-left: 0.65rem;
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
  font-size: 0.68rem;
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
