// อีเมลที่กำลังรอยืนยัน: ส่งจากหน้าสมัคร/เข้าสู่ระบบไปหน้า /verify-email
// เก็บใน state และ sessionStorage (รีเฟรชหน้าแล้วยังอยู่) แต่ไม่ใส่ใน URL เพื่อไม่ให้อีเมลไปอยู่ในประวัติเบราว์เซอร์
const STORAGE_KEY = 'geospread-verify-email'

export const useVerificationEmail = () => {
  const email = useState('auth-verify-email', () => '')
  // ผลการส่งรหัสครั้งแรกจากหน้าสมัคร: { emailSent, retryAfterSeconds } หรือ null = หน้ายืนยันต้องขอรหัสเอง
  const delivery = useState('auth-verify-delivery', () => null)

  const setEmail = (value, sendResult = null) => {
    email.value = value
    delivery.value = sendResult
    try {
      sessionStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* เปิดแบบส่วนตัว/บล็อก storage: ใช้แค่ state */
    }
  }

  const restoreEmail = () => {
    if (!email.value) {
      try {
        email.value = sessionStorage.getItem(STORAGE_KEY) || ''
      } catch {
        /* ไม่มี storage ให้กรอกอีเมลเองในหน้า */
      }
    }
    return email.value
  }

  const clearEmail = () => {
    email.value = ''
    delivery.value = null
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ไม่มี storage */
    }
  }

  return { email, delivery, setEmail, restoreEmail, clearEmail }
}
