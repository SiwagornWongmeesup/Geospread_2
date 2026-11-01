<script setup>
import { useRoute, useState } from '#app'

const sidebarCollapsed = useState('adminSidebarCollapsed', () => false)
const route = useRoute()
const { t } = useLocale()

const menus = [
  // [id, key ข้อความ, ไอคอน, badge]
  ['dashboard', 'admin.menu.dashboard', '/icons/Chart.svg'], ['incidents', 'admin.menu.incidents', '/icons/Report.svg'],
  ['requests', 'admin.menu.requests', '/icons/Help.svg'], ['events', 'admin.menu.events', '/icons/Calendar.svg'],
  ['users', 'admin.menu.users', '/icons/Users.svg'], ['guides', 'admin.menu.guides', '/icons/Alert.svg'],
  ['analytics', 'admin.menu.analytics', '/icons/Analysis.svg'], ['notifications', 'admin.menu.notifications', '/icons/Notification.svg', 3],
  ['settings', 'admin.menu.settings', '/icons/Settings.svg'],
]
const menuGroups = [
  { label: 'admin.groups.overview', items: [menus[0]] },
  { label: 'admin.groups.community', items: menus.slice(1, 5) },
  { label: 'admin.groups.dataSafety', items: menus.slice(5, 8) },
]
const systemItems = [menus[8]]

const menuRoutes = { dashboard: '/admin', incidents: '/admin/incidents', users: '/admin/users' }
const isUnavailableMenu = (id) => !menuRoutes[id]
const isActiveMenu = (id) => route.path === menuRoutes[id]
const selectMenu = ([id]) => {
  if (menuRoutes[id]) void navigateTo(menuRoutes[id])
}
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': sidebarCollapsed }" :aria-label="t('admin.menuLabel')">
    <div class="sidebar-head">
      <span v-if="!sidebarCollapsed" class="sidebar-label">{{ t('admin.menuTitle') }}</span>
      <button class="sidebar-toggle" type="button" :aria-label="sidebarCollapsed ? t('common.expandMenu') : t('common.collapseMenu')"
        :title="sidebarCollapsed ? t('common.expandMenu') : t('common.collapseMenu')" @click="sidebarCollapsed = !sidebarCollapsed">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
    </div>
    <nav>
      <section v-for="group in menuGroups" :key="group.label" class="menu-group">
        <h2 v-if="!sidebarCollapsed">{{ t(group.label) }}</h2>
        <button v-for="menu in group.items" :key="menu[0]" type="button" :class="{ active: isActiveMenu(menu[0]) }"
          :aria-current="isActiveMenu(menu[0]) ? 'page' : undefined" :disabled="isUnavailableMenu(menu[0])"
          :title="sidebarCollapsed ? t(menu[1]) : (isUnavailableMenu(menu[0]) ? t('common.inDevelopment') : undefined)"
          @click="selectMenu(menu)">
          <img :src="menu[2]" alt=""><span v-if="!sidebarCollapsed">{{ t(menu[1]) }}</span><b v-if="menu[3]">{{ menu[3]
            }}</b>
        </button>
      </section>
    </nav>
    <section class="sidebar-system">
      <h2 v-if="!sidebarCollapsed">{{ t('admin.system') }}</h2>
      <button v-for="menu in systemItems" :key="menu[0]" type="button" :class="{ active: isActiveMenu(menu[0]) }"
        :aria-current="isActiveMenu(menu[0]) ? 'page' : undefined" :disabled="isUnavailableMenu(menu[0])"
        :title="sidebarCollapsed ? t(menu[1]) : t('common.inDevelopment')" @click="selectMenu(menu)">
        <img :src="menu[2]" alt=""><span v-if="!sidebarCollapsed">{{ t(menu[1]) }}</span>
      </button>
    </section>
  </aside>
</template>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  display: flex;
  height: 100vh;
  flex-direction: column;
  padding: 1rem .85rem;
  border-right: 1px solid #dce8f5;
  background: #fff;
  overflow-y: auto
}

.admin-label {
  display: flex;
  align-items: center;
  gap: .6rem;
  margin: 0 0 .65rem;
  padding: .7rem;
  border-radius: .5rem;
  background: #e8f2ff;
  color: #176bd0;
  font-size: .78rem;
  font-weight: 800
}

.admin-label img {
  width: 1.15rem;
  height: 1.15rem
}

.sidebar nav {
  display: grid;
  gap: .2rem
}

.sidebar nav button {
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  gap: .8rem;
  min-height: 2.55rem;
  padding: 0 .72rem;
  border: 0;
  border-radius: .5rem;
  background: transparent;
  color: #18347b;
  font-size: .84rem;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  transition: .18s
}

.sidebar nav button img {
  width: 18px;
  height: 18px;
  opacity: .78
}

.sidebar nav button:hover {
  background: #eef6ff;
  color: #086ce4
}

.sidebar nav button.active {
  background: #1479ef;
  color: #fff;
  box-shadow: 0 8px 18px rgb(20 121 239 / 22%)
}

.sidebar nav button.active img {
  filter: brightness(0) invert(1);
  opacity: 1
}

