// ดึงข้อความ error จากคำตอบของ API เพื่อแสดงให้ผู้ใช้เห็น
// - ข้อมูลไม่ผ่านการตรวจ (validator): ใช้ข้อความของช่องแรกที่ผิด
// - error อื่นจาก backend: ใช้ message ที่ backend ส่งมา
// - ไม่มีข้อความเลย (เช่น เน็ตหลุด): ใช้ fallback ที่ส่งเข้ามา
export const getApiErrorMessage = (error, fallback) => {
  const fieldErrors = error?.data?.errors
  if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
    return fieldErrors[0].message
  }
  if (error?.data?.message) {
    return error.data.message
  }
  return fallback
}
