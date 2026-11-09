// composables/useProfile.js
// -------------------------------------------------------------------------
// ข้อมูลส่วนตัวของผู้ใช้ที่ล็อกอินอยู่ (หน้าโปรไฟล์)
// - ข้อมูลจริงมาจาก GET /users/me (ชื่อ อีเมล เบอร์ คะแนน สถานะอีเมล วันที่สมัคร จำนวนรายงาน)
// - การแก้ไขยังไม่มี API (PATCH /users/me) จึงเก็บเฉพาะช่องที่แก้ไว้ใน localStorage ของเครื่องนี้
//   แล้วเอามาทับข้อมูลจริง (ช่องที่ไม่ได้แก้ยังเป็นค่าจริงจากฐานข้อมูลเสมอ)
// TODO: เมื่อมี PATCH /users/me ให้ saveProfile ส่งไปที่ API แทน localStorage
// -------------------------------------------------------------------------

const STORAGE_KEY = 'geospread-profile-edits'

// ช่องที่ผู้ใช้แก้ได้ในหน้าโปรไฟล์
const EDITABLE_FIELDS = ['name', 'lastname', 'phone', 'email', 'lineId', 'instagram', 'avatarUrl']

const readStoredEdits = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      return null
    }
    return JSON.parse(saved)
  } catch {
    return null
  }
}

const writeStoredEdits = (edits) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(edits))
  } catch {
    // เก็บไม่ได้ (เช่น โหมดไม่ระบุตัวตน หรือรูปใหญ่เกินพื้นที่) ข้อมูลยังอยู่จนกว่าจะรีเฟรช
  }
}

// แปลงข้อมูลเป็นรูปแบบที่หน้าจอใช้
// isLoaded = false คือยังมีแค่ข้อมูลจาก cookie (ยังไม่รู้คะแนน สถานะอีเมล จำนวนรายงาน) หน้าจอต้องไม่แสดงค่าพวกนั้น
const toProfile = (user, isLoaded) => {
  return {
    isLoaded,
    id: user.id,
    name: user.name ?? '',
    lastname: user.lastname ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    lineId: '',
    instagram: '',
    avatarUrl: user.profile ?? null,
    role: user.role ?? 'user',
    trustScore: user.trust_score ?? null,
    emailVerified: user.email_verified === true,
    createdAt: user.created_at ?? null,
    reports: {
      total: user.report_count ?? 0,
      verified: user.verified_report_count ?? 0,
      pending: user.pending_report_count ?? 0,
      rejected: user.rejected_report_count ?? 0,
    },
  }
}

export const useProfile = () => {
  const config = useRuntimeConfig()
  const { getUser, getToken } = useAuth()
  const profile = useState('profile-data', () => null)
  const isLoadingProfile = useState('profile-loading', () => false)
  const isSaving = ref(false)

  // cookie user เก็บได้ 2 แบบ: { user: {...} } หรือ {...} ตรงๆ
  const cookieUser = () => {
    const saved = getUser()
    return saved?.user ?? saved ?? null
  }

  // เอาช่องที่เคยแก้ไว้ในเครื่องนี้ (ของบัญชีเดียวกัน) มาทับข้อมูลจริง
  const applyStoredEdits = (baseProfile) => {
    const stored = readStoredEdits()
    if (!stored || stored.owner !== baseProfile.id) {
      return baseProfile
    }
    return { ...baseProfile, ...stored.edits }
  }

  const loadProfile = async () => {
    const user = cookieUser()
    if (!user) {
      profile.value = null
      return
    }

    // ระหว่างรอ API แสดงเท่าที่รู้จาก cookie ก่อน (อีเมลและสิทธิ์)
    if (!profile.value) {
      profile.value = toProfile({ id: user.id, email: user.email, role: user.role, name: user.name }, false)
    }

    // ดึงข้อมูลจริงได้เฉพาะในเบราว์เซอร์ (ต้องใช้ token)
    if (!import.meta.client) {
      return
    }

    isLoadingProfile.value = true
    try {
      const response = await $fetch(`${config.public.apiBase}/users/me`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      profile.value = applyStoredEdits(toProfile(response.data, true))
    } catch (error) {
      // โหลดไม่สำเร็จ: ยังแสดงข้อมูลจาก cookie ต่อ ไม่แต่งข้อมูลอื่นขึ้นมาเอง
      console.error('Unable to load profile', error)
    } finally {
      isLoadingProfile.value = false
    }
  }

  // changes: ช่องจากฟอร์มแก้ไข เก็บเฉพาะช่องที่แก้ได้
  const saveProfile = async (changes) => {
    isSaving.value = true
    try {
      const stored = readStoredEdits()
      let edits = {}
      if (stored && stored.owner === profile.value.id) {
        edits = { ...stored.edits }
      }
      for (const field of EDITABLE_FIELDS) {
        if (field in changes) {
          edits[field] = changes[field]
        }
      }
      writeStoredEdits({ owner: profile.value.id, edits })
      profile.value = { ...profile.value, ...edits }
      return true
    } finally {
      isSaving.value = false
    }
  }

  return { profile, isLoadingProfile, isSaving, loadProfile, saveProfile }
}
