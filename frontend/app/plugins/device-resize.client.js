// plugins/device-resize.client.js
// -------------------------------------------------------------------------
// Client-only Plugin: ฟัง window resize แล้วอัปเดต layout state
// ทำให้ DevTools responsive mode เปลี่ยน UI ได้แบบ real-time
// -------------------------------------------------------------------------

export default defineNuxtPlugin(() => {
  const viewMode = useState('responsive-view')

  const MOBILE_BREAKPOINT = 768 // px

  const updateLayout = () => {
    viewMode.value = window.innerWidth < MOBILE_BREAKPOINT ? 'mobile' : 'desktop'
  }

  // อัปเดตทันทีเมื่อ client load (override server-side value ด้วย actual width)
  updateLayout()

  // ฟัง resize event
  window.addEventListener('resize', updateLayout)
})
