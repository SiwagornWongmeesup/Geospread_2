import { computed } from 'vue'
import { getIncidentGuide } from '~/data/reportIncidentGuides'
import { getIncidentIconUrl } from '~/composables/useIncidentIcon'

// เปลี่ยนข้อมูลจาก API ให้อยู่ในรูปแบบที่ component ใช้ โดยไม่พึ่ง catalog ใน frontend
export const toDisplayIncidentType = (incidentType) => ({
  id: incidentType.type_code,
  typeCode: incidentType.type_code,
  databaseTypeId: incidentType.type_id,
  label: incidentType.type_name,
  icon: incidentType.icon_name,
  iconName: incidentType.icon_name,
  iconUrl: getIncidentIconUrl({
    typeCode: incidentType.type_code,
    iconName: incidentType.icon_name,
  }),
  markerColor: incidentType.marker_color,
  isQuick: incidentType.is_quick,
  displayMode: incidentType.display_mode,
  defaultRadiusM: incidentType.default_radius_m,
})

export const toDisplayIncidentCategory = (category) => ({
  id: category.category_code,
  label: category.category_name,
  icon: category.icon_name,
  iconName: category.icon_name,
  iconUrl: getIncidentIconUrl({ iconName: category.icon_name }),
  types: (category.types ?? []).map(toDisplayIncidentType),
})

// ข้อมูลยังมาจาก tb_incident_keywords ผ่าน API แต่การพิมพ์แต่ละครั้งค้นหาใน cache ของหน้า Report
export const toDisplayKeywordType = (keywordType) => ({
  keyword: String(keywordType.keyword ?? ''),
  ...toDisplayIncidentType(keywordType),
})

const normalizeKeywordText = (value) => String(value ?? '').trim().toLocaleLowerCase()

// รองรับทั้ง keyword ที่พิมพ์ครบในประโยค และ prefix ของข้อความหรือคำท้ายที่กำลังพิมพ์
// โดยยังใช้ cache ฝั่งหน้าเท่านั้น ไม่ query Database ระหว่างพิมพ์
export const getRecommendedIncidentTypes = (description, cachedKeywordTypes = [], limit = 3) => {
  const normalizedDescription = normalizeKeywordText(description)
  if (normalizedDescription.length < 2) return []

  const currentWord = normalizedDescription.split(/\s+/).at(-1) ?? ''

  const recommendationsByTypeId = new Map()
  for (const keywordType of cachedKeywordTypes) {
    const keyword = normalizeKeywordText(keywordType.keyword)
    if (!keyword) continue

    const hasCompletedKeyword = normalizedDescription.includes(keyword)
    const isTypingWholeKeyword = keyword.startsWith(normalizedDescription)
    const isTypingCurrentWord = currentWord.length >= 2 && keyword.startsWith(currentWord)
    if (!hasCompletedKeyword && !isTypingWholeKeyword && !isTypingCurrentWord) continue

    const type = keywordType.databaseTypeId ? keywordType : toDisplayKeywordType(keywordType)
    if (!recommendationsByTypeId.has(type.databaseTypeId)) {
      recommendationsByTypeId.set(type.databaseTypeId, type)
    }
    if (recommendationsByTypeId.size === limit) break
  }

  return [...recommendationsByTypeId.values()]
}

export const useReportIncident = () => {
  const userSelectedType = useState('report-incident-user-selected-type', () => null)
  const incidentLocation = useState('report-incident-location', () => null)
  const reporterLocation = useState('report-incident-reporter-location', () => null)
  const userSelectedTypeId = computed(() => userSelectedType.value?.id ?? null)
  const selectUserSelectedType = (incidentType) => {
    if (!incidentType?.id || userSelectedTypeId.value === incidentType.id) {
      userSelectedType.value = null
      return
    }

    userSelectedType.value = {
      ...incidentType,
      ...getIncidentGuide(incidentType.id),
    }
  }
  const clearUserSelectedType = () => {
    userSelectedType.value = null
  }
  const normalizeLocation = ({ lat, lng, accuracyM = null, placeName = null, capturedAt = null, source = 'unknown' }) => {
    const normalizedLat = Number(lat)
    const normalizedLng = Number(lng)

    if (!Number.isFinite(normalizedLat) || !Number.isFinite(normalizedLng)) return null

    return {
      lat: normalizedLat,
      lng: normalizedLng,
      // Number(null) = 0 จึงต้องเช็ค null ก่อน ไม่งั้นจุดที่เลือกเองจะขึ้น "ความแม่นยำ 0 ม."
      accuracyM: accuracyM !== null && accuracyM !== undefined && Number.isFinite(Number(accuracyM)) ? Number(accuracyM) : null,
      placeName,
      capturedAt: capturedAt ?? new Date().toISOString(),
      source: ['device', 'map', 'unknown'].includes(source) ? source : 'unknown',
    }
  }

  const setIncidentLocation = (location) => {
    const normalizedLocation = normalizeLocation({ ...location, source: location.source ?? 'map' })
    if (!normalizedLocation) return false

    incidentLocation.value = normalizedLocation

    return true
  }

  const setReporterLocation = (location) => {
    const normalizedLocation = normalizeLocation({ ...location, source: location.source ?? 'device' })
    if (!normalizedLocation) return false

    reporterLocation.value = normalizedLocation

    return true
  }

  const restoreLocations = ({ incident = null, reporter = null } = {}) => {
    const normalize = (location) => {
      const lat = Number(location?.lat)
      const lng = Number(location?.lng)
      return Number.isFinite(lat) && Number.isFinite(lng) ? { ...location, lat, lng } : null
    }
    incidentLocation.value = normalize(incident)
    reporterLocation.value = normalize(reporter)
  }

  return {
    userSelectedTypeId,
    userSelectedType,
    incidentLocation,
    reporterLocation,
    selectUserSelectedType,
    clearUserSelectedType,
    setIncidentLocation,
    setReporterLocation,
    restoreLocations,
  }
}
