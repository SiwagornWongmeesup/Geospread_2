import { computed } from 'vue'
import { getIncidentGuide } from '~/data/reportIncidentGuides'

// เปลี่ยนข้อมูลจาก API ให้อยู่ในรูปแบบที่ component ใช้ โดยไม่พึ่ง catalog ใน frontend
export const toDisplayIncidentType = (incidentType) => ({
  id: incidentType.type_code,
  databaseTypeId: incidentType.type_id,
  label: incidentType.type_name,
  icon: incidentType.icon_name,
  markerColor: incidentType.marker_color,
  displayMode: incidentType.display_mode,
  defaultRadiusM: incidentType.default_radius_m,
})

export const toDisplayIncidentCategory = (category) => ({
  id: category.category_code,
  label: category.category_name,
  icon: category.icon_name,
  types: (category.types ?? []).map(toDisplayIncidentType),
})

// การจับ keyword อยู่ที่ backend/tb_incident_keywords เท่านั้น
export const getRecommendedIncidentTypes = (suggestedTypesFromApi = [], prioritizedType = null) => {
  const apiSuggestedTypes = suggestedTypesFromApi.map(toDisplayIncidentType)

  return [...new Map([prioritizedType, ...apiSuggestedTypes].filter(Boolean).map((type) => [type.id, type])).values()].slice(0, 2)
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