.sidebar nav b {
  display: grid;
  min-width: 1.28rem;
  height: 1.28rem;
  place-items: center;
  margin-left: auto;
  border-radius: 999px;
  background: #e91f28;
  color: #fff;
  font-size: .66rem
}

.sidebar nav button:disabled {
  cursor: not-allowed;
  opacity: .46
}

.sidebar nav button:disabled:hover {
  background: transparent;
  color: #18347b
}

.sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 2.25rem;
  gap: .35rem;
  margin: 0 0 .55rem;
  padding: 0 .25rem 0 .75rem
}

.sidebar-label {
  color: #334e80;
  font-size: .78rem;
  font-weight: 800;
  letter-spacing: .04em
}

.sidebar-toggle {
  display: grid;
  width: 2.1rem;
  height: 2.1rem;
  flex: 0 0 auto;
  place-items: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: .625rem;
  background: transparent;
  color: #264577;
  cursor: pointer
}

.sidebar-toggle:hover {
  background: #edf5ff;
  color: #0876eb
}

.sidebar-toggle:focus-visible {
  outline: 3px solid rgb(8 118 235 / 28%);
  outline-offset: 2px
}

.sidebar-toggle svg {
  width: 1.25rem;
  height: 1.25rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
  transition: transform 180ms ease
}

.menu-group {
  display: grid;
  gap: .2rem
}

.menu-group+h2 {
  margin-top: .2rem
}

.menu-group+.menu-group {
  margin-top: .8rem;
  padding-top: .75rem;
  border-top: 1px solid #edf2f8
}

.menu-group h2 {
  margin: 0 0 .2rem;
  padding: 0 .72rem;
  color: #7288aa;
  font-size: .62rem;
  font-weight: 800;
  letter-spacing: .04em
}

.sidebar--collapsed {
  align-items: stretch;
  padding-right: .55rem;
  padding-left: .55rem
}

.sidebar--collapsed .sidebar-head {
  justify-content: center;
  padding: 0
}

.sidebar--collapsed .brand img {
  width: 2.4rem;
  height: 2.4rem
}

.sidebar--collapsed .sidebar-toggle svg {
  transform: rotate(180deg)
}

.sidebar--collapsed nav {
  gap: .85rem
}

.sidebar--collapsed .menu-group {
  justify-items: center
}

.sidebar--collapsed .menu-group+.menu-group {
  width: 100%;
  margin-top: 0;
  padding-top: .7rem
}

.sidebar--collapsed nav button {
  justify-content: center;
  width: 2.65rem;
  padding: 0
}

.sidebar--collapsed nav b {
  position: absolute;
  top: .08rem;
  right: .05rem;
  margin: 0
}

.sidebar-system {
  display: grid;
  gap: .25rem;
  margin-top: auto;
  padding-top: .85rem;
  border-top: 1px solid #dfe8f3
}

.sidebar-system h2 {
  margin: 0 0 .1rem;
  padding: 0 .72rem;
  color: #7288aa;
  font-size: .62rem;
  font-weight: 800;
  letter-spacing: .04em
}

.sidebar-system button {
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  gap: .8rem;
  min-height: 2.55rem;
  padding: 0 .72rem;
  border: 0;
  border-radius: .5rem;
  background: transparent;
  color: #18347b;
  font-size: .84rem;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  transition: .18s
}

.sidebar-system button img {
  width: 18px;
  height: 18px;
  opacity: .78
}

.sidebar-system button:hover {
  background: #eef6ff;
  color: #086ce4
}

.sidebar-system button:disabled {
  cursor: not-allowed;
  opacity: .46
}

.sidebar-system button:disabled:hover {
  background: transparent;
  color: #18347b
}

.sidebar--collapsed .sidebar-system {
  justify-items: center
}

.sidebar--collapsed .sidebar-system button {
  justify-content: center;
  width: 2.65rem;
  padding: 0
}

@media(max-width:68rem) {
  .sidebar {
    padding: .85rem .55rem
  }

  .brand {
    justify-content: center
  }

  .brand span,
  .admin-label,
  .sidebar-label,
  .sidebar-system h2,
  .sidebar-system button span {
    display: none
  }

  .sidebar nav button {
    justify-content: center;
    padding: 0
  }

  .sidebar nav button span {
    display: none
  }

  .sidebar nav b {
    position: absolute;
    margin: -1.35rem 0 0 1.2rem
  }

  .sidebar-system button {
    justify-content: center;
    padding: 0
  }
}

@media(max-width:47rem) {
  .sidebar {
    position: static;
    width: auto;
    height: auto;
    flex-direction: row;
    align-items: center;
    padding: .45rem .65rem;
    overflow-x: auto;
    overflow-y: hidden
  }

  .brand {
    margin: 0 .55rem 0 0
  }

  .brand img {
    width: 2.35rem;
    height: 2.35rem
  }

  .sidebar nav {
    display: flex;
    gap: .25rem
  }

  .sidebar nav button {
    flex: 0 0 2.3rem;
    min-height: 2.3rem
  }
}
</style>
