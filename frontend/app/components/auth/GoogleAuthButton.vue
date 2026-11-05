<template>
  <!-- ปุ่มเข้าสู่ระบบ/ลงทะเบียนด้วย Google (mockup): ยังไม่เชื่อมระบบจริง กดแล้วแจ้งว่ายังไม่เปิดใช้งาน -->
  <div class="google-auth">
    <div class="google-auth__divider">{{ t('auth.or') }}</div>
    <button
      type="button"
      class="google-auth__button"
      :aria-describedby="showNote ? noteId : undefined"
      @click="showNote = true"
    >
      <svg class="google-auth__logo" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      <span>{{ mode === 'login' ? t('auth.loginGoogle') : t('auth.registerGoogle') }}</span>
      <span class="google-auth__badge">{{ t('auth.comingSoon') }}</span>
    </button>
    <p :id="noteId" class="google-auth__note" :class="{ 'google-auth__note--visible': showNote }" role="status">
      {{ showNote ? (mode === 'login' ? t('auth.googleLoginNotReady') : t('auth.googleNotReady')) : '' }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  // 'login' = หน้าเข้าสู่ระบบ, 'register' = หน้าสมัครสมาชิก (ข้อความบนปุ่มต่างกัน)
  mode: { type: String, default: 'register' },
})

const { t } = useLocale()
const showNote = ref(false)
const noteId = useId()
</script>

<style scoped>
.google-auth__divider {
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 22px 0 18px;
  color: #52708b;
  font-size: 14px;
}

.google-auth__divider::before,
.google-auth__divider::after {
  flex: 1;
  height: 1px;
  content: '';
  background: #dbe5ef;
}

.google-auth__button {
  display: flex;
  width: 100%;
  min-height: 50px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 14px;
  border: 1px solid #7d93ad;
  border-radius: 10px;
  background: #fff;
  color: #102968;
  font: inherit;
  font-weight: 750;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease;
}

.google-auth__button:hover {
  border-color: #52708b;
  background: #f7faff;
}

.google-auth__button:focus-visible {
  outline: 2px solid #0b5fcc;
  outline-offset: 2px;
}

.google-auth__logo {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
}

.google-auth__badge {
  padding: 1.6px 7px;
  border-radius: 999px;
  background: #e6edf7;
  color: #3f5a80;
  font-size: 12px;
  font-weight: 700;
}

.google-auth__note {
  min-height: 0;
  margin: 0;
  color: #52708b;
  font-size: 13px;
  text-align: center;
}

.google-auth__note--visible {
  margin-top: 8px;
}
</style>
