import { getIncidentIconUrl } from '~/composables/useIncidentIcon'
import { getHelpRequestIcon } from '~/composables/useHelpRequestIcon'

const defaultMapCenter = [100.5018, 13.7563]
const pendingMarkerColor = '#e8333c'

const toNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const formatCoordinate = (lat, lng) => {
  const normalizedLat = toNumber(lat)
  const normalizedLng = toNumber(lng)
  if (normalizedLat === null || normalizedLng === null) return 'ยังไม่มีพิกัด'
  return `${normalizedLat.toFixed(4)}, ${normalizedLng.toFixed(4)}`
}

const formatRelativeTime = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'เมื่อสักครู่'

  const diffMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000))
  if (diffMinutes < 1) return 'เมื่อสักครู่'
  if (diffMinutes < 60) return `${diffMinutes} นาทีที่แล้ว`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`

  const diffDays = Math.round(diffHours / 24)
  return `${diffDays} วันที่แล้ว`
}

const formatImpactRadius = (radiusMeters) => {
  const radius = toNumber(radiusMeters)
  if (!radius || radius <= 0) return 'ไม่ระบุ'
  if (radius >= 1000) return `${(radius / 1000).toFixed(radius % 1000 === 0 ? 0 : 1)} กม.`
  return `${Math.round(radius)} ม.`
}

const formatDistanceFromUser = (lat, lng, userLocation) => {
  const incidentLat = toNumber(lat)
  const incidentLng = toNumber(lng)
  const userLat = toNumber(userLocation?.lat)
  const userLng = toNumber(userLocation?.lng)

  if ([incidentLat, incidentLng, userLat, userLng].some((value) => value === null)) return null

  const toRadians = (degrees) => (degrees * Math.PI) / 180
  const latitudeDifference = toRadians(incidentLat - userLat)
  const longitudeDifference = toRadians(incidentLng - userLng)
  const distanceFactor = Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(toRadians(userLat)) * Math.cos(toRadians(incidentLat)) * Math.sin(longitudeDifference / 2) ** 2
  const distanceMeters = 6_371_000 * 2 * Math.atan2(Math.sqrt(distanceFactor), Math.sqrt(1 - distanceFactor))

  if (distanceMeters < 1000) return `${Math.max(10, Math.round(distanceMeters / 10) * 10)} ม. จากคุณ`
  return `${(distanceMeters / 1000).toFixed(distanceMeters < 10_000 ? 1 : 0)} กม. จากคุณ`
}

const toneFromColor = (color, fallback = 'blue') => {
  const normalized = String(color || '').trim().toLowerCase()
  if (normalized.includes('red')) return 'red'
  if (normalized.includes('orange')) return 'orange'
  if (normalized.includes('green')) return 'green'

  const hex = normalized.match(/^#?([0-9a-f]{6})$/)?.[1]
  if (hex) {
    const red = Number.parseInt(hex.slice(0, 2), 16)
    const green = Number.parseInt(hex.slice(2, 4), 16)
    const blue = Number.parseInt(hex.slice(4, 6), 16)

    if (red >= green && red >= blue) return red - green > 35 ? 'red' : 'orange'
    if (green >= red && green >= blue) return 'green'
    return 'blue'
  }

  return fallback
}

const getFirstImageUrl = (item) => {
  if (item.image_url) return item.image_url

  const firstImage = Array.isArray(item.media)
    ? item.media.find((media) => media?.media_type === 'image' && media?.media_url)
    : null

  return firstImage?.media_url || item.media_url || item.thumbnail_url || null
}

const withoutStatusSuffix = (title, fallback) => {
  const cleanedTitle = String(title || '')
    .replace(/\s*[—–-]\s*(รอตรวจสอบ|ยืนยันแล้ว|กำลังดำเนินการ|pending|verified)\s*$/iu, '')
    .trim()

  return cleanedTitle || fallback
}

const normalizeIncident = (incident) => {
  const hasFinalType = Boolean(incident.final_type_id)
  const markerColor = hasFinalType ? incident.marker_color || '#1479ef' : pendingMarkerColor
  const reportCount = Number(incident.report_count) || 1
  const isVerified = incident.verification_status === 'verified'
  const statusTone = isVerified ? 'verified' : hasFinalType ? 'ongoing' : 'pending'
  const statusLabel = isVerified ? 'ยืนยันแล้ว' : hasFinalType ? 'กำลังดำเนินการ' : 'รอตรวจสอบ'

  return {
    id: `incident-${incident.incident_id}`,
    kind: 'incident',
    title: withoutStatusSuffix(incident.title, incident.type_name || 'เหตุการณ์'),
    description: incident.description,
    category: hasFinalType ? incident.type_name || 'เหตุการณ์' : 'รอตรวจสอบ',
    statusLabel,
    statusTone,
    lat: toNumber(incident.lat),
    lng: toNumber(incident.lng),
    markerColor,
    tone: toneFromColor(markerColor),
    iconName: incident.icon_name,
    iconUrl: getIncidentIconUrl({
      typeCode: incident.type_code,
      iconName: incident.icon_name,
      kind: hasFinalType ? 'incident' : 'pending_report',
    }),
    displayMode: hasFinalType ? incident.display_mode : 'marker',
    radiusM: hasFinalType ? toNumber(incident.radius_m) : null,
    radiusLabel: formatImpactRadius(hasFinalType ? incident.radius_m : null),
    reportCount,
    imageUrl: getFirstImageUrl(incident),
    reporterLabel: incident.reporter_name || 'ชุมชน',
    location: formatCoordinate(incident.lat, incident.lng),
    areaLabel: incident.location_name || incident.area_name || incident.province_name || 'พื้นที่ที่รายงาน',
    distance: `${reportCount} รายงาน`,
    time: formatRelativeTime(incident.last_reported_at),
  }
}

const normalizePendingReport = (report) => ({
  id: `report-${report.report_id}`,
  kind: 'pending_report',
  title: report.description || 'รายงานรอตรวจสอบ',
  description: report.description,
  category: 'รอตรวจสอบ',
  statusLabel: 'รอตรวจสอบ',
  statusTone: 'pending',
  lat: toNumber(report.lat),
  lng: toNumber(report.lng),
  markerColor: pendingMarkerColor,
  tone: 'red',
  iconName: null,
  iconUrl: getIncidentIconUrl({ kind: 'pending_report' }),
  displayMode: 'marker',
  radiusM: null,
  radiusLabel: 'ไม่ระบุ',
  reportCount: 1,
  imageUrl: getFirstImageUrl(report),
  reporterLabel: report.reporter_name || 'ชุมชน',
  location: formatCoordinate(report.lat, report.lng),
  areaLabel: report.location_name || report.area_name || report.province_name || 'พื้นที่ที่รายงาน',
  distance: 'รายงานใหม่',
  time: formatRelativeTime(report.created_at),
})
const normalizeHelpRequest = (helpRequest) => ({
  id: `help-${helpRequest.help_request_id}`,
  kind: 'help_request',
  title: helpRequest.custom_help_type || helpRequest.help_type || 'คำขอความช่วยเหลือ',
  category: 'ขอความช่วยเหลือ',
  statusLabel: 'กำลังรอความช่วยเหลือ',
  tone: 'orange',
  iconName: null,
  displayMode: 'marker',
  radiusM: null,
  radiusLabel: 'ไม่ระบุ',
  reportCount: 1,
  distance: `${helpRequest.people_count} คนต้องการความช่วยเหลือ`,
  description: helpRequest.description,
  lat: toNumber(helpRequest.lat),
  lng: toNumber(helpRequest.lng),
  markerColor: '#f97316',
  // "other" intentionally falls back to the existing generic help icon.
  iconUrl: getHelpRequestIcon(helpRequest.help_type),
  imageUrl: null,
  reporterLabel: 'ชุมชน',
  location: formatCoordinate(helpRequest.lat, helpRequest.lng),
  areaLabel: helpRequest.location_name || helpRequest.area_name || helpRequest.province_name || 'พื้นที่ที่รายงาน',
  time: formatRelativeTime(helpRequest.created_at),
})

export const useHomeDashboard = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:5000'

  const selectedIncident = useState('home-selected-incident', () => null)
  const publicMapItems = useState('home-public-map-items', () => [])
  const userLocation = useState('home-user-location', () => null)
  const isLoadingMap = useState('home-map-loading', () => false)
  const mapError = useState('home-map-error', () => null)

  const selectIncident = (incident) => {
    selectedIncident.value = incident
  }

  const clearSelectedIncident = () => {
    selectedIncident.value = null
  }

  const setUserLocation = (location) => {
    const lat = toNumber(location?.lat)
    const lng = toNumber(location?.lng)

    if (lat === null || lng === null) return false

    userLocation.value = { lat, lng }
    return true
  }

  const fetchPublicMapItems = async () => {
    isLoadingMap.value = true
    mapError.value = null

    try {
      const response = await $fetch(`${apiBase}/incidents/map`)
      const incidents = response.data?.incidents ?? []
      //ในdataมีช่องชื่อpending_reports ไหม
      const pendingReports = response.data?.pending_reports ?? []
      const helpResponse = await $fetch(`${apiBase}/help-requests/map`)
      const helpRequests = helpResponse.data ?? []
      const mapItems = []
      //รวมเหตุการณ์
      for (const incident of incidents) {
        const normalizedIncident = normalizeIncident(incident)
        mapItems.push(normalizedIncident)
      }
      //รายงานดิบ
      for (const report of pendingReports) {
        const normalizeReport = normalizePendingReport(report)
        mapItems.push(normalizeReport)
      }

      for (const helpRequest of helpRequests) {
        const normalizedHelpRequest = normalizeHelpRequest(helpRequest)
        mapItems.push(normalizedHelpRequest)
      }

      //กรองเหตุเพื่อส่งไปmap
      publicMapItems.value = mapItems.filter((item) => {
        return item.lat !== null && item.lng !== null
      })
    } catch (error) {
      console.error('Unable to load public map incidents', error)
      mapError.value = 'โหลดข้อมูลแผนที่ไม่สำเร็จ'
      publicMapItems.value = []
    } finally {
      isLoadingMap.value = false
    }
  }

  const nearbyIncidentCards = computed(() => publicMapItems.value
    .filter((item) => item.kind === 'incident')
    .slice(0, 6)
    .map((item) => ({
      ...item,
      distanceFromUserLabel: formatDistanceFromUser(item.lat, item.lng, userLocation.value),
    })))

  const selectedIncidentPreview = computed(() => {
    if (!selectedIncident.value) return null

    return {
      ...selectedIncident.value,
      distanceFromUserLabel: formatDistanceFromUser(
        selectedIncident.value.lat,
        selectedIncident.value.lng,
        userLocation.value,
      ),
    }
  })

  const mapCenter = computed(() => {
    const focusedItem = selectedIncident.value ?? publicMapItems.value[0]
    return focusedItem?.lng !== null && focusedItem?.lat !== null && focusedItem?.lng !== undefined && focusedItem?.lat !== undefined
      ? [focusedItem.lng, focusedItem.lat]
      : defaultMapCenter
  })

  return {
    selectedIncident,
    selectedIncidentPreview,
    publicMapItems,
    userLocation,
    nearbyIncidentCards,
    isLoadingMap,
    mapError,
    mapCenter,
    selectIncident,
    clearSelectedIncident,
    setUserLocation,
    fetchPublicMapItems,
  }
}
