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
  const setCurrentLocation = ({ lat, lng, accuracyM = null }) => {
    const normalizedLat = Number(lat)
    const normalizedLng = Number(lng)

    if (!Number.isFinite(normalizedLat) || !Number.isFinite(normalizedLng)) return false

    const location = {
      lat: normalizedLat,
      lng: normalizedLng,
      accuracyM: Number.isFinite(Number(accuracyM)) ? Number(accuracyM) : null,
      capturedAt: new Date().toISOString(),
    }

    // ผู้ใช้กดใช้ "ตำแหน่งปัจจุบัน" เพื่อระบุจุดเกิดเหตุ จึงตั้งสองตำแหน่งเท่ากัน
    reporterLocation.value = location
    incidentLocation.value = { ...location }

    return true
  }

  return {
    userSelectedTypeId,
    userSelectedType,
    incidentLocation,
    reporterLocation,
    selectUserSelectedType,
    clearUserSelectedType,
    setCurrentLocation,
  }
}
