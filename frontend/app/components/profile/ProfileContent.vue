<script setup>
// เนื้อหาโปรไฟล์ ใช้ร่วมกันระหว่างหน้าโปรไฟล์ของผู้ใช้ (/profile) และของแอดมิน (/admin/profile)
// - ผู้ใช้ทั่วไป: ข้อมูลส่วนตัว + การรายงานของฉัน + พื้นที่ที่ติดตาม
// - แอดมิน: ข้อมูลบัญชีและช่องติดต่อ (LINE ID, Instagram) เท่านั้น ไม่มีส่วนที่เป็นของพลเมือง
// ข้อมูลจริงมาจาก GET /users/me (ดู composables/useProfile.js)
import ProfileSummary from '~/components/profile/ProfileSummary.vue'
import ProfileInfoCard from '~/components/profile/ProfileInfoCard.vue'
import ProfileAccountCard from '~/components/profile/ProfileAccountCard.vue'
import ProfileActivityCard from '~/components/profile/ProfileActivityCard.vue'
import ProfileFollowedCard from '~/components/profile/ProfileFollowedCard.vue'

const props = defineProps({
  // 'user' = โปรไฟล์ผู้ใช้ทั่วไป, 'admin' = โปรไฟล์ผู้ดูแลระบบ
  variant: { type: String, default: 'user' },
})

const isAdminProfile = computed(() => props.variant === 'admin')
const { isMobile } = useResponsiveView()

const { t } = useLocale()
const { isLoggedIn } = useAuth()
const { profile, isSaving, loadProfile, saveProfile } = useProfile()

// ตอน SSR แสดงเท่าที่รู้จาก cookie แล้วดึงข้อมูลจริงในเบราว์เซอร์
loadProfile()
onMounted(() => {
  loadProfile()
})

// ยังไม่ล็อกอิน = ไม่มีข้อมูลโปรไฟล์ (การ์ดด้านบนจะแสดงปุ่มเข้าสู่ระบบแทน)
const account = computed(() => {
  if (!isLoggedIn.value) {
    return null
  }
  return profile.value
})
</script>

<template>
  <!-- จอกว้าง: คอลัมน์ซ้าย (โปรไฟล์ + บัญชี) และคอลัมน์ขวา (ข้อมูลส่วนตัว + กิจกรรม)
       จอกว้างมาก: ข้อมูลส่วนตัวกับกิจกรรมวางข้างกัน / จอแคบ: เรียงลงมาทั้งหมด -->
  <div class="profile-content" :class="{ 'profile-content--guest': !account, 'profile-content--admin': isAdminProfile }">
    <div class="profile-content__side">
      <ProfileSummary :account="account" :show-trust="!isAdminProfile" />
      <ProfileAccountCard v-if="account" :account="account" />
    </div>

    <div v-if="account" class="profile-content__main">
      <div class="profile-content__cards">
        <ProfileInfoCard class="profile-content__wide" :profile="account" :is-saving="isSaving" :save="saveProfile" :show-social="isAdminProfile" />
        <template v-if="!isAdminProfile">
          <ProfileActivityCard v-if="account.isLoaded" :reports="account.reports" />
          <!-- มือถือมีลิงก์พื้นที่ติดตามในเมนูด้านล่างของหน้าแล้ว จึงไม่แสดงซ้ำ -->
          <ProfileFollowedCard v-if="!isMobile" />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-content,
.profile-content__side,
.profile-content__main,
.profile-content__cards {
  display: grid;
  align-content: start;
  gap: 16px;
  min-width: 0;
}

/* จอคอม: แบ่งซ้าย-ขวา */
@media (min-width: 1024px) {
  .profile-content:not(.profile-content--guest) {
    grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
    align-items: start;
  }

  .profile-content__side {
    position: sticky;
    top: 0;
  }
}

/* จอกว้างมาก: ข้อมูลส่วนตัวเต็มแถว (แบ่ง 2 คอลัมน์ข้างใน) แล้วการรายงานกับพื้นที่ติดตามวางข้างกัน ไม่ให้เหลือพื้นที่ว่าง */
@media (min-width: 1440px) {
  .profile-content:not(.profile-content--admin) .profile-content__cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    /* การ์ดในแถวเดียวกันสูงเท่ากัน */
    align-items: stretch;
  }

  .profile-content__wide {
    grid-column: 1 / -1;
  }
}

</style>
