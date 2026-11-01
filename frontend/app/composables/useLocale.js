import th from '~/locales/th'
import en from '~/locales/en'

// ระบบแปลภาษาแบบเบา: เก็บภาษาที่เลือกใน cookie เพื่อให้ SSR เรนเดอร์ภาษาเดียวกับฝั่งเบราว์เซอร์
export const locales = [
  { code: 'th', label: 'ไทย', short: 'TH' },
  { code: 'en', label: 'English', short: 'EN' },
]

const messages = { th, en }

const lookup = (dictionary, key) => key.split('.').reduce((node, part) => node?.[part], dictionary)

const interpolate = (text, params) => {
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (match, name) => (params[name] ?? match))
}

export const useLocale = () => {
  const cookie = useCookie('locale', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  // useState ทำให้ทุกคอมโพเนนต์ใช้ค่าเดียวกัน กดสลับแล้วเปลี่ยนพร้อมกันทั้งหน้า
  const locale = useState('locale', () => (messages[cookie.value] ? cookie.value : 'th'))

  // t('header.search') หรือ t('time.minutesAgo', { count: 5 })
  // ถ้าไม่มีคำแปลในภาษาที่เลือก จะใช้ภาษาไทยแทน แล้วค่อยคืน key ถ้าไม่มีเลย
  const t = (key, params) => {
    const value = lookup(messages[locale.value], key) ?? lookup(messages.th, key)
    return typeof value === 'string' ? interpolate(value, params) : key
  }

  // คืนค่าที่ไม่ใช่ข้อความ เช่น array ของขั้นตอนในคู่มือ
  const tm = (key) => lookup(messages[locale.value], key) ?? lookup(messages.th, key)

  const setLocale = (code) => {
    if (!messages[code]) return
    locale.value = code
    cookie.value = code
  }

  return { locale: readonly(locale), locales, t, tm, setLocale }
}
