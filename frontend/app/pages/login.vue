<script setup>
import DesktopView from '~/components/views/login/Desktop.vue'
import MobileView from '~/components/views/login/Mobile.vue'

// ---------------------------------------------------------------------------
// Login Page — Controller Layer
// ไม่มี UI ในนี้ — ส่ง State และ Handler ไปให้ View Component เท่านั้น
// ---------------------------------------------------------------------------
definePageMeta({ layout: false })

const { isMobile } = useResponsiveView()

// Auth Logic จาก Composable
const { login, loading, error, isAdmin } = useAuth()
const router = useRouter()
const route = useRoute()
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

// ถ้า login อยู่แล้ว redirect ไปหน้าแรก
onMounted(() => {
  const { getToken } = useAuth()
  if (getToken()) {
    router.replace(redirectAfterLogin())
  }
})

const handleLogin = async () => {
  const success = await login(form.value)
  if (success) {
    router.replace(redirectAfterLogin())
  }
}

</script>

<template>
  <MobileView
    v-if="isMobile"
    :form="form"
    :loading="loading"
    :error="error"
    @submit-login="handleLogin"
  />
  <DesktopView
    v-else
    :form="form"
    :loading="loading"
    :error="error"
    @submit-login="handleLogin"
  />
</template>
