<script setup>
// เนื้อหาโปรไฟล์ ใช้ร่วมกันระหว่างหน้าโปรไฟล์ของผู้ใช้ (/profile) และของแอดมิน (/admin/profile)
// ข้อมูลส่วนตัวและกิจกรรมตอนนี้เป็นข้อมูลจำลอง (ดู composables/useProfile.js)
import ProfileSummary from '~/components/profile/ProfileSummary.vue'
import ProfileInfoCard from '~/components/profile/ProfileInfoCard.vue'
import ProfileAccountCard from '~/components/profile/ProfileAccountCard.vue'
import ProfileActivityCard from '~/components/profile/ProfileActivityCard.vue'
import ProfileFollowedCard from '~/components/profile/ProfileFollowedCard.vue'

const props = defineProps({
  // true = แสดงช่อง LINE ID และ Instagram ในข้อมูลส่วนตัว (หน้าโปรไฟล์ของแอดมิน)
  showSocial: { type: Boolean, default: false },
})

const { t } = useLocale()
const { isLoggedIn } = useAuth()
const { profile, isSaving, loadProfile, saveProfile } = useProfile()

// โหลดค่าตั้งต้นจาก cookie ตอน SSR แล้วโหลดซ้ำในเบราว์เซอร์ เพื่อเอาที่เคยแก้ไว้ (localStorage) มาทับ
loadProfile()
onMounted(loadProfile)

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
  <div class="profile-content" :class="{ 'profile-content--guest': !account }">
    <div class="profile-content__side">
      <ProfileSummary :account="account" />
      <ProfileAccountCard v-if="account" :account="account" />
    </div>

    <div v-if="account" class="profile-content__main">
      <p class="profile-notice">{{ t('profilePage.mockNotice') }}</p>
      <div class="profile-content__cards">
        <ProfileInfoCard :profile="account" :is-saving="isSaving" :save="saveProfile" :show-social="props.showSocial" />
        <ProfileActivityCard />
        <ProfileFollowedCard class="profile-content__wide" />
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

/* จอกว้างมาก: ข้อมูลส่วนตัวกับกิจกรรมวางข้างกัน ไม่ให้เหลือพื้นที่ว่างด้านขวา */
@media (min-width: 1440px) {
  .profile-content__cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    /* การ์ดในแถวเดียวกันสูงเท่ากัน */
    align-items: stretch;
  }

  .profile-content__wide {
    grid-column: 1 / -1;
  }
}

.profile-notice {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid #ecd9b0;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-pending-tint);
  color: var(--gs-pending);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
}
</style>
