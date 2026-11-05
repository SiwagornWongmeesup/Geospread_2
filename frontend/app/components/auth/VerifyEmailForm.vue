<template>
  <!-- ฟอร์มกรอกรหัสยืนยันอีเมล 6 หลัก ใช้ทั้งหน้าคอมและมือถือ (ตรรกะอยู่ใน pages/verify-email.vue) -->
  <div class="verify-form">
    <AuthAlert v-if="notice" tone="success" class="verify-form__alert">{{ notice }}</AuthAlert>
    <AuthAlert v-if="error" class="verify-form__alert">{{ error }}</AuthAlert>

    <p v-if="email" class="verify-form__sent">
      {{ t('auth.verifySentTo') }} <strong>{{ email }}</strong>
      <NuxtLink :to="changeEmailTo" class="verify-form__change">{{ t('auth.verifyChangeEmail') }}</NuxtLink>
    </p>

    <form novalidate @submit.prevent="$emit('submit')">
      <AuthField
        v-if="!email"
        id="verify-email-address"
        :model-value="emailInput"
        :label="t('auth.email')"
        type="email"
        autocomplete="email"
        inputmode="email"
        placeholder="name@example.com"
        required
        :error="emailError"
        @update:model-value="$emit('update:emailInput', $event)"
      />

      <AuthCodeInput
        id="verify-code"
        :model-value="code"
        :label="t('auth.codeLabel')"
        :hint="t('auth.codeHint')"
        :error="codeError"
        @update:model-value="$emit('update:code', $event)"
      />

      <AuthSubmitButton :loading="loading" :label="t('auth.verifySubmit')" :loading-label="t('auth.checking')" />
    </form>

    <AuthResendButton :seconds="resendSeconds" :disabled="resending" @resend="$emit('resend')" />
  </div>
</template>

<script setup>
import AuthAlert from '~/components/auth/AuthAlert.vue'
import AuthCodeInput from '~/components/auth/AuthCodeInput.vue'
import AuthField from '~/components/auth/AuthField.vue'
import AuthResendButton from '~/components/auth/AuthResendButton.vue'
import AuthSubmitButton from '~/components/auth/AuthSubmitButton.vue'

defineProps({
  // อีเมลที่รอยืนยัน ถ้าว่าง (เช่น เปิดหน้านี้ตรงๆ) จะให้กรอกอีเมลเอง
  email: { type: String, default: '' },
  emailInput: { type: String, default: '' },
  emailError: { type: String, default: '' },
  code: { type: String, default: '' },
  codeError: { type: String, default: '' },
  error: { type: String, default: '' },
  notice: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  resending: { type: Boolean, default: false },
  resendSeconds: { type: Number, default: 0 },
  changeEmailTo: { type: [String, Object], default: '/register' },
})

defineEmits(['update:code', 'update:emailInput', 'submit', 'resend'])

const { t } = useLocale()
</script>

<style scoped>
.verify-form__alert {
  margin-top: 0.75rem;
}

.verify-form__sent {
  margin: 0.75rem 0 0;
  color: #3f5a80;
  font-size: 0.95rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.verify-form__sent strong {
  color: #102968;
}

.verify-form__change {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  margin-left: 0.35rem;
  color: #0b5fcc;
  font-weight: 750;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.verify-form__change:focus-visible {
  outline: 2px solid #0b5fcc;
  outline-offset: 2px;
  border-radius: 0.4rem;
}
</style>
