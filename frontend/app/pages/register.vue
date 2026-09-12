<script setup>
import DesktopView from '~/components/pages/register/Desktop.vue'
import MobileView from '~/components/pages/register/Mobile.vue'

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
    validationError.value = 'กรุณากรอกข้อมูลให้ครบถ้วน'
    return
  }
  if (form.value.password.length < 8) {
    validationError.value = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
    return
  }
  if (!acceptTerms.value) {
    validationError.value = 'กรุณายอมรับเงื่อนไขการใช้งาน'
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
