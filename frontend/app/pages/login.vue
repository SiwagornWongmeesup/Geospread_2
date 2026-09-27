<script setup>
import DesktopView from '~/components/pages/login/Desktop.vue'
import MobileView from '~/components/pages/login/Mobile.vue'

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
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) return redirect
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
