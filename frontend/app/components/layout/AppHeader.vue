<template>
  <header class="app-header">
    <NuxtLink to="/" class="app-header__brand">
      <img src="/logo.png" alt="GeoSpread Logo" class="app-header__logo-img" />

      <div class="app-header__brand-text">
        <span class="app-header__name">GeoSpread</span>
        <span class="app-header__tagline">Safer Communities Together</span>
      </div>
    </NuxtLink>

    <div class="app-header__search">
      <span class="search-icon">⌕</span>
      <input
        type="text"
        placeholder="Search locations, incidents, or help requests (e.g. Chiang Mai, flood, fire...)"
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

const router = useRouter()
const { isLoggedIn, getUser, logout } = useAuth()

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
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 72px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 18px 0 14px;
  background: #ffffff;
  border-bottom: 1px solid #e8eef8;
  box-shadow: 0 2px 10px rgba(31, 74, 142, 0.05);
  font-family: "Noto Sans Thai", Inter, sans-serif;
}

/* Logo */

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 242px;
  text-decoration: none;
}

.app-header__logo-img {
  width: 90px;
  object-fit: contain;
}

.app-header__brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.app-header__name {
  color: #071b72;
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.8px;
}

.app-header__tagline {
  margin-top: 3px;
  color: #4f6397;
  font-size: 11px;
  font-weight: 500;
}

/* Search */

.app-header__search {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  background: #f2f6fd;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: 0.2s ease;
}

.app-header__search:focus-within {
  border-color: #006dff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(0, 109, 255, 0.1);
}

.search-icon {
  color: #071b72;
  font-size: 29px;
  line-height: 1;
  transform: rotate(-20deg);
}

.app-header__search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #071b72;
  font-family: inherit;
  font-size: 14px;
}

.app-header__search input::placeholder {
  color: #6373a2;
}

/* Notification */

.notification-button {
  position: relative;
  width: 40px;
  height: 40px;
  border: 0;
  background: transparent;
  color: #071b72;
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
  background: #f2232f;
  color: #ffffff;
  font-size: 10px;
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
  background: #f2f6fd;
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1479ef, #0b2372);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(20, 121, 239, 0.25);
}

.profile-info {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
  color: #071b72;
  font-size: 14px;
}

.welcome-text {
  color: #6576a5;
  font-size: 11px;
}

.logout-button {
  margin-left: 4px;
  padding: 6px 12px;
  border: 1px solid #dbe5ef;
  border-radius: 6px;
  background: #ffffff;
  color: #e53935;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.15s ease;
}

.logout-button:hover {
  background: #ffebee;
  border-color: #ffcdd2;
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
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: 0.15s ease;
}

.btn-login {
  color: #1479ef;
  background: #f0f6ff;
  border: 1px solid #cce3ff;
}

.btn-login:hover {
  background: #e0eeff;
}

.btn-register {
  color: #ffffff;
  background: #1479ef;
  box-shadow: 0 2px 8px rgba(20, 121, 239, 0.3);
}

.btn-register:hover {
  background: #0d63cc;
}

.arrow {
  color: #071b72;
  font-size: 18px;
  font-weight: 700;
}
</style>