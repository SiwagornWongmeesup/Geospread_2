// middleware/device.js
// -------------------------------------------------------------------------
// ตรวจจับอุปกรณ์จาก User-Agent ฝั่ง Server ผ่าน @nuxtjs/device
// เก็บค่า view mode ลง useState เพื่อให้ทุก Page Controller อ่านได้
// -------------------------------------------------------------------------

export default defineNuxtRouteMiddleware(() => {
  const { isMobile } = useDevice()

  // useState จะ hydrate ได้อย่างถูกต้องทั้งฝั่ง Server และ Client
  const viewMode = useState('responsive-view', () =>
    isMobile ? 'mobile' : 'desktop'
  )

  // อัปเดตค่าทุกครั้งที่มีการ navigate (กรณี SPA routing)
  viewMode.value = isMobile ? 'mobile' : 'desktop'
})
