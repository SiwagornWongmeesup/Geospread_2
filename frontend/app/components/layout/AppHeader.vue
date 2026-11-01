<template>
  <header class="app-header" :class="{ 'app-header--standalone': standalone }">
    <!-- หน้าที่ไม่มี sidebar (login, register): แสดงโลโก้เต็มแทนชื่อหน้า -->
    <NuxtLink v-if="standalone" to="/" class="app-header__brand">
      <img src="/logos/logo.png" alt="" class="app-header__brand-logo" />
      <span class="app-header__brand-text">
        <span class="app-header__brand-name">GeoSpread</span>
        <span class="app-header__brand-tagline">{{ t('brand.tagline') }}</span>
      </span>
    </NuxtLink>

    <!-- ชื่อหน้าที่กำลังเปิดอยู่ -->
    <h1 v-else class="app-header__title">{{ pageTitle }}</h1>

    <div class="app-header__search">
      <span class="search-icon">⌕</span>
      <input
        type="text"
        :placeholder="t('header.searchPlaceholder')"
        :aria-label="t('header.searchLabel')"
      />
    </div>

    <!-- สลับภาษา: กดแล้วเปลี่ยนทั้งแอปทันที และจำไว้ใน cookie -->
    <div class="language-switch" role="group" :aria-label="t('common.switchLanguage')">
      <button
        v-for="option in locales"
        :key="option.code"
        type="button"
        class="language-switch__option"
        :aria-pressed="locale === option.code"
        :lang="option.code"
        :title="option.label"
        @click="setLocale(option.code)"
      >
        {{ option.short }}
      </button>
    </div>

    <template v-if="isLoggedIn">
      <!-- การแจ้งเตือน: ตอนนี้ใช้ข้อมูลจำลอง (notifications) รอ API -->
      <div ref="notificationRoot" class="header-menu">
        <button
          type="button"
          class="icon-button"
          :aria-label="unreadCount ? t('header.notificationsUnread', { count: unreadCount }) : t('header.notifications')"
          :aria-expanded="openMenu === 'notifications'"
          aria-controls="header-notifications"
          @click="toggleMenu('notifications')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 9a6 6 0 1 1 12 0c0 4.5 1.5 6.5 2.5 7.5h-17C4.5 15.5 6 13.5 6 9Z" />
            <path d="M10 19.5a2 2 0 0 0 4 0" />
          </svg>
          <span v-if="unreadCount" class="icon-button__badge">{{ unreadCount }}</span>
        </button>

        <Transition name="header-dropdown">
          <div
            v-if="openMenu === 'notifications'"
            id="header-notifications"
            class="header-dropdown header-dropdown--notifications"
          >
            <div class="notifications__head">
              <strong>{{ t('header.notifications') }}</strong>
              <button v-if="unreadCount" type="button" @click="markAllRead">{{ t('header.markAllRead') }}</button>
            </div>
            <ul class="notifications__list">
              <li v-for="item in notifications" :key="item.id">
                <NuxtLink
                  :to="item.to"
                  class="notification-item"
                  :class="{ 'notification-item--unread': !item.read }"
                  @click="openNotification(item)"
                >
                  <span class="notification-item__dot" :class="`notification-item__dot--${item.tone}`" aria-hidden="true" />
                  <span class="notification-item__body">
                    <strong>{{ notificationText(item).title }}</strong>
                    <span>{{ notificationText(item).detail }}</span>
                    <time>{{ notificationText(item).time }}</time>
                  </span>
                </NuxtLink>
              </li>
            </ul>
            <NuxtLink to="/notifications" class="header-dropdown__footer" @click="closeMenu">
              {{ t('header.viewAllNotifications') }}
            </NuxtLink>
          </div>
        </Transition>
      </div>

      <!-- โปรไฟล์: รวมข้อมูลผู้ใช้ ลิงก์โปรไฟล์ และออกจากระบบไว้ในเมนูเดียว -->
      <div ref="profileRoot" class="header-menu">
        <button
          type="button"
          class="avatar-button"
          :aria-label="t('header.accountMenu', { name: userDisplayName })"
          :aria-expanded="openMenu === 'profile'"
          aria-controls="header-profile"
          @click="toggleMenu('profile')"
        >
          <span class="profile-avatar">{{ userInitial }}</span>
          <span class="profile-avatar__status" aria-hidden="true" />
        </button>

        <Transition name="header-dropdown">
          <div
            v-if="openMenu === 'profile'"
            id="header-profile"
            class="header-dropdown header-dropdown--profile"
          >
            <div class="profile-card">
              <span class="profile-card__avatar">
                <span class="profile-avatar">{{ userInitial }}</span>
                <span class="profile-avatar__status" aria-hidden="true" />
              </span>
              <span class="profile-card__text">
                <strong>{{ userDisplayName }}</strong>
                <span>{{ userRoleLabel }}</span>
              </span>
            </div>
            <div class="profile-menu">
              <NuxtLink to="/profile" class="profile-menu__item" @click="closeMenu">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="10" r="3" />
                  <path d="M6.5 18.5a6.5 6.5 0 0 1 11 0" />
                </svg>
                {{ t('header.personalInfo') }}
              </NuxtLink>
              <button type="button" class="profile-menu__item profile-menu__item--danger" @click="handleLogout">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3v8" />
                  <path d="M7.5 6.5a7 7 0 1 0 9 0" />
                </svg>
                {{ t('header.logout') }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </template>

    <template v-else>
      <div class="auth-buttons">
        <button type="button" class="btn-login" @click="goToLogin">{{ t('header.login') }}</button>
        <NuxtLink to="/register" class="btn-register">{{ t('header.register') }}</NuxtLink>
      </div>
    </template>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAuth } from '~/composables/useAuth'

