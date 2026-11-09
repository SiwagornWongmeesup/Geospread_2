// composables/useProfile.js
// -------------------------------------------------------------------------
// ข้อมูลส่วนตัวของผู้ใช้ที่ล็อกอินอยู่ (หน้าโปรไฟล์)
// - ข้อมูลจริงมาจาก GET /users/me (ชื่อ อีเมล เบอร์ คะแนน สถานะอีเมล วันที่สมัคร จำนวนรายงาน)
// - กดบันทึก: ชื่อ นามสกุล เบอร์ LINE ID Instagram ส่งไปที่ PATCH /users/me (เก็บในฐานข้อมูล)
// - รูปโปรไฟล์ยังไม่มี API อัปโหลด จึงเก็บไว้ใน localStorage ของเครื่องนี้อย่างเดียว
// - อีเมลแก้ที่นี่ไม่ได้ (ต้องมีขั้นยืนยันอีเมลใหม่ก่อน)
// TODO: เมื่อมี API อัปโหลดรูปโปรไฟล์ ให้ส่งรูปไปที่ API แทน localStorage
// -------------------------------------------------------------------------

const STORAGE_KEY = 'geospread-profile-edits'

// ช่องที่ยังเก็บในเครื่องนี้อย่างเดียว (ยังไม่มี API)
const LOCAL_ONLY_FIELDS = ['avatarUrl']

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
    lineId: user.line_id ?? '',
    instagram: user.instagram ?? '',
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
  const { t } = useLocale()
  const profile = useState('profile-data', () => null)
  const isLoadingProfile = useState('profile-loading', () => false)
  const isSaving = ref(false)

  // cookie user เก็บได้ 2 แบบ: { user: {...} } หรือ {...} ตรงๆ
  const cookieUser = () => {
    const saved = getUser()
    return saved?.user ?? saved ?? null
  }

  // เอารูปโปรไฟล์ที่เคยเลือกไว้ในเครื่องนี้ (ของบัญชีเดียวกัน) มาใส่
  // ใช้เฉพาะช่องใน LOCAL_ONLY_FIELDS ช่องอื่นต้องมาจากฐานข้อมูลเสมอ
  // (เครื่องที่เคยเก็บชื่อ/เบอร์ไว้ตอนยังไม่มี API จะไม่เอาค่าเก่านั้นมาทับ)
  const applyStoredEdits = (baseProfile) => {
    const stored = readStoredEdits()
    if (!stored || stored.owner !== baseProfile.id) {
      return baseProfile
    }

    const result = { ...baseProfile }
    for (const field of LOCAL_ONLY_FIELDS) {
      if (field in stored.edits) {
        result[field] = stored.edits[field]
      }
    }
    return result
  }

  // เก็บรูปโปรไฟล์ไว้ในเครื่องนี้
  const saveLocalOnlyFields = (changes) => {
    const edits = {}
    for (const field of LOCAL_ONLY_FIELDS) {
      if (field in changes) {
        edits[field] = changes[field]
      }
    }
    writeStoredEdits({ owner: profile.value.id, edits })
    return edits
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

  // ข้อความ error ตอนบันทึกไม่สำเร็จ (ว่าง = ไม่มี error)
  const saveError = ref('')

  // ข้อความ error จาก API: ถ้าข้อมูลไม่ผ่านการตรวจ ใช้ข้อความของช่องแรกที่ผิด
  const getSaveErrorMessage = (error) => {
    const fieldErrors = error?.data?.errors
    if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
      return fieldErrors[0].message
    }
    if (error?.statusCode === 401) {
      return t('profilePage.errors.sessionExpired')
    }
    return t('profilePage.errors.saveFailed')
  }

  // ช่องที่ฟอร์มไม่ได้ส่งมา (เช่น ผู้ใช้ทั่วไปไม่มีช่อง LINE/Instagram) ใช้ค่าเดิม จะได้ไม่ถูกลบทิ้ง
  const pickValue = (changes, field) => {
    if (field in changes) {
      return changes[field]
    }
    return profile.value[field]
  }

  // changes: ช่องจากฟอร์มแก้ไข คืน true ถ้าบันทึกสำเร็จ
  const saveProfile = async (changes) => {
    isSaving.value = true
    saveError.value = ''
    try {
      const body = {
        name: pickValue(changes, 'name'),
        lastname: pickValue(changes, 'lastname'),
        phone: pickValue(changes, 'phone'),
        line_id: pickValue(changes, 'lineId'),
        instagram: pickValue(changes, 'instagram'),
      }
      const response = await $fetch(`${config.public.apiBase}/users/me`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
        body,
      })

      // ข้อมูลล่าสุดจากฐานข้อมูล + รูปโปรไฟล์ที่เก็บในเครื่อง
      const localEdits = saveLocalOnlyFields(changes)
      profile.value = { ...toProfile(response.data, true), ...localEdits }
      return true
    } catch (error) {
      console.error('Unable to save profile', error)
      saveError.value = getSaveErrorMessage(error)
      return false
    } finally {
      isSaving.value = false
    }
  }

  return { profile, isLoadingProfile, isSaving, saveError, loadProfile, saveProfile }
}
