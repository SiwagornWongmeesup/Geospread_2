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

      <div class="verify-form__code" :class="{ 'verify-form__code--invalid': codeError }">
        <label for="verify-code" class="verify-form__label">
          {{ t('auth.codeLabel') }} <b aria-hidden="true">*</b>
        </label>
        <!-- ช่องเดียว 6 หลัก: มือถือขึ้นแป้นตัวเลข และเติมรหัสจากอีเมล/SMS ให้อัตโนมัติได้ -->
        <input
          id="verify-code"
          :value="code"
          class="verify-form__input"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="6"
          placeholder="••••••"
          aria-required="true"
          :aria-invalid="codeError ? 'true' : undefined"
          :aria-describedby="codeError ? 'verify-code-error' : 'verify-code-hint'"
          @input="onCodeInput"
        />
        <p v-if="codeError" id="verify-code-error" class="verify-form__error">{{ codeError }}</p>
        <p v-else id="verify-code-hint" class="verify-form__hint">{{ t('auth.codeHint') }}</p>
      </div>

      <AuthSubmitButton :loading="loading" :label="t('auth.verifySubmit')" :loading-label="t('auth.checking')" />
    </form>

    <div class="verify-form__resend">
      <button
        type="button"
        class="verify-form__resend-button"
        :disabled="resendSeconds > 0 || resending"
        @click="$emit('resend')"
      >
        {{ resendSeconds > 0 ? t('auth.resendIn', { count: resendSeconds }) : t('auth.resendCode') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import AuthAlert from '~/components/auth/AuthAlert.vue'
import AuthField from '~/components/auth/AuthField.vue'
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

const emit = defineEmits(['update:code', 'update:emailInput', 'submit', 'resend'])

const { t } = useLocale()

// รับเฉพาะตัวเลข 6 หลัก (วางรหัสที่มีช่องว่างหรือขีดมาก็ได้)
const onCodeInput = (event) => {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 6)
  event.target.value = digits
  emit('update:code', digits)
}
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

.verify-form__code {
  display: grid;
  gap: 0.45rem;
  margin-top: 1rem;
}

.verify-form__label {
  color: #193a70;
  font-size: 0.9rem;
  font-weight: 750;
}

.verify-form__label b {
  color: #c8202a;
}

.verify-form__input {
  box-sizing: border-box;
  width: 100%;
  min-height: 4rem;
  padding: 0 1rem;
  border: 1px solid #7d93ad;
  border-radius: 0.75rem;
  background: #fff;
  color: #102968;
  font: inherit;
  font-size: 2rem;
  font-variant-numeric: tabular-nums;
  font-weight: 800;
  letter-spacing: 0.5em;
  text-align: center;
}

.verify-form__input::placeholder {
  color: #64758c;
  letter-spacing: 0.5em;
}

.verify-form__input:focus-visible {
  border-color: #0b5fcc;
  outline: 2px solid #0b5fcc;
  outline-offset: 2px;
}

.verify-form__code--invalid .verify-form__input {
  border-color: #d93a42;
  background: #fffafa;
}

.verify-form__code--invalid .verify-form__input:focus-visible {
  border-color: #be2631;
  outline-color: #be2631;
}

.verify-form__hint,
.verify-form__error {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.45;
}

.verify-form__hint {
  color: #52708b;
}

.verify-form__error {
  color: #be2631;
  font-weight: 650;
}

.verify-form__resend {
  margin-top: 0.75rem;
  text-align: center;
}

.verify-form__resend-button {
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

.verify-form__resend-button:disabled {
  color: #52708b;
  text-decoration: none;
  cursor: default;
}

.verify-form__resend-button:focus-visible {
  outline: 2px solid #0b5fcc;
  outline-offset: 2px;
}
</style>
