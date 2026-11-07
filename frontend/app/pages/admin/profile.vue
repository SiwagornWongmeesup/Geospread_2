<script setup>
// โปรไฟล์ของแอดมิน: เนื้อหาเดียวกับ /profile แต่อยู่ใน layout แอดมิน (sidebar และเมนูมือถือของแอดมิน)
import ProfileContent from '~/components/profile/ProfileContent.vue'

definePageMeta({ layout: 'admin', middleware: ['admin'] })
</script>

<template>
  <section class="admin-profile">
    <!-- แอดมินมีช่องติดต่อเพิ่ม: LINE ID และ Instagram -->
    <ProfileContent show-social />
  </section>
</template>

<style scoped>
.admin-profile {
  display: grid;
  /* ใช้เต็มความกว้างของพื้นที่เนื้อหา ไม่ให้เหลือที่ว่างบนจอคอม */
  gap: 16px;
  padding-bottom: 24px;
}
</style>
