import { computed, ref } from 'vue'

const getLocationErrorKey = (error) => {
  if (error?.code === 1) return 'location.errorDenied'
  if (error?.code === 2) return 'location.errorUnavailable'
  if (error?.code === 3) return 'location.errorTimeout'
  return 'location.errorGeneric'
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

  const getCurrentLocation = () => new Promise((resolve, reject) => {
    locationErrorKey.value = ''

    if (!navigator.geolocation) {
      const error = new Error('Geolocation is not supported')
      locationErrorKey.value = 'location.errorUnsupported'
      reject(error)
      return
    }

    isLocating.value = true
    navigator.geolocation.getCurrentPosition(
      (position) => {
        isLocating.value = false
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracyM: position.coords.accuracy,
          capturedAt: new Date().toISOString(),
          source: 'device',
        })
      },
      (error) => {
        isLocating.value = false
        locationErrorKey.value = getLocationErrorKey(error)
        reject(error)
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    )
  })

  return { getCurrentLocation, isLocating, locationError }
}
