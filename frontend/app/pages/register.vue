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

useHead({ title: () => `${t('auth.createAccount')} | GeoSpread` })

const { register, loading, error, errorCode } = useAuth()
const router = useRouter()
const route = useRoute()

// หน้าที่ตั้งใจจะไปต่อหลังเข้าสู่ระบบ (เช่น /report-incident) ส่งต่อไปหน้า login ทุกทาง
const redirect = computed(() => (typeof route.query.redirect === 'string' ? route.query.redirect : null))
const loginTo = computed(() => (redirect.value ? { path: '/login', query: { redirect: redirect.value } } : '/login'))

const form = ref({
  name: '',
  email: '',
  password: ''
})

const acceptTerms = ref(false)

// Validation ฝั่ง client: error ของแต่ละช่อง แสดงใต้ช่องนั้น (error จาก API แสดงด้านบนฟอร์ม ยกเว้นอีเมลซ้ำ)
const fieldErrors = ref({})
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validate = () => {
  const errors = {}
  const email = form.value.email.trim()
  if (!form.value.name.trim()) errors.name = t('auth.nameRequired')
  if (!email) errors.email = t('auth.emailRequired')
  else if (!emailPattern.test(email)) errors.email = t('auth.emailInvalid')
  if (!form.value.password) errors.password = t('auth.passwordRequired')
  else if (form.value.password.length < 8) errors.password = t('auth.passwordTooShort')
  if (!acceptTerms.value) errors.terms = t('auth.acceptTermsRequired')
  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

// พิมพ์แก้ช่องไหน ให้ลบ error ของช่องนั้นออก (sync = ลบทันทีตอนพิมพ์ ไม่ไปลบ error ที่เพิ่งตรวจตอนกดส่ง)
for (const key of ['name', 'email', 'password']) {
  watch(() => form.value[key], () => { delete fieldErrors.value[key] }, { flush: 'sync' })
}
watch(acceptTerms, () => { delete fieldErrors.value.terms }, { flush: 'sync' })

const focusField = async (selector) => {
  await nextTick()
  document.querySelector(selector)?.focus()
}

// อีเมลซ้ำ: แสดงใต้ช่องอีเมลพร้อมลิงก์ไปหน้าเข้าสู่ระบบ แทนกล่องด้านบน
const emailTaken = computed(() => errorCode.value === 'emailTaken' && !fieldErrors.value.email)
const topError = computed(() => (errorCode.value === 'emailTaken' ? '' : error.value))
watch(() => form.value.email, () => {
  if (errorCode.value === 'emailTaken') errorCode.value = ''
}, { flush: 'sync' })

// สมัครเสร็จ: ฝากอีเมลไว้ให้หน้ายืนยันอีเมล (ใช้ state แทน URL เพื่อไม่ให้อีเมลไปอยู่ในประวัติเบราว์เซอร์)
const { setEmail: setVerificationEmail } = useVerificationEmail()
const verifyTo = computed(() => (redirect.value ? { path: '/verify-email', query: { redirect: redirect.value } } : '/verify-email'))

const handleRegister = async () => {
  if (!validate()) {
    // ย้ายไปช่องแรกที่ผิด โปรแกรมอ่านหน้าจอจะอ่านชื่อช่องพร้อม error ให้ทีเดียว
    focusField('[aria-invalid="true"]')
    return
  }

  const result = await register(form.value)
  if (result.ok) {
    setVerificationEmail(form.value.email.trim(), { emailSent: result.emailSent, retryAfterSeconds: result.retryAfterSeconds })
    router.push(verifyTo.value)
  } else if (errorCode.value === 'emailTaken') {
    focusField('input[type="email"]')
  }
}

</script>

<template>
  <MobileView
    v-if="isMobile"
    :form="form"
    :loading="loading"
    :error="topError"
    :field-errors="fieldErrors"
    :email-taken="emailTaken"
    :login-to="loginTo"
    :accept-terms="acceptTerms"
    @update:accept-terms="acceptTerms = $event"
    @submit-register="handleRegister"
  />
  <DesktopView
    v-else
    :form="form"
    :loading="loading"
    :error="topError"
    :field-errors="fieldErrors"
    :email-taken="emailTaken"
    :login-to="loginTo"
    :accept-terms="acceptTerms"
    @update:accept-terms="acceptTerms = $event"
    @submit-register="handleRegister"
  />
</template>
