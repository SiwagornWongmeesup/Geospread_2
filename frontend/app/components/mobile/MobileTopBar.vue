<template>
  <!-- แถบบนสุดของหน้าหลักบนมือถือ: โลโก้ซ้าย, ปุ่มเข้าสู่ระบบขวา (ซ่อนเมื่อเข้าสู่ระบบแล้ว) -->
  <header class="mobile-top-bar">
    <NuxtLink to="/" class="mobile-top-bar__brand" :aria-label="t('auth.backHome')">
      <img src="/logos/logo.png" alt="" class="mobile-top-bar__logo" />
      <span>GeoSpread</span>
    </NuxtLink>

    <NuxtLink v-if="!isLoggedIn" to="/login" class="mobile-top-bar__login">
      {{ t('header.login') }}
    </NuxtLink>
  </header>
</template>

<script setup>
const { t } = useLocale()
const { isLoggedIn } = useAuth()
</script>

<style scoped>
.mobile-top-bar {
  position: relative;
  z-index: 20;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 56px;
  padding: env(safe-area-inset-top) 14px 0;
  border-bottom: 1px solid var(--gs-line);
  background: var(--gs-surface);
}

.mobile-top-bar__brand {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 8px;
  color: #102968;
  font-size: 18px;
  font-weight: 800;
  text-decoration: none;
}

.mobile-top-bar__logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.mobile-top-bar__login {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  padding: 0 16px;
  border-radius: 999px;
  background: #0b5fcc;
  color: #fff;
  font-size: 14px;
  font-weight: 750;
  text-decoration: none;
}

.mobile-top-bar__brand:focus-visible,
.mobile-top-bar__login:focus-visible {
  outline: 3px solid rgb(11 95 204 / 40%);
  outline-offset: 2px;
  border-radius: 999px;
}
</style>
