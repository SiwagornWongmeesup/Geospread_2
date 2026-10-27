/**
 * Shares one device state between route middleware, the resize plugin, and
 * page controllers. Page controllers use `isMobile` to select their view.
 */
export const useResponsiveView = (options = {}) => {
  const viewMode = useState('responsive-view', () => 'desktop')
  const isMobile = computed(() => viewMode.value === 'mobile')

  if (options.syncLayout) {
    // สลับ layout เฉพาะตอนขนาดจอเปลี่ยนหลังโหลดหน้าแล้ว
    // layout ตอนโหลดครั้งแรกให้ตั้งใน middleware ของหน้าแทน (ดู pages/index.vue)
    // เพราะถ้าเรียก setPageLayout ระหว่างโหลดหน้า Nuxt จะเอา layout นี้ไปใส่ให้หน้าถัดไปด้วย
    // ทำให้หน้า login ที่ไม่มี layout ถูกครอบด้วย sidebar และ header ซ้อนกัน
    watch(isMobile, (mobile) => {
      setPageLayout(mobile ? 'mobile' : 'default')
    })
  }

  return {
    viewMode,
    isMobile
  }
}
