import { getIncidentIconUrl } from '~/composables/useIncidentIcon'

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

const normalizeIncident = (incident) => {
  const hasFinalType = Boolean(incident.final_type_id)
  const markerColor = hasFinalType ? incident.marker_color || '#1479ef' : pendingMarkerColor
  const reportCount = Number(incident.report_count) || 1

  return {
    id: `incident-${incident.incident_id}`,
    kind: 'incident',
    sourceId: incident.incident_id,
    title: incident.title || incident.type_name || 'เหตุการณ์รอตรวจสอบ',
    description: incident.description,
    category: hasFinalType ? incident.type_name || 'เหตุการณ์' : 'รอตรวจสอบ',
    statusLabel: incident.verification_status === 'verified' ? 'ยืนยันแล้ว' : 'รอตรวจสอบ',
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
    imageUrl: incident.image_url || incident.media_url || incident.thumbnail_url || null,
    reporterLabel: incident.reporter_name || 'ชุมชน',
    location: formatCoordinate(incident.lat, incident.lng),
    distance: `${reportCount} รายงาน`,
    time: formatRelativeTime(incident.last_reported_at),
  }
}

const normalizePendingReport = (report) => ({
  id: `report-${report.report_id}`,
  kind: 'pending_report',
  sourceId: report.report_id,
  title: report.description || 'รายงานรอตรวจสอบ',
  description: report.description,
  category: 'รอตรวจสอบ',
  statusLabel: 'รอตรวจสอบ',
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
  imageUrl: report.image_url || report.media_url || report.thumbnail_url || null,
  reporterLabel: report.reporter_name || 'ชุมชน',
  location: formatCoordinate(report.lat, report.lng),
  distance: 'รายงานใหม่',
  time: formatRelativeTime(report.created_at),
})

export const useHomeDashboard = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:5000'

  const selectedIncident = useState('home-selected-incident', () => null)
  const publicMapItems = useState('home-public-map-items', () => [])
  const isLoadingMap = useState('home-map-loading', () => false)
  const mapError = useState('home-map-error', () => null)

  const selectIncident = (incident) => {
    selectedIncident.value = incident
  }

  const clearSelectedIncident = () => {
    selectedIncident.value = null
  }

  const fetchPublicMapItems = async () => {
    isLoadingMap.value = true
    mapError.value = null

    try {
      const response = await $fetch(`${apiBase}/incidents/map`)
      const incidents = response.data?.incidents ?? []
      const pendingReports = response.data?.pending_reports ?? []

      publicMapItems.value = [
        ...incidents.map(normalizeIncident),
        ...pendingReports.map(normalizePendingReport),
      ].filter((item) => item.lat !== null && item.lng !== null)
    } catch (error) {
      console.error('Unable to load public map incidents', error)
      mapError.value = 'โหลดข้อมูลแผนที่ไม่สำเร็จ'
      publicMapItems.value = []
    } finally {
      isLoadingMap.value = false
    }
  }

  const nearbyIncidentCards = computed(() => publicMapItems.value.slice(0, 6))

  const mapCenter = computed(() => {
    const focusedItem = selectedIncident.value ?? publicMapItems.value[0]
    return focusedItem?.lng !== null && focusedItem?.lat !== null && focusedItem?.lng !== undefined && focusedItem?.lat !== undefined
      ? [focusedItem.lng, focusedItem.lat]
      : defaultMapCenter
  })

  return {
    selectedIncident,
    publicMapItems,
    nearbyIncidentCards,
    isLoadingMap,
    mapError,
    mapCenter,
    selectIncident,
    clearSelectedIncident,
    fetchPublicMapItems,
  }
}
