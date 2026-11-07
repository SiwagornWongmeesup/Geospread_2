// composables/useAdminUsers.js
// -------------------------------------------------------------------------
// รายชื่อผู้ใช้ทั้งหมดสำหรับหน้าจัดการผู้ใช้ของแอดมิน (/admin/users)
// ดึงจริงจาก GET /users (เฉพาะ admin) แล้วแปลงเป็นข้อมูลที่หน้าจอใช้แสดง
// -------------------------------------------------------------------------

// เกณฑ์ระดับความน่าเชื่อถือจากคะแนน 0–100
// levelKey = ข้อความระดับ (usersTrust.levels.*), tone = สีและตัวกรอง (trusted | active | watchlist | risk)
export const getTrustLevel = (score) => {
  if (score >= 90) {
    return { levelKey: 'veryTrusted', tone: 'trusted' }
  }
  if (score >= 75) {
    return { levelKey: 'trusted', tone: 'trusted' }
  }
  if (score >= 50) {
    return { levelKey: 'normal', tone: 'active' }
  }
  if (score >= 30) {
    return { levelKey: 'watchlist', tone: 'watchlist' }
  }
  return { levelKey: 'risk', tone: 'risk' }
}

// ชื่อที่แสดง: ชื่อ + นามสกุล ถ้ายังไม่มีชื่อใช้ส่วนหน้าของอีเมล
const getDisplayName = (user) => {
  const fullName = [user.name, user.lastname].filter(Boolean).join(' ')
  if (fullName) {
    return fullName
  }
  return user.email.split('@')[0]
}

// ตัวย่อในวงกลมรูปโปรไฟล์: ตัวแรกของชื่อและนามสกุล ถ้าไม่มีใช้ตัวแรกของอีเมล
const getInitials = (user) => {
  let initials = ''
  if (user.name) {
    initials = initials + user.name.charAt(0)
  }
  if (user.lastname) {
    initials = initials + user.lastname.charAt(0)
  }
  if (!initials) {
    initials = user.email.charAt(0)
  }
  return initials.toUpperCase()
}

// แปลงผู้ใช้ 1 คนจาก API เป็นรูปแบบที่หน้าจอใช้ (ยังไม่แปลภาษา ทำในหน้าจอ)
const toUserRow = (user) => {
  const trust = Number(user.trust_score ?? 0)
  const level = getTrustLevel(trust)

  return {
    id: user.id,
    name: getDisplayName(user),
    email: user.email,
    phone: user.phone,
    initials: getInitials(user),
    role: user.role,
    emailVerified: user.email_verified === true,
    trust,
    levelKey: level.levelKey,
    tone: level.tone,
    reports: user.report_count,
    verified: user.verified_report_count,
    rejected: user.rejected_report_count,
    suspicious: user.suspicious_report_count,
    lastReportAt: user.last_report_at,
    createdAt: user.created_at,
  }
}

export const useAdminUsers = () => {
  const config = useRuntimeConfig()
  const { getToken } = useAuth()

  const users = useState('admin-users', () => [])
  const isLoading = useState('admin-users-loading', () => false)
  // ข้อความ error เป็น key ของไฟล์ภาษา ('' = ไม่มี error)
  const errorKey = useState('admin-users-error', () => '')

  const loadUsers = async () => {
    isLoading.value = true
    errorKey.value = ''

    try {
      const response = await $fetch(`${config.public.apiBase}/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const rawUsers = response.data ?? []
      users.value = rawUsers.map(toUserRow)
    } catch (error) {
      console.error('Unable to load users', error)
      // 401/403 = ไม่ได้ล็อกอินเป็นแอดมิน, อื่น ๆ = โหลดไม่สำเร็จ
      const status = error?.statusCode ?? error?.status
      if (status === 401 || status === 403) {
        errorKey.value = 'usersTrust.forbidden'
      } else {
        errorKey.value = 'usersTrust.loadFailed'
      }
      users.value = []
    } finally {
      isLoading.value = false
    }
  }

  return { users, isLoading, errorKey, loadUsers }
}
