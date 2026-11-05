// ติดตั้ง GeoSpread ลงเครื่องแบบแอป (PWA)
// - Android / คอม (Chrome, Edge): ใช้หน้าต่างติดตั้งของเบราว์เซอร์ (มาจาก event beforeinstallprompt ที่ @vite-pwa/nuxt เก็บไว้ให้)
// - iPhone / iPad (Safari): ไม่มีหน้าต่างติดตั้ง ต้องบอกวิธี "แชร์ → เพิ่มไปยังหน้าจอโฮม"
// - ติดตั้งแล้ว หรือเบราว์เซอร์ติดตั้งไม่ได้: ไม่แสดงปุ่ม

export const usePwaInstall = () => {
  const nuxtApp = useNuxtApp()
  // หน้าต่างวิธีติดตั้งบน iPhone เปิดอยู่ไหม (ใช้ร่วมกันทั้งแอป)
  const isIosHelpOpen = useState('pwa-ios-help-open', () => false)
  // ข้อมูลเครื่องอ่านได้เฉพาะฝั่งเบราว์เซอร์ ต้องรอให้หน้าโหลดเสร็จก่อน (กัน HTML จาก server ไม่ตรงกับเบราว์เซอร์)
  const isReady = ref(false)
  const isIos = ref(false)

  onMounted(() => {
    const userAgent = navigator.userAgent
    const isAppleMobile = /iPhone|iPad|iPod/.test(userAgent)
    // Chrome/Firefox บน iPhone ใช้ปุ่มแชร์แบบเดียวกับ Safari ได้ แต่แอปอื่น (LINE, Facebook) ติดตั้งไม่ได้
    const isInAppBrowser = /Line\/|FBAN|FBAV|Instagram/.test(userAgent)
    isIos.value = isAppleMobile && !isInAppBrowser
    isReady.value = true
  })

  const pwa = computed(() => nuxtApp.$pwa)

  // เปิดอยู่ในแอปที่ติดตั้งแล้ว (เปิดจากไอคอนบนหน้าจอหลัก)
  const isInstalled = computed(() => {
    if (!isReady.value) return false
    if (window.matchMedia('(display-mode: standalone)').matches) return true
    // Safari บน iPhone บอกสถานะผ่าน navigator.standalone
    if (window.navigator.standalone === true) return true
    return Boolean(pwa.value?.isPWAInstalled)
  })

  // เบราว์เซอร์พร้อมเปิดหน้าต่างติดตั้งให้ (Android / คอม)
  const canPrompt = computed(() => Boolean(pwa.value?.showInstallPrompt))

  // แสดงปุ่มติดตั้งไหม
  const canInstall = computed(() => {
    if (!isReady.value || isInstalled.value) return false
    if (canPrompt.value) return true
    return isIos.value
  })

  const install = async () => {
    if (canPrompt.value) {
      await pwa.value.install()
      return
    }
    if (isIos.value) {
      isIosHelpOpen.value = true
    }
  }

  const closeIosHelp = () => {
    isIosHelpOpen.value = false
  }

  return { canInstall, isIos, isIosHelpOpen, install, closeIosHelp }
}
