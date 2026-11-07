// composables/useProfile.js
// -------------------------------------------------------------------------
// ข้อมูลส่วนตัวของผู้ใช้ที่ล็อกอินอยู่ (หน้าโปรไฟล์)
// ตอนนี้ยังไม่มี API: ใช้ข้อมูลจำลอง (mock) ตั้งต้นจาก cookie user แล้วเก็บที่แก้ไว้ใน localStorage
// TODO: เมื่อ backend พร้อม เปลี่ยน loadProfile เป็น GET /users/me และ saveProfile เป็น PATCH /users/me
//       (รูปโปรไฟล์ส่งเป็น multipart แยก) ฝั่ง UI ไม่ต้องแก้ เพราะรูปแบบข้อมูลเหมือนเดิม
// -------------------------------------------------------------------------

const STORAGE_KEY = 'geospread-profile-mock'

// ค่าจำลองสำหรับช่องที่ cookie ไม่มี (เบอร์โทร คะแนนความน่าเชื่อถือ วันที่สมัคร)
const mockDefaults = {
  lastname: '',
  phone: '081-234-5678',
  lineId: '',
  instagram: '',
  avatarUrl: null,
  trustScore: 82,
  createdAt: '2026-03-14T09:00:00.000Z',
}

// กิจกรรมจำลองของผู้ใช้ (ตัวเลขสรุป + รายงานล่าสุด)
// ข้อความของรายงานอยู่ใน locales (profilePage.mockReports) เรียงตาม index เดียวกัน
// TODO: เปลี่ยนเป็น GET /users/me/activity เมื่อ backend พร้อม
export const mockActivity = {
  stats: { reports: 12, verified: 9, pending: 2, helped: 4 },
  recentReports: [
    { id: 1, index: 0, status: 'verified', icon: '/icons/Flood.svg' },
    { id: 2, index: 1, status: 'pending', icon: '/icons/Roadblock.svg' },
    { id: 3, index: 2, status: 'rejected', icon: '/icons/Alert.svg' },
  ],
}

// พื้นที่ที่ติดตามจำลอง ชื่อพื้นที่อยู่ใน locales (profilePage.mockFollowed) เรียงตาม index เดียวกัน
// TODO: เปลี่ยนเป็นข้อมูลจริงจากหน้า "พื้นที่ติดตาม" เมื่อ backend พร้อม
export const mockFollowedLocations = [
  { id: 1, index: 0, radiusKm: 2, notify: true, incidentCount: 1 },
  { id: 2, index: 1, radiusKm: 5, notify: true, incidentCount: 0 },
  { id: 3, index: 2, radiusKm: 1, notify: false, incidentCount: 3 },
]

const readStoredProfile = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

const writeStoredProfile = (profile) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch {
    // เก็บไม่ได้ (เช่น โหมดไม่ระบุตัวตน หรือรูปใหญ่เกินพื้นที่) ข้อมูลยังอยู่จนกว่าจะรีเฟรช
  }
}

// จำลองเวลาที่เรียก API ให้เห็นสถานะ "กำลังบันทึก"
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const useProfile = () => {
  const { getUser } = useAuth()
  const profile = useState('profile-data', () => null)
  const isSaving = ref(false)

  // cookie user เก็บได้ 2 แบบ: { user: {...} } หรือ {...} ตรงๆ
  const cookieUser = () => {
    const saved = getUser()
    return saved?.user ?? saved ?? null
  }

  const loadProfile = () => {
    const user = cookieUser()
    if (!user) {
      profile.value = null
      return
    }

    const base = {
      ...mockDefaults,
      id: user.id ?? null,
      name: user.name ?? '',
      lastname: user.lastname ?? mockDefaults.lastname,
      email: user.email ?? '',
      role: user.role ?? 'user',
    }

    // ข้อมูลที่เคยแก้ไว้ทับค่าตั้งต้น เฉพาะของบัญชีเดียวกัน (เทียบกับอีเมลที่ใช้ล็อกอิน เพราะอีเมลในโปรไฟล์อาจถูกแก้แล้ว)
    const stored = import.meta.client ? readStoredProfile() : null
    profile.value = stored?.owner === base.email ? { ...base, ...stored.data, role: base.role } : base
  }

  // changes: { name, lastname, phone, email, avatarUrl }
  const saveProfile = async (changes) => {
    isSaving.value = true
    try {
      await wait(600)
      profile.value = { ...profile.value, ...changes }
      writeStoredProfile({ owner: cookieUser()?.email, data: profile.value })
      return true
    } finally {
      isSaving.value = false
    }
  }

  return { profile, isSaving, loadProfile, saveProfile }
}
