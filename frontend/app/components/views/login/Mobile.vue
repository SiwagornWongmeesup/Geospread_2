<template>
  <AuthMobileLayout title-id="login-title" :title="t('header.login')" :tagline="t('auth.mobileTagline')">
    <form novalidate @submit.prevent="emit('submitLogin')">
      <AuthAlert v-if="successNotice" tone="success" class="auth-mobile-alert">{{ successNotice }}</AuthAlert>
      <AuthAlert v-if="error" class="auth-mobile-alert">{{ error }}</AuthAlert>
      <AuthField
        id="mobile-email"
        v-model="form.email"
        :label="t('auth.email')"
        type="email"
        autocomplete="email"
        inputmode="email"
        placeholder="name@example.com"
        required
        :error="fieldErrors.email"
      />
      <AuthField
        id="mobile-password"
        v-model="form.password"
        :label="t('auth.password')"
        type="password"
        autocomplete="current-password"
        :placeholder="t('auth.passwordPlaceholder')"
        required
        :error="fieldErrors.password"
      />
      <AuthForgotLink :email="form.email" :to="forgotTo" />
      <AuthSubmitButton :loading="loading" :label="t('header.login')" :loading-label="t('auth.checking')" />
    </form>
    <GoogleAuthButton mode="login" />

    <template #footer>
      <p class="auth-switch">{{ t('auth.noAccount') }} <NuxtLink :to="registerTo">{{ t('header.register') }}</NuxtLink></p>
    </template>
  </AuthMobileLayout>
</template>

<script setup>
import AuthMobileLayout from '~/components/auth/AuthMobileLayout.vue'
import AuthAlert from '~/components/auth/AuthAlert.vue'
import AuthField from '~/components/auth/AuthField.vue'
import AuthForgotLink from '~/components/auth/AuthForgotLink.vue'
import AuthSubmitButton from '~/components/auth/AuthSubmitButton.vue'
import GoogleAuthButton from '~/components/auth/GoogleAuthButton.vue'

defineProps({
  form: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  fieldErrors: { type: Object, default: () => ({}) },
  successNotice: { type: String, default: '' },
  registerTo: { type: [String, Object], default: '/register' },
  forgotTo: { type: [String, Object], default: '/forgot-password' },
})

const emit = defineEmits(['submitLogin'])

const { t } = useLocale()
</script>

<style scoped>
/* การ์ดมือถือมีระยะบนน้อย กล่องข้อความแรกจึงเว้นจากขอบการ์ดเอง */
.auth-mobile-alert:first-child {
  margin-top: 0.8rem;
}
</style>