defineProps({
  // true = ใช้ในหน้าที่ไม่มี sidebar (login, register) จะแสดงโลโก้เต็มและเป็นแถบเต็มความกว้าง
  standalone: { type: Boolean, default: false },
})

const router = useRouter()
const route = useRoute()
const { isLoggedIn, getUser, logout } = useAuth()
const { t, locale, locales, setLocale, tm } = useLocale()

// ชื่อหน้าที่แสดงใน header ใช้ชื่อเดียวกับเมนูใน sidebar
const pageTitles = {
  '/': 'nav.home',
  '/incidents': 'nav.incidents',
  '/help-requests': 'nav.helpRequests',
  '/report-incident': 'nav.reportIncident',
  '/request-help': 'nav.requestHelp',
  '/followed-locations': 'nav.followedLocations',
  '/notifications': 'nav.notifications',
  '/safety-guide': 'nav.safetyGuide',
  '/profile': 'nav.profile',
  '/settings': 'nav.settings',
}

const pageTitle = computed(() => {
  const title = pageTitles[route.path]
  if (title) {
    return t(title)
  }

  // หน้ารายละเอียดรายงาน เช่น /incidents/30/reports/61
  if (route.path.startsWith('/incidents/')) {
    return t('nav.reportDetail')
  }

  return 'GeoSpread'
})

const goToLogin = () => {
  navigateTo('/login') 
}

const currentUser = computed(() => getUser()?.user)

const userDisplayName = computed(() => {
  if (!currentUser.value) return t('common.user')
  return currentUser.value.name || currentUser.value.email?.split('@')[0] || t('common.user')
})

const userInitial = computed(() => {
  return userDisplayName.value.charAt(0).toUpperCase()
})

const userRoleLabel = computed(() => {
  return currentUser.value?.role === 'admin' ? t('header.roleAdmin') : t('header.roleMember')
})

// เปิดได้ทีละเมนู: 'notifications' | 'profile' | null
const openMenu = ref(null)
const notificationRoot = ref(null)
const profileRoot = ref(null)

const toggleMenu = (name) => {
  openMenu.value = openMenu.value === name ? null : name
}

const closeMenu = () => {
  openMenu.value = null
}

const handleDocumentClick = (event) => {
  const roots = [notificationRoot.value, profileRoot.value].filter(Boolean)
  if (!roots.some((root) => root.contains(event.target))) closeMenu()
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') closeMenu()
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)
})

// TODO: เปลี่ยนเป็นข้อมูลจาก API การแจ้งเตือนเมื่อ backend พร้อม
// ข้อความของแต่ละรายการอยู่ในไฟล์ภาษา (header.mockNotifications) ตามลำดับ index
const notifications = ref([
  { id: 1, index: 0, tone: 'danger', to: '/incidents', read: false },
  { id: 2, index: 1, tone: 'verified', to: '/incidents', read: false },
  { id: 3, index: 2, tone: 'help', to: '/help-requests', read: false },
  { id: 4, index: 3, tone: 'muted', to: '/incidents', read: true },
])

