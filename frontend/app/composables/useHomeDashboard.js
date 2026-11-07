import { getIncidentIconUrl } from '~/composables/useIncidentIcon'
import { getHelpRequestIcon, getHelpRequestLabel } from '~/composables/useHelpRequestIcon'

const defaultMapCenter = [100.5018, 13.7563]
const pendingMarkerColor = '#e8333c'

const toNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

// ฟังก์ชันจัดรูปแบบทั้งหมดรับ t (จาก useLocale) เพื่อให้เปลี่ยนภาษาได้ทันทีโดยไม่ต้องโหลดข้อมูลใหม่
const formatCoordinate = (lat, lng, t) => {
  const normalizedLat = toNumber(lat)
  const normalizedLng = toNumber(lng)
  if (normalizedLat === null || normalizedLng === null) return t('place.noCoordinates')
  return `${normalizedLat.toFixed(4)}, ${normalizedLng.toFixed(4)}`
}

export const formatRelativeTime = (value, t) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return t('time.justNow')

  const diffMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000))
  if (diffMinutes < 1) return t('time.justNow')
  if (diffMinutes < 60) return t('time.minutesAgo', { count: diffMinutes })

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return t('time.hoursAgo', { count: diffHours })

  // เกิน 1 วันแสดงวันที่และเวลาจริง ล็อกเขตเวลาไว้เพื่อให้ฝั่ง server กับ browser แสดงตรงกัน
  return new Intl.DateTimeFormat(t('time.dateLocale'), {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  }).format(date)
}

const formatImpactRadius = (radiusMeters, t) => {
  const radius = toNumber(radiusMeters)
  if (!radius || radius <= 0) return t('units.notSpecified')
  if (radius >= 1000) return t('units.kilometers', { value: (radius / 1000).toFixed(radius % 1000 === 0 ? 0 : 1) })
  return t('units.meters', { value: Math.round(radius) })
}

const getDistanceInMeters = (lat, lng, userLocation) => {
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

  return 6_371_000 * 2 * Math.atan2(Math.sqrt(distanceFactor), Math.sqrt(1 - distanceFactor))
}

const formatDistanceFromMeters = (distanceMeters, t) => {
  if (distanceMeters === null) return null

  if (distanceMeters < 1000) return t('units.metersFromYou', { value: Math.max(10, Math.round(distanceMeters / 10) * 10) })
  return t('units.kilometersFromYou', { value: (distanceMeters / 1000).toFixed(distanceMeters < 10_000 ? 1 : 0) })
}

