// composables/useAuth.js
// -------------------------------------------------------------------------
// Business Logic: Authentication (Login / Logout / Session)
// ไม่มี UI ในนี้ — แยก Logic ออกจาก View ตาม Architecture ของโปรเจกต์
// -------------------------------------------------------------------------

export const useAuth = () => {
  const loading = ref(false)
  const error = ref('')
  // ชนิดของ error จาก server ให้หน้าเลือกแสดงใต้ช่องที่เกี่ยวข้องได้:
  // 'emailTaken' | 'invalidCredentials' | 'emailNotVerified' | 'invalidCode' | 'codeExpired' | 'tooManyAttempts' | ''
  const errorCode = ref('')
  const { t } = useLocale()
  // ที่อยู่ backend มาจาก nuxt.config.js (ในเครื่อง = localhost:5000, บนเว็บจริง = ค่า NUXT_PUBLIC_API_BASE_URL)
  const apiBase = useRuntimeConfig().public.apiBase

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
    errorCode.value = ''

    try {
      const res = await $fetch(`${apiBase}/users/login`, {
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
      // ข้อความจาก Backend เป็นภาษาไทยอย่างเดียว จึงแปลงตามรหัสสถานะแทน เพื่อให้แสดงตามภาษาที่เลือก
      if (err?.data?.code === 'EMAIL_NOT_VERIFIED') {
        errorCode.value = 'emailNotVerified'
        error.value = t('auth.emailNotVerified')
      } else if (err?.statusCode === 401 || err?.status === 401) {
        errorCode.value = 'invalidCredentials'
        error.value = t('auth.invalidCredentials')
      } else if (err?.data?.message) {
        error.value = err.data.message
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
    errorCode.value = ''

    try {
      const res = await $fetch(`${apiBase}/users`, {
        method: 'POST',
        body: form
      })
      // สมัครแล้วต้องยืนยันอีเมลต่อ: emailSent = false แปลว่าส่งอีเมลไม่สำเร็จ ให้กดส่งรหัสใหม่ในหน้ายืนยัน
      return { ok: true, emailSent: res?.data?.emailSent !== false, retryAfterSeconds: res?.data?.retryAfterSeconds ?? 0 }
    } catch (err) {
      const status = err?.statusCode ?? err?.status
      if (err?.data?.code === 'EMAIL_TAKEN') {
        errorCode.value = 'emailTaken'
        error.value = t('auth.emailTaken')
      } else if (!status) {
        error.value = t('auth.connectionError')
      } else {
        error.value = t('auth.registerError')
      }
      return { ok: false }
    } finally {
      loading.value = false
    }
  }

  // error ของรหัส 6 หลัก (ใช้ทั้งยืนยันอีเมลและลืมรหัสผ่าน) แปลงเป็นข้อความตามภาษาที่เลือก
  const setCodeError = (err) => {
    const codeMap = {
      INVALID_CODE: ['invalidCode', 'auth.invalidCode'],
      CODE_EXPIRED: ['codeExpired', 'auth.codeExpired'],
      TOO_MANY_ATTEMPTS: ['tooManyAttempts', 'auth.tooManyAttempts'],
    }
    const match = codeMap[err?.data?.code]
    if (match) {
      errorCode.value = match[0]
      const attemptsLeft = err?.data?.errors?.[0]?.attemptsLeft
      error.value = attemptsLeft ? t('auth.invalidCodeLeft', { count: attemptsLeft }) : t(match[1])
    } else if (err?.statusCode ?? err?.status) {
      errorCode.value = 'invalidCode'
      error.value = t('auth.invalidCode')
    } else {
      error.value = t('auth.connectionError')
    }
  }

  // ยืนยันอีเมลด้วยรหัส 6 หลัก
  const verifyEmail = async ({ email, code }) => {
    loading.value = true
    error.value = ''
    errorCode.value = ''

    try {
      await $fetch(`${apiBase}/users/verify-email`, { method: 'POST', body: { email, code } })
      return true
    } catch (err) {
      setCodeError(err)
      return false
    } finally {
      loading.value = false
    }
  }

  // ขอรหัสยืนยันใหม่ คืนจำนวนวินาทีที่ต้องรอก่อนขอได้อีก (null = ส่งไม่สำเร็จ)
  const resendVerification = async (email) => {
    try {
      const res = await $fetch(`${apiBase}/users/resend-verification`, { method: 'POST', body: { email } })
      return res?.data?.retryAfterSeconds ?? 60
    } catch (err) {
      error.value = err?.data?.code === 'EMAIL_SEND_FAILED' ? t('auth.emailSendFailed') : t('auth.connectionError')
      return null
    }
  }

  // ลืมรหัสผ่าน: ขอรหัส 6 หลักทางอีเมล คืนจำนวนวินาทีที่ต้องรอก่อนขอได้อีก (null = ส่งไม่สำเร็จ)
  const requestPasswordReset = async (email) => {
    loading.value = true
    error.value = ''
    errorCode.value = ''
    try {
      const res = await $fetch(`${apiBase}/users/forgot-password`, { method: 'POST', body: { email } })
      return res?.data?.retryAfterSeconds ?? 60
    } catch (err) {
      error.value = err?.data?.code === 'EMAIL_SEND_FAILED' ? t('auth.emailSendFailed') : t('auth.connectionError')
      return null
    } finally {
      loading.value = false
    }
  }

  // ตั้งรหัสผ่านใหม่ด้วยรหัส 6 หลัก
  const resetPassword = async ({ email, code, password }) => {
    loading.value = true
    error.value = ''
    errorCode.value = ''
    try {
      await $fetch(`${apiBase}/users/reset-password`, { method: 'POST', body: { email, code, password } })
      return true
    } catch (err) {
      setCodeError(err)
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
    errorCode,
    isLoggedIn,
    isAdmin,
    getUser,
    getToken,
    login,
    register,
    verifyEmail,
    resendVerification,
    requestPasswordReset,
    resetPassword,
    logout
  }
}
