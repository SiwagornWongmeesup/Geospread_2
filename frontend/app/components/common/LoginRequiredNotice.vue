<template>
  <!-- แจ้งตั้งแต่เปิดฟอร์มว่าต้องเข้าสู่ระบบก่อนส่ง (แสดงเฉพาะตอนยังไม่ได้เข้าสู่ระบบ)
       ย่อเหลือบรรทัดเดียว ไม่ดันเนื้อหาของฟอร์มลงไป ข้อความเต็มอยู่ใน message (อ่านโดย screen reader) -->
  <p class="login-notice" role="note">
    <span class="login-notice__text">
      {{ t('loginNotice.title') }}
      <span class="sr-only">{{ message }}</span>
    </span>
    <NuxtLink :to="loginTo" class="login-notice__link" @click="$emit('beforeLogin')">
      {{ t('header.login') }}
    </NuxtLink>
  </p>
</template>

<script setup>
const props = defineProps({
  // บอกว่าต้องเข้าสู่ระบบเพื่อทำอะไร เช่น "เข้าสู่ระบบก่อนส่งรายงาน..."
  message: { type: String, required: true },
  // หน้าที่จะกลับมาหลังเข้าสู่ระบบเสร็จ เช่น '/report-incident'
  redirect: { type: String, required: true },
})

// ฟอร์มใช้เก็บข้อมูลที่กรอกไว้ก่อนไปหน้าเข้าสู่ระบบ (ถ้ามี)
defineEmits(['beforeLogin'])

const { t } = useLocale()

const loginTo = computed(() => {
  return { path: '/login', query: { redirect: props.redirect } }
})
</script>

<style scoped>
.login-notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0;
  padding: 4px 4px 4px 12px;
  border: 1px solid #c9dbf2;
  border-radius: 10px;
  background: #eef5fe;
  color: #3f5a80;
  font-size: 14px;
  font-weight: 600;
}

.login-notice__link {
  display: inline-flex;
  min-height: 40px;
  flex-shrink: 0;
  align-items: center;
  padding: 0 14px;
  border-radius: 8px;
  color: #0b5fcc;
  font-weight: 750;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.login-notice__link:focus-visible {
  outline: 3px solid rgb(11 95 204 / 40%);
  outline-offset: 2px;
}
</style>
