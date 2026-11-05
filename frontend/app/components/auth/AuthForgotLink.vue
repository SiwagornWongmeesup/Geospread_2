<template>
  <!-- ลิงก์ "ลืมรหัสผ่าน?" ใต้ช่องรหัสผ่านในหน้าเข้าสู่ระบบ
       ฝากอีเมลที่พิมพ์ไว้ให้หน้าลืมรหัสผ่าน (ผ่าน state ไม่ใส่ใน URL) -->
  <div class="auth-forgot">
    <NuxtLink :to="to" class="auth-forgot__link" @click="rememberEmail">{{ t('auth.forgotPassword') }}</NuxtLink>
  </div>
</template>

<script setup>
const props = defineProps({
  email: { type: String, default: '' },
  to: { type: [String, Object], default: '/forgot-password' },
})

const { t } = useLocale()
const forgotEmail = useState('auth-forgot-email', () => '')

const rememberEmail = () => {
  forgotEmail.value = props.email.trim()
}
</script>

<style scoped>
.auth-forgot {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.25rem;
}

.auth-forgot__link {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  color: #0b5fcc;
  font-size: 0.9rem;
  font-weight: 750;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.auth-forgot__link:focus-visible {
  outline: 2px solid #0b5fcc;
  outline-offset: 2px;
  border-radius: 0.4rem;
}
</style>
