<script setup>
// ---------------------------------------------------------------------------
// Profile Page (ผู้ใช้)
// คอม: ข้อมูลโปรไฟล์ + ข้อมูลส่วนตัว (เมนูอื่นอยู่ใน sidebar แล้ว)
// มือถือ: เหมือนคอม + เมนูรวมจาก sidebar เพราะมือถือไม่มี sidebar
// แอดมินมีหน้าของตัวเองที่ /admin/profile (เนื้อหาเดียวกัน แต่อยู่ใน layout แอดมิน)
// ---------------------------------------------------------------------------
import ProfileContent from '~/components/profile/ProfileContent.vue'
import MobileProfileMenu from '~/components/profile/MobileProfileMenu.vue'
import InstallAppBanner from '~/components/common/InstallAppBanner.vue'

definePageMeta({
  showRightPanel: false
})

const { t } = useLocale()
const { isMobile } = useResponsiveView()
const { isLoggedIn, logout } = useAuth()

useHead({ title: () => `${t('nav.profile')} | GeoSpread` })

const confirmLogout = () => {
  if (confirm(t('header.logoutConfirm'))) {
    logout()
  }
}
</script>

<template>
  <section class="profile-page" :class="{ 'profile-page--mobile': isMobile }">
    <ProfileContent />
    <!-- ติดตั้งแอปลงเครื่อง (แสดงเฉพาะเครื่องที่ติดตั้งได้และยังไม่ได้ติดตั้ง) -->
    <InstallAppBanner variant="row" />
    <MobileProfileMenu v-if="isMobile" :is-logged-in="isLoggedIn" @logout="confirmLogout" />
  </section>
</template>

<style scoped>
.profile-page {
  display: grid;
  /* ใช้เต็มความกว้างของพื้นที่เนื้อหา ไม่ให้เหลือที่ว่างบนจอคอม */
  gap: 16px;
  padding: 0 16px 24px;
}

.profile-page--mobile {
  max-width: none;
  /* layout มือถือไม่เลื่อนให้ (overflow: hidden) หน้านี้ยาวขึ้นแล้วจึงเลื่อนเอง */
  height: 100%;
  overflow-y: auto;
  align-content: start;
  padding: 16px;
  background: var(--gs-paper);
}
</style>
