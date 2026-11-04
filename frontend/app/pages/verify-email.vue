<script setup>
// ---------------------------------------------------------------------------
// Verify Email Page — Controller Layer
// รับอีเมลที่รอยืนยันจากหน้าสมัคร/เข้าสู่ระบบ ให้กรอกรหัส 6 หลัก แล้วส่งต่อไปหน้าเข้าสู่ระบบ
// ---------------------------------------------------------------------------
import AuthDesktopLayout from '~/components/auth/AuthDesktopLayout.vue'
import AuthMobileLayout from '~/components/auth/AuthMobileLayout.vue'
import VerifyEmailForm from '~/components/auth/VerifyEmailForm.vue'

definePageMeta({ layout: false })

const { t } = useLocale()
const { isMobile } = useResponsiveView()
const route = useRoute()
const router = useRouter()
const { verifyEmail, resendVerification, loading, error, errorCode } = useAuth()
const { email, delivery, restoreEmail, clearEmail } = useVerificationEmail()

useHead({ title: () => `${t('auth.verifyTitle')} | GeoSpread` })

// หน้าที่ตั้งใจจะไปต่อหลังเข้าสู่ระบบ ส่งต่อไปหน้า login และหน้าสมัคร (กรณีกดใช้อีเมลอื่น)
const redirect = computed(() => (typeof route.query.redirect === 'string' ? route.query.redirect : null))
const withRedirect = (path) => (redirect.value ? { path, query: { redirect: redirect.value } } : path)

const emailInput = ref('')
const emailError = ref('')
const code = ref('')
const codeError = ref('')
const notice = ref('')
const resending = ref(false)
const resendSeconds = ref(0)
let countdown = null

const targetEmail = computed(() => email.value || emailInput.value.trim())

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

const resend = async () => {
  if (!targetEmail.value) {
    emailError.value = t('auth.emailRequired')
    focusField('#verify-email-address')
    return
  }
  resending.value = true
  notice.value = ''
  const seconds = await resendVerification(targetEmail.value)
  resending.value = false
  if (seconds !== null) {
    notice.value = t('auth.codeResent')
    startCountdown(seconds)
    focusField('#verify-code')
  }
}

const submit = async () => {
  emailError.value = ''
  codeError.value = ''
  if (!targetEmail.value) emailError.value = t('auth.emailRequired')
  if (code.value.length !== 6) codeError.value = t('auth.codeRequired')
  if (emailError.value || codeError.value) {
    focusField('[aria-invalid="true"]')
    return
  }

  notice.value = ''
  const ok = await verifyEmail({ email: targetEmail.value, code: code.value })
  if (ok) {
    // หน้าเข้าสู่ระบบจะกรอกอีเมลไว้ให้และแสดงข้อความยืนยันสำเร็จ
    useState('auth-registered-email').value = targetEmail.value
    clearEmail()
    router.push(withRedirect('/login'))
    return
  }

  // รหัสผิด: แสดงใต้ช่องรหัส ล้างรหัสเดิมให้พิมพ์ใหม่ (error อื่นแสดงในกล่องด้านบน)
  if (['invalidCode', 'codeExpired', 'tooManyAttempts'].includes(errorCode.value)) {
    codeError.value = error.value
    error.value = ''
    code.value = ''
    focusField('#verify-code')
  }
}

// กรอกครบ 6 หลักแล้วส่งให้เลย ไม่ต้องกดปุ่ม
watch(code, (value) => {
  // ล้าง error เฉพาะตอนผู้ใช้พิมพ์ใหม่ (ไม่ใช่ตอนระบบล้างรหัสหลังกรอกผิด)
  if (value) codeError.value = ''
  if (value.length === 6 && !loading.value) submit()
})
watch(emailInput, () => { emailError.value = '' })

onMounted(() => {
  restoreEmail()
  if (delivery.value) {
    // มาจากหน้าสมัคร: ระบบส่งรหัสไปแล้ว (หรือส่งไม่สำเร็จ ให้กดส่งใหม่)
    if (!delivery.value.emailSent) error.value = t('auth.emailSendFailed')
    startCountdown(delivery.value.retryAfterSeconds || 0)
    delivery.value = null
  } else if (email.value) {
    // มาจากหน้าเข้าสู่ระบบ (บัญชียังไม่ยืนยัน) หรือรีเฟรชหน้า: ขอรหัสให้ (ระบบไม่ส่งซ้ำถ้ายังไม่ครบ 60 วินาที)
    resend()
  }
  focusField(email.value ? '#verify-code' : '#verify-email-address')
})

onBeforeUnmount(() => clearInterval(countdown))
</script>

<template>
  <AuthMobileLayout
    v-if="isMobile"
    title-id="verify-title"
    :title="t('auth.verifyTitle')"
    :tagline="t('auth.verifyTagline')"
  >
    <VerifyEmailForm
      v-model:code="code"
      v-model:email-input="emailInput"
      :email="email"
      :email-error="emailError"
      :code-error="codeError"
      :error="error"
      :notice="notice"
      :loading="loading"
      :resending="resending"
      :resend-seconds="resendSeconds"
      :change-email-to="withRedirect('/register')"
      @submit="submit"
      @resend="resend"
    />
  </AuthMobileLayout>
  <AuthDesktopLayout
    v-else
    title-id="verify-title"
    :title="t('auth.verifyTitle')"
    :intro="t('auth.verifyTagline')"
    :hero-text="t('auth.registerHeroText')"
  >
    <VerifyEmailForm
      v-model:code="code"
      v-model:email-input="emailInput"
      :email="email"
      :email-error="emailError"
      :code-error="codeError"
      :error="error"
      :notice="notice"
      :loading="loading"
      :resending="resending"
      :resend-seconds="resendSeconds"
      :change-email-to="withRedirect('/register')"
      @submit="submit"
      @resend="resend"
    />
  </AuthDesktopLayout>
</template>
