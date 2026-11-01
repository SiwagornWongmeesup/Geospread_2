// composables/useAuth.js
// -------------------------------------------------------------------------
// Business Logic: Authentication (Login / Logout / Session)
// ไม่มี UI ในนี้ — แยก Logic ออกจาก View ตาม Architecture ของโปรเจกต์
// -------------------------------------------------------------------------

export const useAuth = () => {
  const loading = ref(false)
  const error = ref('')
  const { t } = useLocale()

  // ดึง user จาก cookie (ถ้ามี)
  const getUser = () => {
    const cookie = useCookie('user')
    return cookie.value ?? null
  }

  // รองรับ session แบบเดิมที่ token เคยถูกเก็บรวมอยู่ใน cookie user ด้วย
  const getToken = () => {
    const tokenCookie = useCookie('auth_token')
    return tokenCookie.value ?? getUser()?.token ?? null
  }

  // ตรวจว่า login อยู่หรือไม่
  const isLoggedIn = computed(() => !!getToken())

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

      // แยกข้อมูลที่แสดงบน UI ออกจาก JWT ที่ใช้เรียก API
      const userCookie = useCookie('user', { maxAge: 60 * 60 * 24 })
      userCookie.value = { user: res.data.user }
      const tokenCookie = useCookie('auth_token', { maxAge: 60 * 60 * 24 })
      tokenCookie.value = res.data.token

      return true
    } catch (err) {
      console.log('Login Error Detail:', err?.data || err)
      if (err?.data?.message) {
        error.value = err.data.message // ถ้า Backend แจ้งชัดเจนว่ารหัสผิด ให้แสดงตามนั้น
      } else {
        // ถ้าเป็น Error อื่นๆ เช่น Server ล่ม, เน็ตหลุด ให้แสดงข้อความนี้
        error.value = t('auth.connectionError')
      }
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
      error.value = err?.data?.message || t('auth.registerError')
      return false
    } finally {
      loading.value = false
    }
  }

  // Logout
  const logout = () => {
    const userCookie = useCookie('user')
    userCookie.value = null
    const tokenCookie = useCookie('auth_token')
    tokenCookie.value = null
    navigateTo('/login')
  }

  // ตรวจว่าเป็น Admin หรือไม่
  const isAdmin = computed(() => {
    const u = getUser()
    const userData = u?.user ?? u
    return userData?.role === 'admin'
  })

  return {
    loading,
    error,
    isLoggedIn,
    isAdmin,
    getUser,
    getToken,
    login,
    register,
    logout
  }
}
