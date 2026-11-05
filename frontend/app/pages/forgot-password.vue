<script setup>
// ---------------------------------------------------------------------------
// Forgot Password Page — Controller Layer
// ขั้น 1 ขอรหัส 6 หลักทางอีเมล, ขั้น 2 กรอกรหัส + รหัสผ่านใหม่ แล้วกลับไปหน้าเข้าสู่ระบบ
// ---------------------------------------------------------------------------
import AuthDesktopLayout from '~/components/auth/AuthDesktopLayout.vue'
import AuthMobileLayout from '~/components/auth/AuthMobileLayout.vue'
import ForgotPasswordForm from '~/components/auth/ForgotPasswordForm.vue'

definePageMeta({ layout: false })

const { t } = useLocale()
const { isMobile } = useResponsiveView()
const route = useRoute()
const router = useRouter()
const { requestPasswordReset, resetPassword, loading, error, errorCode } = useAuth()

useHead({ title: () => `${t('auth.forgotTitle')} | GeoSpread` })

const redirect = computed(() => (typeof route.query.redirect === 'string' ? route.query.redirect : null))
const loginTo = computed(() => (redirect.value ? { path: '/login', query: { redirect: redirect.value } } : '/login'))

const step = ref('request')
const form = reactive({ email: '', code: '', password: '', confirm: '' })
const fieldErrors = ref({})
const notice = ref('')
const resending = ref(false)
const resendSeconds = ref(0)
let countdown = null

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const startCountdown = (seconds) => {
  clearInterval(countdown)
  resendSeconds.value = seconds
  if (seconds <= 0) return
  countdown = setInterval(() => {
    resendSeconds.value -= 1
    if (resendSeconds.value <= 0) clearInterval(countdown)
  }, 1000)
}

const focusField = async (selector) => {
  await nextTick()
  document.querySelector(selector)?.focus()
}

// ขั้น 1: ขอรหัส
const submitRequest = async () => {
  notice.value = ''
  const email = form.email.trim()
  const errors = {}
  if (!email) errors.email = t('auth.emailRequired')
  else if (!emailPattern.test(email)) errors.email = t('auth.emailInvalid')
  fieldErrors.value = errors
  if (errors.email) {
    focusField('[aria-invalid="true"]')
    return
  }

  form.email = email
  const seconds = await requestPasswordReset(email)
  if (seconds === null) return
  step.value = 'reset'
  startCountdown(seconds)
  focusField('#reset-code')
}

// ขอรหัสใหม่ (ในขั้น 2)
const resend = async () => {
  resending.value = true
  notice.value = ''
  const seconds = await requestPasswordReset(form.email)
  resending.value = false
  if (seconds !== null) {
    notice.value = t('auth.codeResent')
    startCountdown(seconds)
    focusField('#reset-code')
  }
}

// ขั้น 2: ตั้งรหัสผ่านใหม่
const submitReset = async () => {
  notice.value = ''
  const errors = {}
  if (form.code.length !== 6) errors.code = t('auth.codeRequired')
  if (!form.password) errors.password = t('auth.passwordRequired')
  else if (form.password.length < 8) errors.password = t('auth.passwordTooShort')
  if (!form.confirm) errors.confirm = t('auth.confirmPasswordRequired')
  else if (form.password && form.confirm !== form.password) errors.confirm = t('auth.passwordMismatch')
  fieldErrors.value = errors
  if (Object.keys(errors).length) {
    focusField('[aria-invalid="true"]')
    return
  }

  const ok = await resetPassword({ email: form.email, code: form.code, password: form.password })
  if (ok) {
    // หน้าเข้าสู่ระบบจะกรอกอีเมลไว้ให้และแสดงข้อความว่าเปลี่ยนรหัสแล้ว
    useState('auth-password-reset-email').value = form.email
    router.push(loginTo.value)
    return
  }

  // รหัสผิด/หมดอายุ: แสดงใต้ช่องรหัส ล้างรหัสเดิมให้พิมพ์ใหม่ (error อื่นแสดงในกล่องด้านบน)
  if (['invalidCode', 'codeExpired', 'tooManyAttempts'].includes(errorCode.value)) {
    fieldErrors.value = { code: error.value }
    error.value = ''
    form.code = ''
    focusField('#reset-code')
  }
}

const changeEmail = () => {
  step.value = 'request'
  form.code = ''
  fieldErrors.value = {}
  notice.value = ''
  error.value = ''
  focusField('#forgot-email')
}

// พิมพ์แก้ช่องไหน ลบ error ของช่องนั้น (ล้างรหัสโดยระบบหลังกรอกผิดไม่นับ เพื่อให้ error ยังอยู่)
watch(() => form.email, () => { delete fieldErrors.value.email }, { flush: 'sync' })
watch(() => form.code, (value) => { if (value) delete fieldErrors.value.code }, { flush: 'sync' })
watch(() => form.password, () => { delete fieldErrors.value.password }, { flush: 'sync' })
watch(() => form.confirm, () => { delete fieldErrors.value.confirm }, { flush: 'sync' })

onMounted(() => {
  // มาจากหน้าเข้าสู่ระบบ: กรอกอีเมลที่พิมพ์ไว้ให้ (ส่งผ่าน state ไม่ใส่ใน URL)
  const fromLogin = useState('auth-forgot-email', () => '')
  if (fromLogin.value) {
    form.email = fromLogin.value
    fromLogin.value = ''
  }
  focusField('#forgot-email')
})

onBeforeUnmount(() => clearInterval(countdown))
</script>

<template>
  <AuthMobileLayout
    v-if="isMobile"
    title-id="forgot-title"
    :title="t('auth.forgotTitle')"
    :tagline="t('auth.forgotTagline')"
  >
    <ForgotPasswordForm
      :step="step"
      :form="form"
      :field-errors="fieldErrors"
      :error="error"
      :notice="notice"
      :loading="loading"
      :resending="resending"
      :resend-seconds="resendSeconds"
      @request="submitRequest"
      @reset="submitReset"
      @resend="resend"
      @change-email="changeEmail"
    />
    <template #footer>
      <p class="auth-switch"><NuxtLink :to="loginTo">{{ t('auth.backToLogin') }}</NuxtLink></p>
    </template>
  </AuthMobileLayout>
  <AuthDesktopLayout
    v-else
    title-id="forgot-title"
    :title="t('auth.forgotTitle')"
    :intro="t('auth.forgotTagline')"
    :hero-text="t('auth.loginHeroText')"
  >
    <ForgotPasswordForm
      :step="step"
      :form="form"
      :field-errors="fieldErrors"
      :error="error"
      :notice="notice"
      :loading="loading"
      :resending="resending"
      :resend-seconds="resendSeconds"
      @request="submitRequest"
      @reset="submitReset"
      @resend="resend"
      @change-email="changeEmail"
    />
    <p class="auth-switch"><NuxtLink :to="loginTo">{{ t('auth.backToLogin') }}</NuxtLink></p>
  </AuthDesktopLayout>
</template>
