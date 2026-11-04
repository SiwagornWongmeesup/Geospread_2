<template>
  <AuthDesktopLayout
    title-id="login-title"
    :title="t('header.login')"
    :intro="t('auth.welcomeBack')"
    :hero-text="t('auth.loginHeroText')"
  >
    <form novalidate @submit.prevent="emit('submitLogin')">
      <AuthAlert v-if="successNotice" tone="success">{{ successNotice }}</AuthAlert>
      <AuthAlert v-if="error">{{ error }}</AuthAlert>
      <AuthField
        id="desktop-email"
        v-model="form.email"
        :label="t('auth.email')"
        type="email"
        autocomplete="email"
        placeholder="name@example.com"
        required
        :error="fieldErrors.email"
      />
      <AuthField
        id="desktop-password"
        v-model="form.password"
        :label="t('auth.password')"
        type="password"
        autocomplete="current-password"
        :placeholder="t('auth.passwordPlaceholder')"
        required
        :error="fieldErrors.password"
      />
      <AuthSubmitButton :loading="loading" :label="t('header.login')" :loading-label="t('auth.checking')" />
    </form>
    <GoogleAuthButton mode="login" />
    <p class="auth-switch">{{ t('auth.noAccount') }} <NuxtLink :to="registerTo">{{ t('header.register') }}</NuxtLink></p>
  </AuthDesktopLayout>
</template>

<script setup>
import AuthDesktopLayout from '~/components/auth/AuthDesktopLayout.vue'
import AuthAlert from '~/components/auth/AuthAlert.vue'
import AuthField from '~/components/auth/AuthField.vue'
import AuthSubmitButton from '~/components/auth/AuthSubmitButton.vue'
import GoogleAuthButton from '~/components/auth/GoogleAuthButton.vue'

defineProps({
  form: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  fieldErrors: { type: Object, default: () => ({}) },
  successNotice: { type: String, default: '' },
  registerTo: { type: [String, Object], default: '/register' },
})
const emit = defineEmits(['submitLogin'])

const { t } = useLocale()
</script>
