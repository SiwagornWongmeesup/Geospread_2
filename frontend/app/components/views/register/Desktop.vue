<template>
  <AuthDesktopLayout
    title-id="register-title"
    :title="t('auth.createAccount')"
    :intro="t('auth.registerIntro')"
    :hero-text="t('auth.registerHeroText')"
  >
    <form novalidate @submit.prevent="emit('submitRegister')">
      <AuthAlert v-if="error">{{ error }}</AuthAlert>
      <AuthField
        id="desktop-reg-name"
        v-model="form.name"
        :label="t('auth.username')"
        autocomplete="nickname"
        :placeholder="t('auth.namePlaceholder')"
        :hint="t('auth.nameHint')"
        required
        :error="fieldErrors.name"
      />
      <AuthField
        id="desktop-reg-email"
        v-model="form.email"
        :label="t('auth.email')"
        type="email"
        autocomplete="email"
        placeholder="name@example.com"
        required
        :error="fieldErrors.email || (emailTaken ? t('auth.emailTaken') : '')"
      >
        <template v-if="emailTaken" #error-action>
          <NuxtLink :to="loginTo">{{ t('auth.loginInstead') }}</NuxtLink>
        </template>
      </AuthField>
      <AuthField
        id="desktop-reg-password"
        v-model="form.password"
        :label="t('auth.password')"
        type="password"
        autocomplete="new-password"
        :placeholder="t('auth.passwordPlaceholder')"
        :hint="t('auth.passwordMin')"
        required
        :error="fieldErrors.password"
      />
      <AuthTerms
        id="desktop-reg-terms"
        :model-value="acceptTerms"
        :error="fieldErrors.terms"
        @update:model-value="emit('update:acceptTerms', $event)"
      />
      <AuthSubmitButton :loading="loading" :label="t('auth.createAccount')" :loading-label="t('auth.creating')" />
    </form>
    <GoogleAuthButton />
    <p class="auth-switch">{{ t('auth.haveAccount') }} <NuxtLink :to="loginTo">{{ t('header.login') }}</NuxtLink></p>
  </AuthDesktopLayout>
</template>

<script setup>
import AuthDesktopLayout from '~/components/auth/AuthDesktopLayout.vue'
import AuthAlert from '~/components/auth/AuthAlert.vue'
import AuthField from '~/components/auth/AuthField.vue'
import AuthTerms from '~/components/auth/AuthTerms.vue'
import AuthSubmitButton from '~/components/auth/AuthSubmitButton.vue'
import GoogleAuthButton from '~/components/auth/GoogleAuthButton.vue'

defineProps({
  form: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  acceptTerms: { type: Boolean, default: false },
  fieldErrors: { type: Object, default: () => ({}) },
  emailTaken: { type: Boolean, default: false },
  loginTo: { type: [String, Object], default: '/login' },
})
const emit = defineEmits(['submitRegister', 'update:acceptTerms'])

const { t } = useLocale()
</script>
