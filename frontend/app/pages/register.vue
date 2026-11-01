<script setup>
import DesktopView from '~/components/views/register/Desktop.vue'
import MobileView from '~/components/views/register/Mobile.vue'
const { t } = useLocale()

// ---------------------------------------------------------------------------
// Register Page — Controller Layer
// ไม่มี UI ในนี้ — ส่ง State และ Handler ไปให้ View Component เท่านั้น
// ---------------------------------------------------------------------------
definePageMeta({ layout: false })

const { isMobile } = useResponsiveView()

const { register, loading, error } = useAuth()
const router = useRouter()

const form = ref({
  name: '',
  email: '',
  password: ''
})

const acceptTerms = ref(false)

// Validation ฝั่ง client
const validationError = ref('')

const handleRegister = async () => {
  validationError.value = ''

  if (!form.value.name || !form.value.email || !form.value.password) {
    validationError.value = t('auth.fillAll')
    return
  }
  if (form.value.password.length < 8) {
    validationError.value = t('auth.passwordTooShort')
    return
  }
  if (!acceptTerms.value) {
    validationError.value = t('auth.acceptTermsRequired')
    return
  }

  const success = await register(form.value)
  if (success) {
    router.push('/login')
  }
}

// รวม error จาก validation + API
const displayError = computed(() => validationError.value || error.value)

</script>

<template>
  <MobileView
    v-if="isMobile"
    :form="form"
    :loading="loading"
    :error="displayError"
    :accept-terms="acceptTerms"
    @update:accept-terms="acceptTerms = $event"
    @submit-register="handleRegister"
  />
  <DesktopView
    v-else
    :form="form"
    :loading="loading"
    :error="displayError"
    :accept-terms="acceptTerms"
    @update:accept-terms="acceptTerms = $event"
    @submit-register="handleRegister"
  />
</template>
