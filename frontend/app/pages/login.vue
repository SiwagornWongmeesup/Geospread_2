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
const { login, loading, error } = useAuth()
const router = useRouter()

const form = ref({
  email: '',
  password: ''
})

// ถ้า login อยู่แล้ว redirect ไปหน้าแรก
onMounted(() => {
  const { getUser } = useAuth()
  if (getUser()) {
    router.replace('/')
  }
})

const handleLogin = async () => {
  const success = await login(form.value)
  if (success) {
    router.replace('/')
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
