<template>
  <!-- ปุ่มส่งรหัสใหม่ พร้อมนับถอยหลัง (กดได้อีกครั้งเมื่อครบเวลา) -->
  <div class="auth-resend">
    <button
      type="button"
      class="auth-resend__button"
      :disabled="seconds > 0 || disabled"
      @click="$emit('resend')"
    >
      {{ seconds > 0 ? t('auth.resendIn', { count: seconds }) : t('auth.resendCode') }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  seconds: { type: Number, default: 0 },
  disabled: { type: Boolean, default: false },
})

defineEmits(['resend'])

const { t } = useLocale()
</script>

<style scoped>
.auth-resend {
  margin-top: 0.75rem;
  text-align: center;
}

.auth-resend__button {
  min-height: 44px;
  padding: 0 0.75rem;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: #0b5fcc;
  font: inherit;
  font-size: 0.92rem;
  font-weight: 750;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.auth-resend__button:disabled {
  color: #52708b;
  text-decoration: none;
  cursor: default;
}

.auth-resend__button:focus-visible {
  outline: 2px solid #0b5fcc;
  outline-offset: 2px;
}
</style>
