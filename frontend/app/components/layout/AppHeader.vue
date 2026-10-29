<template>
  <header class="app-header" :class="{ 'app-header--standalone': standalone }">
    <!-- หน้าที่ไม่มี sidebar (login, register): แสดงโลโก้เต็มแทนชื่อหน้า -->
    <NuxtLink v-if="standalone" to="/" class="app-header__brand">
      <img src="/logos/logo.png" alt="" class="app-header__brand-logo" />
      <span class="app-header__brand-text">
        <span class="app-header__brand-name">GeoSpread</span>
        <span class="app-header__brand-tagline">Safer Communities Together</span>
      </span>
    </NuxtLink>

    <!-- ชื่อหน้าที่กำลังเปิดอยู่ -->
    <h1 v-else class="app-header__title">{{ pageTitle }}</h1>

    <div class="app-header__search">
      <span class="search-icon">⌕</span>
      <input
        type="text"
        placeholder="ค้นหาสถานที่ เหตุการณ์..."
        aria-label="ค้นหาสถานที่ เหตุการณ์ หรือคำขอช่วยเหลือ"
      />
    </div>

    <template v-if="isLoggedIn">
      <button class="notification-button" aria-label="Notifications">
        ♧
        <span class="notification-badge">3</span>
      </button>

      <div class="app-header__profile" title="คลิกเพื่อออกจากระบบ" @click="handleLogout">
        <div class="profile-avatar">
          {{ userInitial }}
        </div>

        <div class="profile-info">
          <span class="welcome-text">ยินดีต้อนรับ</span>
          <strong>{{ userDisplayName }}</strong>
        </div>

        <button class="logout-button" type="button">
          ออกจากระบบ
        </button>
      </div>
    </template>

  
    <template v-else>
      <div class="auth-buttons">
        <button type="button" class="btn-login" @click="goToLogin">เข้าสู่ระบบ</button>
        <NuxtLink to="/register" class="btn-register">สมัครสมาชิก</NuxtLink>
      </div>
    </template>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth } from '~/composables/useAuth'

defineProps({
  // true = ใช้ในหน้าที่ไม่มี sidebar (login, register) จะแสดงโลโก้เต็มและเป็นแถบเต็มความกว้าง
  standalone: { type: Boolean, default: false },
})

const router = useRouter()
const route = useRoute()
const { isLoggedIn, getUser, logout } = useAuth()

// ชื่อหน้าที่แสดงใน header ใช้ชื่อเดียวกับเมนูใน sidebar
const pageTitles = {
  '/': 'หน้าหลัก',
  '/incidents': 'ดูเหตุการณ์',
  '/help-requests': 'ดูคำขอช่วยเหลือ',
  '/report-incident': 'แจ้งเหตุใหม่',
  '/request-help': 'ขอความช่วยเหลือ',
  '/followed-locations': 'พื้นที่ติดตาม',
  '/notifications': 'การแจ้งเตือน',
  '/safety-guide': 'คู่มือความปลอดภัย',
  '/profile': 'โปรไฟล์',
  '/settings': 'ตั้งค่า',
}

const pageTitle = computed(() => {
  const title = pageTitles[route.path]
  if (title) {
    return title
  }

  // หน้ารายละเอียดรายงาน เช่น /incidents/30/reports/61
  if (route.path.startsWith('/incidents/')) {
    return 'รายละเอียดรายงาน'
  }

  return 'GeoSpread'
})

const goToLogin = () => {
  navigateTo('/login') 
}

const currentUser = computed(() => getUser()?.user)

const userDisplayName = computed(() => {
  if (!currentUser.value) return 'ผู้ใช้งาน'
  return currentUser.value.name || currentUser.value.email?.split('@')[0] || 'ผู้ใช้งาน'
})

const userInitial = computed(() => {
  return userDisplayName.value.charAt(0).toUpperCase()
})

const handleLogout = () => {
  if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
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

/* Notification */

.notification-button {
  position: relative;
  width: 40px;
  height: 40px;
  border: 0;
  background: transparent;
  color: var(--gs-ink);
  font-size: 27px;
  cursor: pointer;
}

.notification-badge {
  position: absolute;
  top: 3px;
  right: 1px;
  min-width: 19px;
  height: 19px;
  display: grid;
  place-items: center;
  padding: 0 4px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  background: var(--gs-danger);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
}

/* Profile */

.app-header__profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.app-header__profile:hover {
  background: var(--gs-surface-sunken);
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gs-action);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;

}

.profile-info {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
  color: var(--gs-ink);
  font-size: 14px;
}

.welcome-text {
  color: var(--gs-muted);
  font-size: 12px;
}

.logout-button {
  margin-left: 4px;
  padding: 6px 12px;
  border: 1px solid var(--gs-line);
  border-radius: 6px;
  background: #ffffff;
  color: var(--gs-danger);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.15s ease;
}

.logout-button:hover {
  background: var(--gs-danger-tint);
  border-color: #f1c4c2;
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