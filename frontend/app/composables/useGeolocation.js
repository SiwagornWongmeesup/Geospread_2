import { computed, ref } from 'vue'

const getLocationErrorKey = (error) => {
  if (error?.code === 1) return 'location.errorDenied'
  if (error?.code === 2) return 'location.errorUnavailable'
  if (error?.code === 3) return 'location.errorTimeout'
  return 'location.errorGeneric'
}

// รอบแรกขอ GPS แม่น ๆ ถ้าจับสัญญาณไม่ได้ (เช่น อยู่ในอาคาร) ค่อยใช้ Wi-Fi/เสาสัญญาณ หรือตำแหน่งล่าสุดของเครื่อง
const highAccuracyOptions = { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 }
const fallbackOptions = { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60 * 1000 }
const POSITION_UNAVAILABLE = 2
const POSITION_TIMEOUT = 3
const AUTO_PROMPT_KEY = 'geospread-location-prompted'

const requestPosition = (options) => new Promise((resolve, reject) => {
  navigator.geolocation.getCurrentPosition(resolve, reject, options)
})

// granted | prompt | denied หรือ unknown เมื่อเบราว์เซอร์ไม่มี Permissions API
const getPermissionState = async () => {
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' })
    return status.state
  } catch {
    return 'unknown'
  }
}

// iPhone และเบราว์เซอร์ในแอปไม่จำสิทธิ์ถาวร ถ้าขอทุกครั้งที่เปิดหน้า ผู้ใช้จะโดนถามตลอด
// จึงขอเองแค่ตอนได้สิทธิ์แล้ว หรือครั้งแรกที่เปิดแอป ครั้งต่อไปให้ผู้ใช้กดปุ่มเอง
const shouldAutoLocate = async () => {
  const state = await getPermissionState()
  if (state === 'granted') return true
  if (state === 'denied') return false

  try {
    if (localStorage.getItem(AUTO_PROMPT_KEY)) return false
    localStorage.setItem(AUTO_PROMPT_KEY, 'true')
  } catch {
    return false
  }
  return true
}

// แยกการขอตำแหน่งออกจาก UI เพื่อให้หน้าอื่นเรียกใช้ flow เดียวกันได้
export const useGeolocation = () => {
  const isLocating = ref(false)
  const { t } = useLocale()
  // เก็บเป็น key แล้วแปลตอนแสดง เพื่อให้สลับภาษาแล้วข้อความเปลี่ยนตาม
  const locationErrorKey = ref('')
  const locationError = computed({
    get: () => (locationErrorKey.value ? t(locationErrorKey.value) : ''),
    // คอมโพเนนต์บางตัวตั้งข้อความเอง (เช่น '' เพื่อล้าง) จึงรับได้ทั้ง key และข้อความ
    set: (value) => { locationErrorKey.value = value },
  })

  const getCurrentLocation = async () => {
    locationErrorKey.value = ''

    if (!navigator.geolocation) {
      locationErrorKey.value = 'location.errorUnsupported'
      throw new Error('Geolocation is not supported')
    }

    isLocating.value = true
    try {
      const position = await requestPosition(highAccuracyOptions).catch(async (error) => {
        const canRetry = error?.code === POSITION_TIMEOUT || error?.code === POSITION_UNAVAILABLE
        // ลองรอบสองเฉพาะตอนได้สิทธิ์ถาวรแล้ว ไม่งั้นบางเบราว์เซอร์จะเด้งถามผู้ใช้ซ้ำ
        if (!canRetry || await getPermissionState() !== 'granted') throw error
        return requestPosition(fallbackOptions)
      })

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracyM: position.coords.accuracy,
        // ใช้เวลาที่เครื่องวัดจริง เพราะรอบสำรองอาจได้ตำแหน่งที่เครื่องจำไว้
        capturedAt: new Date(position.timestamp).toISOString(),
        source: 'device',
      }
    } catch (error) {
      locationErrorKey.value = getLocationErrorKey(error)
      throw error
    } finally {
      isLocating.value = false
    }
  }

  return { getCurrentLocation, shouldAutoLocate, isLocating, locationError }
}
