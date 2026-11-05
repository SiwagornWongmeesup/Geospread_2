<script setup>
// ---------------------------------------------------------------------------
// Profile Page
// คอม: แสดงแค่ข้อมูลโปรไฟล์ (เมนูอื่นอยู่ใน sidebar แล้ว)
// มือถือ: แสดงข้อมูลโปรไฟล์ + เมนูรวมจาก sidebar เพราะมือถือไม่มี sidebar
// ---------------------------------------------------------------------------
import ProfileSummary from '~/components/profile/ProfileSummary.vue'
import MobileProfileMenu from '~/components/profile/MobileProfileMenu.vue'

definePageMeta({
  showRightPanel: false
})

const { t } = useLocale()
const { isMobile } = useResponsiveView()
const { isLoggedIn, getUser, logout } = useAuth()

useHead({ title: () => `${t('nav.profile')} | GeoSpread` })

// cookie user เก็บได้ 2 แบบ: { user: {...}, token } (แบบเก่า) หรือ {...} ตรงๆ
const account = computed(() => {
  if (!isLoggedIn.value) return null
  const saved = getUser()
  if (saved?.user) return saved.user
  return saved
})

const confirmLogout = () => {
  if (confirm(t('header.logoutConfirm'))) {
    logout()
  }
}
</script>

<template>
  <section class="profile-page" :class="{ 'profile-page--mobile': isMobile }">
    <ProfileSummary :account="account" />
    <MobileProfileMenu v-if="isMobile" :is-logged-in="isLoggedIn" @logout="confirmLogout" />
  </section>
</template>

<style scoped>
.profile-page {
  display: grid;
  max-width: 720px;
  gap: 20px;
}

.profile-page--mobile {
  max-width: none;
  min-height: 100%;
  align-content: start;
  padding: 16px;
  background: #f4f8fc;
}
</style>