const notificationText = (item) => tm('header.mockNotifications')?.[item.index] ?? {}

const unreadCount = computed(() => notifications.value.filter((item) => !item.read).length)

const markAllRead = () => {
  notifications.value.forEach((item) => { item.read = true })
}

const openNotification = (item) => {
  item.read = true
  closeMenu()
}

const handleLogout = () => {
  closeMenu()
  if (confirm(t('header.logoutConfirm'))) {
    logout()
  }
}
</script>

<style scoped>
/* header เป็นการ์ดสีขาวมุมโค้ง ลอยอยู่เหนือเนื้อหา (อยู่ด้านขวาของ sidebar) */
.app-header {
  z-index: 100;
  flex: 0 0 auto;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 12px 16px 12px;
  padding: 0 16px 0 24px;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: #ffffff;

  font-family: var(--gs-font);
}

/* แบบ standalone (login, register): เป็นแถบเต็มความกว้างติดขอบบน */
.app-header--standalone {
  height: 72px;
  margin: 0;
  padding: 0 18px 0 8px;
  border-width: 0 0 1px;
  border-radius: 0;
}

.app-header__brand {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 4px;
  min-width: 0;
  text-decoration: none;
}

/* ไฟล์ logo.png มีพื้นที่ว่างรอบรูปเยอะ จึงต้องตั้งขนาดใหญ่กว่าที่เห็นจริง */
.app-header__brand-logo {
  width: 72px;
  height: 72px;
  object-fit: contain;
}

.app-header__brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.app-header__brand-name {
  color: var(--gs-ink);
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.8px;
}

.app-header__brand-tagline {
  margin-top: 3px;
  color: var(--gs-muted);
  font-size: 12px;
  font-weight: 500;
}

/* ชื่อหน้า */

.app-header__title {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--gs-ink);
  font-size: 22px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Search */

.app-header__search {
  flex: 0 1 280px;
  min-width: 160px;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  background: var(--gs-surface-sunken);
  border: 1px solid transparent;
  border-radius: var(--gs-radius-sm);
  transition: 0.2s ease;
}

.app-header__search:focus-within {
  border-color: var(--gs-action);
  background: #ffffff;
  box-shadow: var(--gs-focus);
}

.search-icon {
  color: var(--gs-ink);
  font-size: 29px;
  line-height: 1;
  transform: rotate(-20deg);
}

.app-header__search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--gs-ink);
  font-family: inherit;
  font-size: 14px;
}

.app-header__search input::placeholder {
  color: var(--gs-muted);
}

/* สลับภาษา TH / EN */

.language-switch {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 2px;
  padding: 3px;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface-sunken);
  box-shadow: inset 0 0 0 1px var(--gs-line);
}

.language-switch__option {
  min-width: 36px;
  height: 30px;
  padding: 0 8px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--gs-muted);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
}

.language-switch__option:hover {
  color: var(--gs-ink);
}

.language-switch__option[aria-pressed='true'] {
  background: var(--gs-surface);
  color: var(--gs-ink);
  box-shadow: 0 1px 2px rgb(23 32 46 / 12%), inset 0 0 0 1px var(--gs-line);
}

.language-switch__option:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

/* เมนูแบบ dropdown (การแจ้งเตือน, โปรไฟล์) */

.header-menu {
  position: relative;
  flex: 0 0 auto;
}

.icon-button,
.avatar-button {
  position: relative;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.icon-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: var(--gs-ink-2);
}

.icon-button:hover,
.icon-button[aria-expanded='true'] {
  background: var(--gs-surface-sunken);
  color: var(--gs-ink);
}

