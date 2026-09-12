// composables/useAuth.js
// -------------------------------------------------------------------------
// Business Logic: Authentication (Login / Logout / Session)
// ไม่มี UI ในนี้ — แยก Logic ออกจาก View ตาม Architecture ของโปรเจกต์
// -------------------------------------------------------------------------

export const useAuth = () => {
  const loading = ref(false)
  const error = ref('')

  // ดึง user จาก cookie (ถ้ามี)
  const getUser = () => {
    const cookie = useCookie('user')
    return cookie.value ?? null
  }

  // ตรวจว่า login อยู่หรือไม่
  const isLoggedIn = computed(() => !!getUser())

  // Login
  const login = async (form) => {
    loading.value = true
    error.value = ''

    try {
      const res = await $fetch('http://localhost:5000/users/login', {
        method: 'POST',
        body: form,
        credentials: 'include'
      })

      // เก็บ user ลง cookie (หมดอายุ 1 วัน)
      const userCookie = useCookie('user', { maxAge: 60 * 60 * 24 })
      userCookie.value = res.data

      return true
    } catch (err) {
      error.value = err?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      return false
    } finally {
      loading.value = false
    }
  }

  // Register
  const register = async (form) => {
    loading.value = true
    error.value = ''

    try {
      await $fetch('http://localhost:5000/users', {
        method: 'POST',
        body: form
      })
      return true
    } catch (err) {
      error.value = err?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
      return false
    } finally {
      loading.value = false
    }
  }

  // Logout
  const logout = () => {
    const userCookie = useCookie('user')
    userCookie.value = null
    navigateTo('/login')
  }

  return {
    loading,
    error,
    isLoggedIn,
    getUser,
    login,
    register,
    logout
  }
}
