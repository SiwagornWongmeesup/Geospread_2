<script setup>
import DesktopView from '~/components/views/login/Desktop.vue'
import MobileView from '~/components/views/login/Mobile.vue'

// ---------------------------------------------------------------------------
// Login Page — Controller Layer
// ไม่มี UI ในนี้ — ส่ง State และ Handler ไปให้ View Component เท่านั้น
// ---------------------------------------------------------------------------
definePageMeta({ layout: false })

const { isMobile } = useResponsiveView()
const { t } = useLocale()

useHead({ title: () => `${t('header.login')} | GeoSpread` })

// Auth Logic จาก Composable
const { login, loading, error, errorCode, isAdmin } = useAuth()
const router = useRouter()
const route = useRoute()

// ลิงก์ไปหน้าสมัคร: ส่งหน้าที่ตั้งใจจะไปต่อ (redirect) ไปด้วย สมัครเสร็จจะได้กลับมาที่เดิม
const { setEmail: setVerificationEmail } = useVerificationEmail()

const registerTo = computed(() => (
  typeof route.query.redirect === 'string'
    ? { path: '/register', query: { redirect: route.query.redirect } }
    : '/register'
))
const redirectAfterLogin = () => {
  const redirect = route.query.redirect

  if (typeof redirect === 'string') {
    // 1. ป้องกัน Open Redirect Bypass (เพิ่มการบล็อก Backslash และอักขระแปลกปลอม)
    // - ต้องเริ่มด้วย /
    // - ห้ามตามด้วย / (ป้องกัน //hacker.com)
    // - ห้ามตามด้วย \ (ป้องกัน /\hacker.com)
    const isSafePath = redirect.startsWith('/') 
      && !redirect.startsWith('//') 
      && !redirect.startsWith('/\\') 

    if (isSafePath) {
      try {
        // 2. (Optional แต่ดีต่อ UX) ตรวจสอบผ่าน Vue Router ว่าหน้านี้มีอยู่จริงในระบบ 
        // เพื่อป้องกันยูสเซอร์โดนส่งไปหน้า 404 Not Found
        const resolvedRoute = router.resolve(redirect)
        if (resolvedRoute && resolvedRoute.matched.length > 0) {
          return redirect
        }
      } catch (e) {
        // กรณี path ผิดฟอร์แมต ให้ปล่อยผ่านไปใช้ค่า Default ด้านล่าง
      }
    }
  }

  // 3. Fallback หลักที่ปลอดภัย
  return isAdmin.value ? '/admin' : '/'
}


const form = ref({
  email: '',
  password: ''
})

// เพิ่งยืนยันอีเมลเสร็จ: หน้ายืนยันฝากอีเมลไว้ใน state (ไม่ใส่ใน URL) ให้กรอกไว้รอและแสดงข้อความสำเร็จ
const registeredEmail = useState('auth-registered-email', () => '')
const successNotice = ref('')

// ย้ายเคอร์เซอร์ไปช่องที่ต้องทำต่อ (มีช่องเดียวต่อหน้า เพราะแสดงแค่ Desktop หรือ Mobile)
const focusField = async (selector) => {
  await nextTick()
  document.querySelector(selector)?.focus()
}

// ถ้า login อยู่แล้ว redirect ไปหน้าแรก
onMounted(() => {
  const { getToken } = useAuth()
  if (getToken()) {
    router.replace(redirectAfterLogin())
    return
  }
  if (registeredEmail.value) {
    form.value.email = registeredEmail.value
    successNotice.value = t('auth.registerSuccess')
    registeredEmail.value = ''
    focusField('input[type="password"]')
  }
})

// error ของแต่ละช่อง แสดงใต้ช่องนั้น (error จาก API ยังแสดงด้านบนฟอร์ม)
const fieldErrors = ref({})
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validate = () => {
  const errors = {}
  const email = form.value.email.trim()
  if (!email) errors.email = t('auth.emailRequired')
  else if (!emailPattern.test(email)) errors.email = t('auth.emailInvalid')
  if (!form.value.password) errors.password = t('auth.passwordRequired')
  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

// พิมพ์แก้ช่องไหน ให้ลบ error ของช่องนั้นออก (sync = ลบทันทีตอนพิมพ์ ไม่ไปลบ error ที่เพิ่งตรวจตอนกดส่ง)
watch(() => form.value.email, () => { delete fieldErrors.value.email }, { flush: 'sync' })
watch(() => form.value.password, () => { delete fieldErrors.value.password }, { flush: 'sync' })

const handleLogin = async () => {
  successNotice.value = ''
  if (!validate()) {
    // ย้ายไปช่องแรกที่ผิด โปรแกรมอ่านหน้าจอจะอ่านชื่อช่องพร้อม error ให้ทีเดียว
    focusField('[aria-invalid="true"]')
    return
  }
  const success = await login(form.value)
  if (success) {
    router.replace(redirectAfterLogin())
  } else if (errorCode.value === 'invalidCredentials') {
    focusField('input[type="password"]')
  } else if (errorCode.value === 'emailNotVerified') {
    // บัญชียังไม่ยืนยันอีเมล: พาไปหน้ากรอกรหัส (หน้านั้นจะขอรหัสใหม่ให้)
    setVerificationEmail(form.value.email.trim())
    router.push(typeof route.query.redirect === 'string'
      ? { path: '/verify-email', query: { redirect: route.query.redirect } }
      : '/verify-email')
  }
}

</script>

<template>
  <MobileView
    v-if="isMobile"
    :form="form"
    :loading="loading"
    :error="error"
    :field-errors="fieldErrors"
    :success-notice="successNotice"
    :register-to="registerTo"
    @submit-login="handleLogin"
  />
  <DesktopView
    v-else
    :form="form"
    :loading="loading"
    :error="error"
    :field-errors="fieldErrors"
    :success-notice="successNotice"
    :register-to="registerTo"
    @submit-login="handleLogin"
  />
</template>