const formatDistanceFromUser = (lat, lng, userLocation, t) => {
  const distanceMeters = getDistanceInMeters(lat, lng, userLocation)
  return formatDistanceFromMeters(distanceMeters, t)
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

const withoutStatusSuffix = (title, fallback) => {
  const cleanedTitle = String(title || '')
    .replace(/\s*[—–-]\s*(รอตรวจสอบ|ยืนยันแล้ว|ระบุประเภทแล้ว|กำลังดำเนินการ|pending|verified)\s*$/iu, '')
    .trim()

  return cleanedTitle || fallback
}

const normalizeIncident = (incident, t) => {
  const hasFinalType = Boolean(incident.final_type_id)
  const markerColor = hasFinalType ? incident.marker_color || '#1479ef' : pendingMarkerColor
  const reportCount = Number(incident.report_count) || 1
  const isVerified = incident.verification_status === 'verified'
  const statusTone = isVerified ? 'verified' : hasFinalType ? 'ongoing' : 'pending'
  const statusLabel = t(`status.${statusTone}`)

  return {
    // ใช้เลือกmarkerหน้าเว็ป
    id: `incident-${incident.incident_id}`,
    // ใช้เรียกapiตอนเลือกmarker
    incidentId:incident.incident_id,
    kind: 'incident',
    typeCode: hasFinalType ? incident.type_code : null,
    title: withoutStatusSuffix(incident.title, incident.type_name || t('incident.generic')),
    description: incident.description,
    category: hasFinalType ? incident.type_name || t('incident.generic') : t('status.pending'),
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
    radiusLabel: formatImpactRadius(hasFinalType ? incident.radius_m : null, t),
    reportCount,
    // รูปปกและจำนวนรูปทั้งหมด backend คำนวณมาจากทุกรายงานในเหตุการณ์นี้แล้ว
    imageUrl: incident.image_url || null,
    imageCount: Number(incident.image_count) || 0,
    reporterLabel: incident.reporter_name || t('common.community'),
    location: formatCoordinate(incident.lat, incident.lng, t),
    areaLabel: incident.location_name || incident.area_name || incident.province_name || t('place.reportedArea'),
    distance: t('units.reports', { count: reportCount }),
    time: formatRelativeTime(incident.last_reported_at, t),
    occurredAt: incident.last_reported_at || null,
  }
}

const normalizePendingReport = (report, t) => ({
  id: `report-${report.report_id}`,
  reportId: report.report_id,
  kind: 'pending_report',
  title: report.description || t('incident.pendingReport'),
  description: report.description,
  category: t('status.pending'),
  statusLabel: t('status.pending'),
  statusTone: 'pending',
  lat: toNumber(report.lat),
  lng: toNumber(report.lng),
  markerColor: pendingMarkerColor,
  tone: 'red',
  iconName: null,
  iconUrl: getIncidentIconUrl({ kind: 'pending_report' }),
  displayMode: 'marker',
  radiusM: null,
  radiusLabel: t('units.notSpecified'),
  reportCount: 1,
  imageCount: Number(report.image_count) || 0,
  reporterName: report.reporter_name || null,
  reporterLabel: report.reporter_name || t('common.community'),
  location: formatCoordinate(report.lat, report.lng, t),
  areaLabel: report.location_name || report.area_name || report.province_name || t('place.reportedArea'),
  distance: t('incident.newReport'),
  time: formatRelativeTime(report.created_at, t),
  occurredAt: report.created_at || null,
})
const normalizeHelpRequest = (helpRequest, t) => ({
  id: `help-${helpRequest.help_request_id}`,
  kind: 'help_request',
  title: helpRequest.custom_help_type || getHelpRequestLabel(helpRequest.help_type, t),
  category: t('help.category'),
  statusLabel: t('status.helpOpen'),
  tone: 'orange',
  iconName: null,
  displayMode: 'marker',
  radiusM: null,
  radiusLabel: t('units.notSpecified'),
  reportCount: 1,
  distance: t('help.peopleNeedHelp', { count: helpRequest.people_count }),
  // จำนวนคนเป็นตัวเลข ใช้แสดงใน popup ขอความช่วยเหลือ
  peopleCount: Number(helpRequest.people_count) || 1,
  description: helpRequest.description,
  lat: toNumber(helpRequest.lat),
  lng: toNumber(helpRequest.lng),
  markerColor: '#f97316',
  // "other" intentionally falls back to the existing generic help icon.
  iconUrl: getHelpRequestIcon(helpRequest.help_type),
  imageUrl: null,
  reporterLabel: t('common.community'),
  location: formatCoordinate(helpRequest.lat, helpRequest.lng, t),
  areaLabel: helpRequest.location_name || helpRequest.area_name || helpRequest.province_name || t('place.reportedArea'),
  time: formatRelativeTime(helpRequest.created_at, t),
  occurredAt: helpRequest.created_at || null,
})

// สถานะของรายงานแต่ละชิ้นใน popup (มาจาก report.report_status) — ใช้ t(`status.${tone}`) เป็นข้อความ
export const getReportStatusTone = (reportStatus) => {
  if (reportStatus === 'verified') return 'verified'
  if (reportStatus === 'rejected') return 'rejected'
  return 'pending'
}

const isSameLocalDay = (value, now = new Date()) => {
  const date = new Date(value)
  return !Number.isNaN(date.getTime()) && date.toDateString() === now.toDateString()
}

// รัศมีที่ถือว่า "รอบตัวผู้ใช้" ในแผ่นรายการหน้ามือถือ (เมตร)
  
export const useHomeDashboard = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:5000'
  const { t } = useLocale()
  const selectedIncident = useState('home-selected-incident', () => null)
  // เก็บข้อมูลดิบจาก API แล้วแปลงเป็นรายการบนแผนที่ใน computed เพื่อให้ข้อความเปลี่ยนตามภาษาที่เลือก
  const rawMapData = useState('home-raw-map-data', () => ({ incidents: [], pendingReports: [], helpRequests: [] }))
  const publicMapItems = computed(() => [
    ...rawMapData.value.incidents.map((incident) => normalizeIncident(incident, t)),
    ...rawMapData.value.pendingReports.map((report) => normalizePendingReport(report, t)),
    ...rawMapData.value.helpRequests.map((helpRequest) => normalizeHelpRequest(helpRequest, t)),
  ].filter((item) => item.lat !== null && item.lng !== null))
  const userLocation = useState('home-user-location', () => null)
  const isLoadingMap = useState('home-map-loading', () => false)
  const isLoadingIncidentDetail = useState('home-incident-detail-loading', () => false)
  const mapErrorKey = useState('home-map-error', () => null)
  const mapError = computed(() => (mapErrorKey.value ? t(mapErrorKey.value) : null))
  // เวลาที่โหลดข้อมูลแผนที่สำเร็จครั้งล่าสุด ใช้บอกความสดของข้อมูล
  const mapUpdatedAt = useState('home-map-updated-at', () => null)
  // ตัวเรียงการ์ดเหตุการณ์ใกล้คุณ: 'nearest' = ใกล้ที่สุด, 'recent' = ล่าสุด
  const nearbySort = useState('home-nearby-sort', () => 'nearest')
  // รัศมีที่ถือว่า "รอบตัวผู้ใช้" ในแผ่นรายการหน้ามือถือ (เมตร) ผู้ใช้กดเปลี่ยนได้ที่ปุ่ม 1/5/10/25 กม.
  const nearbyRadiusMeters = useState('home-nearby-radius', () => 5000)
  // ที่เก็บข้อมูลรายระเอียดของ Marker ที่กำลังกด 
  const selectedIncidentDetail = useState('home-selected-incident-detail',() => null,)

  const selectIncident = async (incident) => {
    selectedIncident.value = incident
    // เหตุการณ์ต้องเป็น incident ที่รวมแล้วไม่ใช่pending
    if (incident.kind == 'incident') {
      await fetchIncidentDetail (incident.incidentId) 
    }
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
    mapErrorKey.value = null

    try {
      const response = await $fetch(`${apiBase}/incidents/map`)
      const incidents = response.data?.incidents ?? []
      //ในdataมีช่องชื่อpending_reports ไหม
      const pendingReports = response.data?.pending_reports ?? []
      const helpResponse = await $fetch(`${apiBase}/help-requests/map`)
      const helpRequests = helpResponse.data ?? []
      // เหตุการณ์ที่รวมแล้ว + รายงานดิบที่รอตรวจ + คำขอความช่วยเหลือ (แปลงเป็นหมุดใน publicMapItems)
      rawMapData.value = { incidents, pendingReports, helpRequests }
      mapUpdatedAt.value = new Date().toISOString()
    } catch (error) {
      console.error('Unable to load public map incidents', error)
      mapErrorKey.value = 'map.loadFailed'
      rawMapData.value = { incidents: [], pendingReports: [], helpRequests: [] }
    } finally {
      isLoadingMap.value = false
    }
  }

  const nearbyIncidentCards = computed(() => {
    const cards = publicMapItems.value
      .filter((item) => item.kind === 'incident')
      
      .map((item) => {
        const distanceMeters = getDistanceInMeters(
          // ตำแหน่งจาก api
          item.lat,
          item.lng,
          // ตำแหน่งปัจจุบันจากBrowser GPS
          userLocation.value,
        )

        return {
          ...item,
          distanceMeters,
          distanceFromUserLabel: formatDistanceFromMeters(distanceMeters, t),
        }
      })

    // ล่าสุด: เรียงตามเวลารายงานล่าสุด ไม่ต้องรู้ตำแหน่งผู้ใช้
    if (nearbySort.value === 'recent') {
      cards.sort((firstCard, secondCard) => new Date(secondCard.occurredAt || 0) - new Date(firstCard.occurredAt || 0))
      return cards.slice(0, 2)
    }


    const hasUserLocation = cards.some((item) => item.distanceMeters !== null)
    //เงื่อนไขเช็คว่ามีระยะคำนวนอย่างน้อย1เหตุไหม
    if (hasUserLocation) {
      cards.sort((firstCard, secondCard) => {
        // ระยะของแต่ละเหตุการณ์จากผู้ใช้คนนั้นมาเทียบกัน
        const firstDistance = firstCard.distanceMeters ?? Number.POSITIVE_INFINITY
        const secondDistance = secondCard.distanceMeters ?? Number.POSITIVE_INFINITY
        return firstDistance - secondDistance
      })
    }

    return cards.slice(0, 2)
  })

  const withDistance = (item) => {
    const distanceMeters = getDistanceInMeters(item.lat, item.lng, userLocation.value)
    return { ...item, distanceMeters, distanceFromUserLabel: formatDistanceFromMeters(distanceMeters, t) }
  }

  const byDistanceThenRecent = (first, second) => {
    const distanceDifference = (first.distanceMeters ?? Number.POSITIVE_INFINITY)
      - (second.distanceMeters ?? Number.POSITIVE_INFINITY)
    if (distanceDifference) return distanceDifference
    return new Date(second.occurredAt || 0) - new Date(first.occurredAt || 0)
  }

  // คำขอความช่วยเหลือจริงจาก /help-requests/map เรียงจากใกล้ไปไกล
  const helpRequestCards = computed(() => publicMapItems.value
    .filter((item) => item.kind === 'help_request')
    .map(withDistance)
    .sort(byDistanceThenRecent)
    .slice(0, 3))


  // แผ่นรายการหน้ามือถือ: แสดงเฉพาะสิ่งที่เกิดขึ้น "รอบตัวผู้ใช้" (ในรัศมี nearbyRadiusMeters)
  // ยังไม่รู้ตำแหน่งผู้ใช้ = ยังบอกไม่ได้ว่าอะไรอยู่รอบตัว จึงคืนรายการว่าง (แผ่นรายการจะชวนเปิดตำแหน่ง)
  const isAroundUser = (item) => item.distanceMeters !== null && item.distanceMeters <= nearbyRadiusMeters.value

  const getItemsAroundUser = (kind) => {
    if (!userLocation.value) return []
    const items = publicMapItems.value
      .filter((item) => item.kind === kind)
      .map(withDistance)
      .filter(isAroundUser)
    // ที่ใกล้ที่สุดอยู่บนสุด
    items.sort(byDistanceThenRecent)
    return items
  }

  const sheetIncidentList = computed(() => getItemsAroundUser('incident'))
  const sheetHelpRequestList = computed(() => getItemsAroundUser('help_request'))

  // ความเคลื่อนไหวล่าสุด: รวมทุกชนิดบนแผนที่ เรียงตามเวลา
  const recentActivity = computed(() => publicMapItems.value
    .filter((item) => item.occurredAt)
    .slice()
    .sort((first, second) => new Date(second.occurredAt) - new Date(first.occurredAt))
    .slice(0, 5))

  // สรุปจากข้อมูลที่โหลดมาจริงเท่านั้น
  const todaySummary = computed(() => {
    const items = publicMapItems.value
    const incidents = items.filter((item) => item.kind === 'incident')
    return {
      verified: incidents.filter((item) => item.statusTone === 'verified').length,
      ongoing: incidents.filter((item) => item.statusTone === 'ongoing').length,
      pending: incidents.filter((item) => item.statusTone === 'pending').length
        + items.filter((item) => item.kind === 'pending_report').length,
      helpRequests: items.filter((item) => item.kind === 'help_request').length,
      reportedToday: items.filter((item) => item.kind !== 'help_request' && isSameLocalDay(item.occurredAt)).length,
      updatedLabel: mapUpdatedAt.value ? formatRelativeTime(mapUpdatedAt.value, t) : null,
    }
  })

  const selectedIncidentPreview = computed(() => {
    if (!selectedIncident.value) return null

    // หยิบรายการล่าสุดตาม id เพื่อให้ข้อความใน popup เปลี่ยนตามภาษาด้วย
    const latest = publicMapItems.value.find((item) => item.id === selectedIncident.value.id) ?? selectedIncident.value
    return {
      ...latest,
      distanceFromUserLabel: formatDistanceFromUser(latest.lat, latest.lng, userLocation.value, t),
    }
  })

  const mapCenter = computed(() => {
    const focusedItem = selectedIncident.value ?? publicMapItems.value[0]
    return focusedItem?.lng !== null && focusedItem?.lat !== null && focusedItem?.lng !== undefined && focusedItem?.lat !== undefined
      ? [focusedItem.lng, focusedItem.lat]
      : defaultMapCenter
  })

  const fetchIncidentDetail = async (incidentId) =>  {
    isLoadingIncidentDetail.value = true
    mapErrorKey.value = null
    try {
      const response = await $fetch(`${apiBase}/incidents/${incidentId}`,)
      //รายงานของคนที่อยู่ในmarkerนั้น
      selectedIncidentDetail.value = response.data
    } catch (error) {
      console.error('โหลดรายละเอียดเหตุการณ์ไม่สำเร็จ', error)
      selectedIncidentDetail.value = null
    } finally {
      isLoadingIncidentDetail.value = false
    }
  }

  return {
    selectedIncident,
    selectedIncidentPreview,
    publicMapItems,
    userLocation,
    nearbyIncidentCards,
    nearbySort,
    helpRequestCards,
    sheetIncidentList,
    sheetHelpRequestList,
    nearbyRadiusMeters,
    recentActivity,
    todaySummary,
    isLoadingMap,
    mapError,
    mapCenter,
    selectIncident,
    selectedIncidentDetail,
    clearSelectedIncident,
    setUserLocation,
    fetchPublicMapItems,
  }
}