.icon-button svg {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.icon-button__badge {
  position: absolute;
  top: 0;
  right: -2px;
  display: grid;
  min-width: 20px;
  height: 20px;
  box-sizing: border-box;
  padding: 0 5px;
  place-items: center;
  border: 2px solid #ffffff;
  border-radius: 999px;
  background: var(--gs-danger);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.avatar-button {
  border-radius: 50%;
}

.icon-button:focus-visible,
.avatar-button:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

.profile-avatar {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 50%;
  background: var(--gs-action);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
}

/* จุดสถานะออนไลน์ที่มุมขวาล่างของรูปโปรไฟล์ */
.profile-avatar__status {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid #ffffff;
  border-radius: 50%;
  background: #2f9e57;
}

.header-dropdown {
  position: absolute;
  z-index: 200;
  top: calc(100% + 12px);
  right: 0;
  overflow: hidden;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
  box-shadow: 0 12px 28px rgb(23 32 46 / 14%);
}

.header-dropdown--notifications {
  width: min(360px, calc(100vw - 32px));
}

.header-dropdown--profile {
  width: 280px;
}

.header-dropdown-enter-active,
.header-dropdown-leave-active {
  transition: opacity 140ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.header-dropdown-enter-from,
.header-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .header-dropdown-enter-active,
  .header-dropdown-leave-active {
    transition: none;
  }
}

/* รายการแจ้งเตือน */

.notifications__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--gs-line);
  color: var(--gs-ink);
  font-size: 15px;
}

.notifications__head button {
  padding: 0;
  border: 0;
  background: none;
  color: var(--gs-action);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.notifications__head button:hover {
  text-decoration: underline;
}

.notifications__list {
  max-height: 360px;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.notifications__list li + li {
  border-top: 1px solid var(--gs-line);
}

.notification-item {
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr);
  gap: 12px;
  padding: 12px 16px;
  color: inherit;
  text-decoration: none;
}

.notification-item--unread {
  background: #f7f9fc;
}

.notification-item:hover,
.notification-item:focus-visible {
  outline: none;
  background: var(--gs-surface-sunken);
}

.notification-item__dot {
  width: 8px;
  height: 8px;
  margin-top: 7px;
  border-radius: 50%;
  background: var(--gs-line-strong);
}

.notification-item__dot--danger {
  background: var(--gs-danger);
}

.notification-item__dot--verified {
  background: var(--gs-verified);
}

.notification-item__dot--help {
  background: var(--gs-help);
}

.notification-item__body {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.notification-item__body strong {
  color: var(--gs-ink);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.45;
}

.notification-item--unread .notification-item__body strong {
  font-weight: 700;
}

.notification-item__body span,
.notification-item__body time {
  color: var(--gs-muted);
  font-size: 13px;
  line-height: 1.4;
}

.header-dropdown__footer {
  display: block;
  padding: 12px 16px;
  border-top: 1px solid var(--gs-line);
  color: var(--gs-action);
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
}

.header-dropdown__footer:hover {
  background: var(--gs-surface-sunken);
}

/* เมนูโปรไฟล์ */

.profile-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--gs-line);
  background: var(--gs-action-tint);
}

.profile-card__avatar {
  position: relative;
  flex: 0 0 auto;
}

.profile-card__avatar .profile-avatar {
  width: 48px;
  height: 48px;
  font-size: 18px;
}

.profile-card__text {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.profile-card__text strong {
  overflow: hidden;
  color: var(--gs-ink);
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-card__text span {
  color: var(--gs-muted);
  font-size: 13px;
}

.profile-menu {
  display: grid;
  padding: 6px 0;
}

.profile-menu__item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  border: 0;
  background: none;
  color: var(--gs-ink-2);
  font-size: 15px;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.profile-menu__item:hover,
.profile-menu__item:focus-visible {
  outline: none;
  background: var(--gs-surface-sunken);
  color: var(--gs-ink);
}

.profile-menu__item--danger:hover,
.profile-menu__item--danger:focus-visible {
  background: var(--gs-danger-tint);
  color: var(--gs-danger-hover);
}

.profile-menu__item svg {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

/* Auth Buttons (กรณี Guest) */

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-login,
.btn-register {
  padding: 8px 16px;
  border-radius: var(--gs-radius-sm);
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: 0.15s ease;
}

.btn-login {
  color: var(--gs-action);
  background: var(--gs-surface);
  border: 1px solid var(--gs-line-strong);
}

.btn-login:hover {
  background: var(--gs-action-tint);
}

.btn-register {
  color: #ffffff;
  background: var(--gs-action);

}

.btn-register:hover {
  background: var(--gs-action-hover);
}

.arrow {
  color: var(--gs-ink);
  font-size: 18px;
  font-weight: 700;
}

</style>