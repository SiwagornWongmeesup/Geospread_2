import { ref } from 'vue'

const getLocationErrorMessage = (error) => {
  if (error?.code === 1) return 'ไม่ได้รับอนุญาตให้เข้าถึงตำแหน่ง กรุณาอนุญาตในเบราว์เซอร์แล้วลองอีกครั้ง'
  if (error?.code === 2) return 'ยังระบุตำแหน่งไม่ได้ ลองขยับไปจุดที่มีสัญญาณดีขึ้นแล้วลองอีกครั้ง'
  if (error?.code === 3) return 'ใช้เวลาค้นหาตำแหน่งนานเกินไป กรุณาลองอีกครั้ง'
  return 'ไม่สามารถอ่านตำแหน่งปัจจุบันได้ กรุณาลองอีกครั้ง'
}

// แยกการขอตำแหน่งออกจาก UI เพื่อให้หน้าอื่นเรียกใช้ flow เดียวกันได้
export const useGeolocation = () => {
  const isLocating = ref(false)
  const locationError = ref('')

  const getCurrentLocation = () => new Promise((resolve, reject) => {
    locationError.value = ''

    if (!navigator.geolocation) {
      const error = new Error('เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง')
      locationError.value = error.message
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
        locationError.value = getLocationErrorMessage(error)
        reject(error)
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    )
  })

  return { getCurrentLocation, isLocating, locationError }
}
