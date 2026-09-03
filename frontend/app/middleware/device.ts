// middleware/device.ts
// -------------------------------------------------------------------------
// ตรวจจับอุปกรณ์จาก User-Agent ฝั่ง Server ผ่าน @nuxtjs/device
// เก็บค่า layout ลง useState เพื่อให้ทุก Component อ่านได้
// -------------------------------------------------------------------------
export default defineNuxtRouteMiddleware(() => {
  const { isMobile } = useDevice()

  // useState จะ hydrate ได้อย่างถูกต้องทั้งฝั่ง Server และ Client
  const layout = useState<'mobile' | 'default'>('layout', () =>
    isMobile ? 'mobile' : 'default'
  )

  // อัปเดตค่าทุกครั้งที่มีการ navigate (กรณี SPA routing)
  layout.value = isMobile ? 'mobile' : 'default'
})
