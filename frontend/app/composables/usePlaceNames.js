// แปลงพิกัดของเหตุการณ์เป็นชื่อสถานที่ด้วย Mapbox Geocoding แบบชั่วคราว (reverse)
// เงื่อนไขของ Mapbox: ผลแบบชั่วคราวใช้แสดงบนหน้าเว็บได้ แต่ห้ามบันทึกลง database
// จึงจำชื่อไว้แค่ในหน่วยความจำของเบราว์เซอร์ รีเฟรชหน้าแล้วจะถามใหม่

// รายการที่กำลังถาม Mapbox อยู่ กันไม่ให้ถามจุดเดิมซ้ำพร้อมกัน
const placesBeingLoaded = new Set()

const askMapboxForPlaceName = async (lat, lng, mapboxToken, language) => {
  const response = await $fetch('https://api.mapbox.com/search/geocode/v6/reverse', {
    query: {
      latitude: lat,
      longitude: lng,
      language,
      // ระดับ แขวง/ตำบล, เขต/อำเภอ, จังหวัด/เมือง
      types: 'neighborhood,locality,place',
      limit: 1,
      access_token: mapboxToken,
    },
  })

  const firstPlace = response.features?.[0]
  if (!firstPlace) {
    return null
  }

  // ชื่อเต็ม เช่น "คลองเตย, กรุงเทพมหานคร" ถ้าไม่มีให้ใช้ชื่อสั้น
  const properties = firstPlace.properties || {}
  if (!properties.place_formatted) {
    return properties.name || null
  }

  // ตัด ", ประเทศไทย" / ", Thailand" ท้ายชื่อออก เพราะทุกเหตุการณ์อยู่ในไทยอยู่แล้ว และการ์ดมีพื้นที่น้อย
  const areaName = properties.place_formatted.replace(/,?\s*(ประเทศไทย|Thailand)$/, '')
  if (!areaName) {
    return properties.name || null
  }
  return `${properties.name}, ${areaName}`
}

export const usePlaceNames = () => {
  const config = useRuntimeConfig()
  const mapboxToken = config.public.mapboxToken
  const { t, locale } = useLocale()
  // ชื่อสถานที่แยกตามภาษา เพื่อให้สลับภาษาแล้วได้ชื่อภาษานั้น
  const placeKey = (incident) => `${locale.value}:${incident.id}`

  // ชื่อสถานที่ที่ได้แล้ว แยกตาม id ของเหตุการณ์ ใช้ร่วมกันทั้งหน้าคอมและมือถือ
  const placeNames = useState('nearby-place-names', () => ({}))

  // ถามชื่อสถานที่ของเหตุการณ์ที่ยังไม่มีชื่อ
  const loadPlaceNames = async (incidents) => {
    if (!mapboxToken) {
      return
    }

    for (const incident of incidents) {
      const key = placeKey(incident)
      const alreadyHasName = Boolean(placeNames.value[key])
      const isLoading = placesBeingLoaded.has(key)
      const hasCoordinates = incident.lat !== null && incident.lng !== null

      if (alreadyHasName || isLoading || !hasCoordinates) {
        continue
      }

      placesBeingLoaded.add(key)
      try {
        const placeName = await askMapboxForPlaceName(incident.lat, incident.lng, mapboxToken, locale.value)
        if (placeName) {
          placeNames.value[key] = placeName
        }
      } catch (error) {
        // ถ้า Mapbox ตอบไม่ได้ การ์ดจะแสดงข้อความสำรองแทน
        console.error('หาชื่อสถานที่จาก Mapbox ไม่สำเร็จ', error)
      } finally {
        placesBeingLoaded.delete(key)
      }
    }
  }

  // ข้อความที่ใช้แสดงบนการ์ด: ชื่อจาก Mapbox ถ้ายังไม่มีให้ใช้ข้อความสำรอง
  const getPlaceLabel = (incident) => {
    const placeName = placeNames.value[placeKey(incident)]
    if (placeName) {
      return placeName
    }
    return incident.areaLabel || t('place.reportedArea')
  }

  return { loadPlaceNames, getPlaceLabel }
}
