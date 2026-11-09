// plugins/back-to-home.client.js
// -------------------------------------------------------------------------
// Client-only Plugin: กดย้อนกลับแล้วไปหน้าหลัก แทนที่จะออกจากเว็บ
//
// ปัญหา: คนที่เปิดลิงก์ที่แชร์มา (เช่น /incidents/5/reports/9) จะเข้ามาที่หน้านั้นเลย
// ในประวัติของ browser ไม่มีหน้าก่อนหน้าที่เป็นเว็บเรา พอกดย้อนกลับเลยออกจากเว็บไป
//
// วิธีแก้: ตอนเปิดเว็บครั้งแรก ถ้าไม่ได้เข้าที่หน้าหลัก
// ให้แทรกหน้าหลักไว้ "ข้างใต้" หน้าแรกที่เปิด กดย้อนกลับครั้งแรกจึงไปหน้าหลัก
// -------------------------------------------------------------------------

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()

  // เลือกหน้าหลักให้ตรงกับส่วนของเว็บ: หน้าแอดมินกลับไปแดชบอร์ดแอดมิน
  function getHomePath(path) {
    if (path.startsWith('/admin')) {
      return '/admin'
    }
    return '/'
  }

  // เช็กว่าหน้านี้เป็นหน้าแรกที่เปิดเข้ามา (ยังไม่มีหน้าก่อนหน้าในเว็บเรา) หรือเปล่า
  // Vue Router เก็บข้อมูลไว้ใน history.state ถ้า back เป็น null แปลว่าไม่มีหน้าก่อนหน้า
  // (ถ้ากดรีเฟรช history.state ยังอยู่ จึงไม่แทรกหน้าหลักซ้ำ)
  function isFirstPageOfVisit() {
    const state = window.history.state
    if (!state) {
      return true
    }
    if (state.back === null || state.back === undefined) {
      return true
    }
    return false
  }

  // ทำแค่ครั้งเดียวตอนเปิดเว็บ (hook นี้ถูกเรียกซ้ำทุกครั้งที่เปลี่ยนหน้า)
  let alreadyChecked = false

  function addHomeBelowCurrentPage() {
    if (alreadyChecked) {
      return
    }
    alreadyChecked = true

    const currentPath = router.currentRoute.value.fullPath
    const homePath = getHomePath(router.currentRoute.value.path)

    // อยู่หน้าหลักอยู่แล้ว: ไม่ต้องทำอะไร
    if (router.currentRoute.value.path === homePath) {
      return
    }
    if (!isFirstPageOfVisit()) {
      return
    }

    const currentState = window.history.state || {}

    // ขั้นที่ 1: เปลี่ยนรายการประวัติปัจจุบันให้เป็นหน้าหลัก (หน้าจอยังไม่เปลี่ยน)
    const homeState = {
      back: null,
      current: homePath,
      forward: currentPath,
      position: 0,
      replaced: true,
      scroll: null,
    }
    window.history.replaceState(homeState, '', homePath)

    // ขั้นที่ 2: ใส่หน้าที่เปิดอยู่กลับเข้าไปต่อท้าย โดยบอกว่าหน้าก่อนหน้าคือหน้าหลัก
    const pageState = {
      ...currentState,
      back: homePath,
      current: currentPath,
      forward: null,
      position: 1,
      replaced: false,
    }
    window.history.pushState(pageState, '', currentPath)
  }

  // รอให้หน้าแรกโหลดเสร็จก่อน (รวมถึงการ redirect ของ middleware) แล้วค่อยแทรกหน้าหลัก
  nuxtApp.hook('app:suspense:resolve', addHomeBelowCurrentPage)
})
