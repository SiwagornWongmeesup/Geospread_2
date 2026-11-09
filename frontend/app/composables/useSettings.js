// composables/useSettings.js
// -------------------------------------------------------------------------
// การตั้งค่าของผู้ใช้ (หน้าตั้งค่า)
// ตอนนี้ยังไม่มี API: ใช้ค่าจำลอง (mock) แล้วเก็บที่เปลี่ยนไว้ใน localStorage
// TODO: เมื่อ backend พร้อม เปลี่ยน loadSettings เป็น GET /users/me/settings
//       และ updateSetting เป็น PATCH /users/me/settings — ฝั่ง UI ไม่ต้องแก้
// ภาษาไม่ได้เก็บที่นี่ ใช้ useLocale (เก็บใน cookie อยู่แล้ว)
// -------------------------------------------------------------------------

const STORAGE_KEY = 'geospread-settings-mock'

export const defaultSettings = {
  notifyNearbyIncidents: true,
  notifyHelpRequests: true,
  notifyReportUpdates: true,
  notifyEmail: false,
  // รัศมีแจ้งเตือนเหตุใกล้ตัว (เมตร)
  notifyRadius: 5000,
  showNameOnReports: false,
}

export const radiusOptions = [1000, 5000, 10000, 25000]

const readStored = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

const writeStored = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // เก็บไม่ได้ (เช่น โหมดไม่ระบุตัวตน) ค่ายังอยู่จนกว่าจะรีเฟรช
  }
}

export const useSettings = () => {
  const settings = useState('user-settings', () => ({ ...defaultSettings }))

  // เรียกหลัง mount เท่านั้น (localStorage ไม่มีตอน SSR)
  const loadSettings = () => {
    // เริ่มจากค่าตั้งต้น แล้วเอาค่าที่เคยเปลี่ยนไว้มาทับ
    const storedSettings = readStored()
    if (storedSettings) {
      settings.value = { ...defaultSettings, ...storedSettings }
    } else {
      settings.value = { ...defaultSettings }
    }
  }

  const updateSetting = (key, value) => {
    settings.value = { ...settings.value, [key]: value }
    writeStored(settings.value)
  }

  return { settings, loadSettings, updateSetting }
}
