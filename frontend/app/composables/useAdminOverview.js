// composables/useAdminOverview.js
// -------------------------------------------------------------------------
// ข้อมูลแดชบอร์ดผู้ดูแลระบบ (/admin) จาก GET /incidents/admin/overview (เฉพาะ admin)
// เก็บข้อมูลดิบไว้ หน้าจอเป็นคนแปลงเป็นข้อความตามภาษาที่เลือก
// -------------------------------------------------------------------------

export const useAdminOverview = () => {
  const config = useRuntimeConfig()
  const { getToken } = useAuth()

  const overview = useState('admin-overview', () => null)
  const isLoading = useState('admin-overview-loading', () => false)
  // ข้อความ error เป็น key ของไฟล์ภาษา ('' = ไม่มี error)
  const errorKey = useState('admin-overview-error', () => '')

  const loadOverview = async () => {
    isLoading.value = true
    errorKey.value = ''

    try {
      const response = await $fetch(`${config.public.apiBase}/incidents/admin/overview`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      overview.value = response.data
    } catch (error) {
      console.error('Unable to load admin overview', error)
      // 401/403 = ไม่ได้ล็อกอินเป็นแอดมิน, อื่น ๆ = โหลดไม่สำเร็จ
      const status = error?.statusCode ?? error?.status
      if (status === 401 || status === 403) {
        errorKey.value = 'adminDashboard.forbidden'
      } else {
        errorKey.value = 'adminDashboard.loadFailed'
      }
    } finally {
      isLoading.value = false
    }
  }

  return { overview, isLoading, errorKey, loadOverview }
}
