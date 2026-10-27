// plugins/device-resize.client.js
// -------------------------------------------------------------------------
// Client-only Plugin: ฟัง window resize แล้วอัปเดต layout state
// ทำให้ DevTools responsive mode เปลี่ยน UI ได้แบบ real-time
// -------------------------------------------------------------------------

export default defineNuxtPlugin((nuxtApp) => {
  const viewMode = useState('responsive-view')

  const MOBILE_BREAKPOINT = 768 // px

  const updateLayout = () => {
    viewMode.value = window.innerWidth < MOBILE_BREAKPOINT ? 'mobile' : 'desktop'
  }

  // รอให้หน้าโหลด (hydrate) เสร็จก่อน แล้วค่อยเปลี่ยนตามความกว้างจอจริง
  // ถ้าเปลี่ยนก่อน layout ฝั่ง browser จะไม่ตรงกับที่ server สร้างมา (เดาจาก User-Agent)
  // ทำให้ layout ซ้อนกัน 2 ชุด และกดเปลี่ยนหน้าไม่ได้
  // (ใช้ app:suspense:resolve เพราะ Nuxt เรียกหลัง hydrate เสร็จจริง ส่วน app:mounted มาเร็วเกินไป)
  nuxtApp.hook('app:suspense:resolve', updateLayout)

  // ฟัง resize event
  window.addEventListener('resize', updateLayout)
})
