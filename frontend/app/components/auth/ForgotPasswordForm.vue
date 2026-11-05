<template>
  <!-- ฟอร์มลืมรหัสผ่าน 2 ขั้น ใช้ทั้งหน้าคอมและมือถือ (ตรรกะอยู่ใน pages/forgot-password.vue)
       ขั้น 1 กรอกอีเมลเพื่อขอรหัส, ขั้น 2 กรอกรหัส 6 หลัก + รหัสผ่านใหม่ -->
  <div class="forgot-form">
    <AuthAlert v-if="notice" tone="success" class="forgot-form__alert">{{ notice }}</AuthAlert>
    <AuthAlert v-if="error" class="forgot-form__alert">{{ error }}</AuthAlert>

    <form v-if="step === 'request'" novalidate @submit.prevent="$emit('request')">
      <p class="forgot-form__intro">{{ t('auth.forgotIntro') }}</p>
      <AuthField
        id="forgot-email"
        :model-value="form.email"
        :label="t('auth.email')"
        type="email"
        autocomplete="email"
        inputmode="email"
        placeholder="name@example.com"
        required
        :error="fieldErrors.email"
        @update:model-value="form.email = $event"
      />
      <AuthSubmitButton :loading="loading" :label="t('auth.forgotSend')" :loading-label="t('auth.forgotSending')" />
    </form>

    <template v-else>
      <p class="forgot-form__sent">
        {{ t('auth.verifySentTo') }} <strong>{{ form.email }}</strong>
        <button type="button" class="forgot-form__link" @click="$emit('changeEmail')">
          {{ t('auth.verifyChangeEmail') }}
        </button>
      </p>

      <form novalidate @submit.prevent="$emit('reset')">
        <AuthCodeInput
          id="reset-code"
          :model-value="form.code"
          :label="t('auth.resetCodeLabel')"
          :hint="t('auth.resetCodeHint')"
          :error="fieldErrors.code"
          @update:model-value="form.code = $event"
        />
        <AuthField
          id="reset-password"
          :model-value="form.password"
          :label="t('auth.newPassword')"
          type="password"
          autocomplete="new-password"
          :placeholder="t('auth.passwordPlaceholder')"
          :hint="t('auth.passwordMin')"
          required
          :error="fieldErrors.password"
          @update:model-value="form.password = $event"
        />
        <AuthField
          id="reset-password-confirm"
          :model-value="form.confirm"
          :label="t('auth.confirmPassword')"
          type="password"
          autocomplete="new-password"
          :placeholder="t('auth.confirmPasswordPlaceholder')"
          required
          :error="fieldErrors.confirm"
          @update:model-value="form.confirm = $event"
        />
        <AuthSubmitButton :loading="loading" :label="t('auth.resetSubmit')" :loading-label="t('auth.resetSaving')" />
      </form>

      <AuthResendButton :seconds="resendSeconds" :disabled="resending" @resend="$emit('resend')" />
    </template>
  </div>
</template>

<script setup>
import AuthAlert from '~/components/auth/AuthAlert.vue'
import AuthCodeInput from '~/components/auth/AuthCodeInput.vue'
import AuthField from '~/components/auth/AuthField.vue'
import AuthResendButton from '~/components/auth/AuthResendButton.vue'
import AuthSubmitButton from '~/components/auth/AuthSubmitButton.vue'

defineProps({
  step: { type: String, default: 'request' },
  // { email, code, password, confirm } (reactive จากหน้า แก้ค่าได้ตรงๆ เหมือนฟอร์ม login)
  form: { type: Object, required: true },
  fieldErrors: { type: Object, default: () => ({}) },
  error: { type: String, default: '' },
  notice: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  resending: { type: Boolean, default: false },
  resendSeconds: { type: Number, default: 0 },
})

defineEmits(['request', 'reset', 'resend', 'changeEmail'])

const { t } = useLocale()
</script>

<style scoped>
.forgot-form__alert {
  margin-top: 0.75rem;
}

.forgot-form__intro,
.forgot-form__sent {
  margin: 0.75rem 0 0;
  color: #3f5a80;
  font-size: 0.95rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.forgot-form__sent strong {
  color: #102968;
}

.forgot-form__link {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  margin-left: 0.35rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: #0b5fcc;
  font: inherit;
  font-weight: 750;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.forgot-form__link:focus-visible {
  outline: 2px solid #0b5fcc;
  outline-offset: 2px;
  border-radius: 0.4rem;
}
</style>
