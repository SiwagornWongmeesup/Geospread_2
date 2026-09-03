<script setup lang="ts">
import type { User } from '~/types/user'

// ---------------------------------------------------------------------------
// Layout Detection: อ่านค่าจาก useState ที่ middleware/device.ts set ไว้
// (middleware ถูก register เป็น global ใน nuxt.config.ts แล้ว)
// ---------------------------------------------------------------------------
const layout = useState<'mobile' | 'default'>('layout')

// เปลี่ยน layout ของ NuxtLayout ตาม device state
watchEffect(() => {
  setPageLayout(layout.value)
})

// ---------------------------------------------------------------------------
// Data State & API Fetching (Single Source of Truth — อยู่ที่ Controller เท่านั้น)
// ---------------------------------------------------------------------------
const users = ref<User[]>([])
const loading = ref(false)
const message = ref('')
const isError = ref(false)

const form = ref({
  email: '',
  password: '',
  name: '',
  phone: ''
})

// ฟังก์ชันดึง Users ทั้งหมดจาก Backend
const fetchUsers = async () => {
  try {
    const res: any = await $fetch('http://localhost:5000/users')
    if (res?.data) {
      users.value = res.data
    }
  } catch (err: any) {
    console.error('Error fetching users:', err)
  }
}

// ฟังก์ชันยิง API สร้าง User ใหม่
const handleRegister = async () => {
  loading.value = true
  message.value = ''
  isError.value = false

  try {
    const res: any = await $fetch('http://localhost:5000/users', {
      method: 'POST',
      body: form.value
    })

    isError.value = false
    message.value = `สำเร็จ! สร้างผู้ใช้ ${res.data.name || res.data.email} เรียบร้อยแล้ว`
    form.value = { email: '', password: '', name: '', phone: '' }

    await fetchUsers()
  } catch (err: any) {
    isError.value = true
    message.value = err.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
  } finally {
    loading.value = false
  }
}

// ---------------------------------------------------------------------------
// Dynamic Component Import (Lazy — โหลดเฉพาะ component ของอุปกรณ์นั้นๆ)
// ---------------------------------------------------------------------------
const pageComponent = computed(() => {
  if (layout.value === 'mobile') {
    return defineAsyncComponent(() =>
      import('~/components/pages/index/Mobile.vue')
    )
  }
  return defineAsyncComponent(() =>
    import('~/components/pages/index/Default.vue')
  )
})

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <!-- Controller Layer: ไม่มี UI โดยตรง เป็นแค่ตัวกลางส่ง Data ให้ View Component -->
  <component
    :is="pageComponent"
    :users="users"
    :loading="loading"
    :form="form"
    :message="message"
    :is-error="isError"
    @submit-register="handleRegister"
  />
</template>
