<script setup>
// หน้ารายการเหตุการณ์ (/incidents)
// ข้อมูลจริงมาจาก GET /incidents/map (ชุดเดียวกับหมุดบนแผนที่หน้าหลัก) ผ่าน useHomeDashboard
// - จอคอม: รายการด้านซ้าย + แผนที่ด้านขวา กดแถวแล้วแผนที่เลื่อนไปที่หมุดนั้น
// - มือถือ: การ์ดเรียงลงมา กด "ดูบนแผนที่" แล้วไปหน้าหลัก
import IncidentCard from '~/components/incidents/IncidentCard.vue'
import IncidentFilter from '~/components/incidents/IncidentFilter.vue'
import IncidentRow from '~/components/incidents/IncidentRow.vue'
import MapboxMap from '~/components/map/MapboxMap.vue'

const { t } = useLocale()
const route = useRoute()
const { isMobile } = useResponsiveView()

definePageMeta({
  showRightPanel: false,
})

const {
  allIncidentCards,
  userLocation,
  isLoadingMap,
  mapError,
  selectedIncident,
  selectedIncidentPreview,
  selectedIncidentDetail,
  fetchPublicMapItems,
  setUserLocation,
  setPendingMapFocus,
  selectIncident,
  clearSelectedIncident,
} = useHomeDashboard()
const { getCurrentLocation, isLocating, locationError } = useGeolocation()

// ค่าตัวกรองที่เลือก
const distanceFilter = ref('any')
const statusFilter = ref('any')

const hasLocation = computed(() => {
  if (userLocation.value) {
    return true
  }
  return false
})

// ---- กรองตามระยะทาง (กิโลเมตร) ----
// แต่ละตัวเลือกคือช่วง [ตั้งแต่, ไม่ถึง] เช่น within5 = 2–5 กม.
const distanceRanges = {
  within2: { fromKm: 0, toKm: 2 },
  within5: { fromKm: 2, toKm: 5 },
  within10: { fromKm: 5, toKm: 10 },
  over10: { fromKm: 10, toKm: Number.POSITIVE_INFINITY },
}

const matchesDistance = (incident) => {
  if (distanceFilter.value === 'any') {
    return true
  }
  // ยังไม่รู้ระยะ (ไม่รู้ตำแหน่งผู้ใช้) = ไม่กรองออก
  if (incident.distanceMeters === null) {
    return true
  }

  const range = distanceRanges[distanceFilter.value]
  const distanceKm = incident.distanceMeters / 1000
  if (distanceKm >= range.fromKm && distanceKm < range.toKm) {
    return true
  }
  return false
}

const matchesStatus = (incident) => {
  if (statusFilter.value === 'any') {
    return true
  }
  if (incident.statusTone === statusFilter.value) {
    return true
  }
  return false
}

// เหตุการณ์ที่ผ่านตัวกรองระยะทาง (ใช้นับจำนวนบนปุ่มสถานะ)
const incidentsInDistance = computed(() => {
  const result = []
  for (const incident of allIncidentCards.value) {
    if (matchesDistance(incident)) {
      result.push(incident)
    }
  }
  return result
})

// จำนวนของแต่ละสถานะ แสดงบนปุ่มกรองสถานะ
const statusCounts = computed(() => {
  const counts = { any: 0, verified: 0, ongoing: 0, pending: 0 }
  for (const incident of incidentsInDistance.value) {
    counts.any = counts.any + 1
    if (incident.statusTone in counts) {
      counts[incident.statusTone] = counts[incident.statusTone] + 1
    }
  }
  return counts
})

// เหตุการณ์ที่แสดงจริง = ผ่านทั้งระยะทางและสถานะ
const visibleIncidents = computed(() => {
  const result = []
  for (const incident of incidentsInDistance.value) {
    if (matchesStatus(incident)) {
      result.push(incident)
    }
  }
  return result
})

// มีเหตุการณ์ในระบบ แต่ตัวกรองซ่อนหมด (ใช้เลือกข้อความตอนรายการว่าง)
const isFilteredOut = computed(() => {
  if (allIncidentCards.value.length > 0 && visibleIncidents.value.length === 0) {
    return true
  }
  return false
})

const clearFilters = () => {
  distanceFilter.value = 'any'
  statusFilter.value = 'any'
}

// กดใช้ตำแหน่งของฉัน: ได้ตำแหน่งแล้วรายการจะแสดงระยะห่าง และกรองตามระยะทางได้
const locateUser = async () => {
  try {
    const location = await getCurrentLocation()
    setUserLocation(location)
    mapCenter.value = [location.lng, location.lat]
  } catch {
    // ข้อความผิดพลาดแสดงใต้ตัวกรองแล้ว (locationError)
  }
}

// ---- แผนที่ด้านขวา (จอคอม) ----

const defaultCenter = [100.5018, 13.7563]
const mapCenter = ref(defaultCenter)

// จุดเริ่มต้นของแผนที่: ตำแหน่งผู้ใช้ถ้ารู้ ไม่รู้ใช้เหตุการณ์ล่าสุด
// ตั้งครั้งเดียวตอนข้อมูลมา ไม่ขยับตามตัวกรอง แผนที่จะได้ไม่เด้งไปมา
const hasPlacedMap = ref(false)
const placeMapOnce = () => {
  if (hasPlacedMap.value) {
    return
  }
  if (userLocation.value) {
    mapCenter.value = [userLocation.value.lng, userLocation.value.lat]
    hasPlacedMap.value = true
    return
  }
  const newest = allIncidentCards.value[0]
  if (newest) {
    mapCenter.value = [newest.lng, newest.lat]
    hasPlacedMap.value = true
  }
}
watch(allIncidentCards, placeMapOnce)

// กดแถวในรายการ: เลือกเหตุการณ์ แผนที่เลื่อนไปที่หมุดและเปิดรายละเอียด
const selectRow = (incident) => {
  mapCenter.value = [incident.lng, incident.lat]
  selectIncident(incident)
}

// แถวที่เลือกอยู่ (ใช้ไฮไลต์แถว)
const selectedId = computed(() => {
  if (selectedIncident.value) {
    return selectedIncident.value.id
  }
  return null
})

// กดหมุดบนแผนที่: เลือกแถวเดียวกันในรายการ แล้วเลื่อนรายการไปให้เห็นแถวนั้น
const selectFromMap = async (item) => {
  selectIncident(item)
  await nextTick()
  const row = document.querySelector('.incidents-desktop__rows [aria-current="true"]')
  if (row) {
    row.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
}

const openReportDetail = ({ incidentId, reportId }) => {
  navigateTo(`/incidents/${incidentId}/reports/${reportId}`)
}

// กด "ดูบนแผนที่" บนการ์ด (มือถือ): กลับหน้าหลักแล้วเปิดหมุดนั้น
const showOnMap = (incident) => {
  setPendingMapFocus({ itemId: incident.id, lat: incident.lat, lng: incident.lng })
  navigateTo('/')
}

onMounted(async () => {
  // หน้านี้เป็นหน้าแม่ของ /incidents/... ด้วย โหลดรายการเฉพาะตอนอยู่หน้ารายการ
  if (route.path !== '/incidents') {
    return
  }
  // เข้าหน้านี้ใหม่ ไม่ต้องค้างเหตุการณ์ที่เลือกไว้จากหน้าอื่น
  clearSelectedIncident()
  await fetchPublicMapItems()
  placeMapOnce()
})
</script>

<template>
  <NuxtPage v-if="route.path !== '/incidents'" />

  <!-- ===== จอคอม: รายการ + แผนที่ ===== -->
  <section v-else-if="!isMobile" class="incidents-desktop">
    <div class="incidents-desktop__list-pane">
      <header class="incidents-desktop__header">
        <div>
          <h1>{{ t('pages.incidentsTitle') }}</h1>
          <p>{{ t('pages.incidents') }}</p>
        </div>
        <p v-if="!isLoadingMap && !mapError" class="incidents-desktop__count" role="status">
          {{ t('incidentsPage.count', { count: visibleIncidents.length }) }}
        </p>
      </header>

      <IncidentFilter
        v-model:distance="distanceFilter"
        v-model:status="statusFilter"
        class="incidents-desktop__filter"
        :status-counts="statusCounts"
        :has-location="hasLocation"
        :is-locating="isLocating"
        :location-error="locationError || ''"
        @locate="locateUser"
      />

      <!-- หัวคอลัมน์: ต้องตรงกับคอลัมน์ใน IncidentRow.vue -->
      <div class="incidents-desktop__columns" aria-hidden="true">
        <span></span>
        <span>{{ t('incidentsPage.columns.incident') }}</span>
        <span>{{ t('incidentsPage.columns.status') }}</span>
        <span>{{ t('incidentsPage.columns.reports') }}</span>
        <span class="incidents-desktop__column-end">{{ t('incidentsPage.columns.distance') }}</span>
      </div>

      <div class="incidents-desktop__scroll">
        <p v-if="isLoadingMap && !allIncidentCards.length" class="incidents-page__note">{{ t('incidentsPage.loading') }}</p>

        <div v-else-if="mapError" class="incidents-page__note incidents-page__note--error" role="alert">
          <span>{{ mapError }}</span>
          <button type="button" @click="fetchPublicMapItems">{{ t('incidentsPage.retry') }}</button>
        </div>

        <div v-else-if="isFilteredOut" class="incidents-page__note">
          <span>{{ t('incidentsPage.noMatch') }}</span>
          <button type="button" @click="clearFilters">{{ t('incidentsPage.clearFilters') }}</button>
        </div>

        <p v-else-if="!visibleIncidents.length" class="incidents-page__note">{{ t('incidentsPage.empty') }}</p>

        <ul v-else class="incidents-desktop__rows">
          <IncidentRow
            v-for="incident in visibleIncidents"
            :key="incident.id"
            :incident="incident"
            :is-selected="incident.id === selectedId"
            @select="selectRow"
          />
        </ul>
      </div>
    </div>

    <!-- แผนที่แสดงเฉพาะเหตุการณ์ที่ผ่านตัวกรอง -->
    <div class="incidents-desktop__map" :aria-label="t('incidentsPage.mapLabel')" role="region">
      <MapboxMap
        :center="mapCenter"
        :zoom="11"
        :map-items="visibleIncidents"
        :selected-item-id="selectedId"
        :selected-item="selectedIncidentPreview"
        :selected-incident-detail="selectedIncidentDetail"
        :popup-padding="{ top: 300, right: 32, bottom: 48, left: 32 }"
        :reporter-location="userLocation"
        class="incidents-desktop__map-canvas"
        @select-item="selectFromMap"
        @close-popup="clearSelectedIncident"
        @open-report="openReportDetail"
      />
    </div>
  </section>

  <!-- ===== มือถือ: การ์ดเรียงลงมา ===== -->
  <section v-else class="incidents-page">
    <header class="incidents-page__header">
      <div>
        <h1>{{ t('pages.incidentsTitle') }}</h1>
        <p>{{ t('pages.incidents') }}</p>
      </div>
      <p v-if="!isLoadingMap && !mapError" class="incidents-page__count" role="status">
        {{ t('incidentsPage.count', { count: visibleIncidents.length }) }}
      </p>
    </header>

    <IncidentFilter
      v-model:distance="distanceFilter"
      v-model:status="statusFilter"
      :status-counts="statusCounts"
      :has-location="hasLocation"
      :is-locating="isLocating"
      :location-error="locationError || ''"
      @locate="locateUser"
    />

    <p v-if="isLoadingMap && !allIncidentCards.length" class="incidents-page__note">{{ t('incidentsPage.loading') }}</p>

    <div v-else-if="mapError" class="incidents-page__note incidents-page__note--error" role="alert">
      <span>{{ mapError }}</span>
      <button type="button" @click="fetchPublicMapItems">{{ t('incidentsPage.retry') }}</button>
    </div>

    <div v-else-if="isFilteredOut" class="incidents-page__note">
      <span>{{ t('incidentsPage.noMatch') }}</span>
      <button type="button" @click="clearFilters">{{ t('incidentsPage.clearFilters') }}</button>
    </div>

    <p v-else-if="!visibleIncidents.length" class="incidents-page__note">{{ t('incidentsPage.empty') }}</p>

    <div v-else class="incidents-page__grid">
      <IncidentCard
        v-for="incident in visibleIncidents"
        :key="incident.id"
        :incident="incident"
        @show-on-map="showOnMap"
      />
    </div>
  </section>
</template>

<style scoped>
/* ===== จอคอม ===== */
/* รายการกับแผนที่สูงเต็มจอที่มองเห็น (หักแถบหัวด้านบน) รายการเลื่อนอยู่ข้างใน แผนที่อยู่กับที่ */
.incidents-desktop {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(360px, 5fr);
  gap: 20px;
  height: calc(100dvh - 88px - 40px);
  min-height: 560px;
  padding: 20px;
}

.incidents-desktop__list-pane {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
}

.incidents-desktop__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 24px 0;
}

.incidents-desktop__header h1 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.incidents-desktop__header p {
  margin: 4px 0 0;
  color: var(--gs-muted);
  font-size: 14px;
}

.incidents-desktop__header .incidents-desktop__count {
  margin: 0;
  color: var(--gs-ink);
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.incidents-desktop__filter {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--gs-line);
}

/* หัวคอลัมน์ ใช้ช่องเดียวกับแถว (ไอคอน · ชื่อ · สถานะ · รายงาน · ระยะ) และ padding เดียวกับแถว */
.incidents-desktop__columns {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) 128px 84px 112px;
  gap: 14px;
  padding: 10px 24px;
  border-bottom: 1px solid var(--gs-line);
  color: var(--gs-muted);
  font-size: 12px;
  font-weight: 700;
}

.incidents-desktop__column-end {
  text-align: right;
}

.incidents-desktop__scroll {
  flex: 1;
  min-height: 0;
  padding: 6px 8px 12px;
  overflow-y: auto;
  scrollbar-color: var(--gs-line-strong) transparent;
  scrollbar-width: thin;
}

.incidents-desktop__scroll .incidents-page__note {
  margin: 12px 16px;
}

.incidents-desktop__rows {
  display: grid;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.incidents-desktop__map {
  position: relative;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius);
  background: #e9e7e0;
}

.incidents-desktop__map-canvas {
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
}

/* จอคอมขนาดเล็ก (เช่น แท็บเล็ตแนวนอน): แผนที่อยู่ด้านบน รายการอยู่ด้านล่าง เลื่อนทั้งหน้า */
@media (max-width: 1100px) {
  .incidents-desktop {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: 340px auto;
    height: auto;
  }

  .incidents-desktop__map {
    grid-row: 1;
  }

  .incidents-desktop__scroll {
    overflow: visible;
  }
}

/* ===== มือถือ ===== */
.incidents-page {
  display: grid;
  align-content: start;
  gap: 20px;
  padding: 16px;
}

.incidents-page__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.incidents-page__header h1 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 24px;
}

.incidents-page__header p {
  margin: 8px 0 0;
  color: var(--gs-muted);
}

.incidents-page__header .incidents-page__count {
  margin: 0;
  color: var(--gs-ink);
  font-weight: 700;
}

.incidents-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* ข้อความสถานะ (กำลังโหลด / ผิดพลาด / ว่าง) ใช้ทั้งสองแบบ */
.incidents-page__note {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 0;
  padding: 20px;
  border: 1px dashed var(--gs-line-strong);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
  color: var(--gs-muted);
}

.incidents-page__note--error {
  border-style: solid;
  border-color: var(--gs-danger);
  color: var(--gs-danger);
}

.incidents-page__note button {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid var(--gs-line-strong);
  border-radius: 8px;
  background: var(--gs-surface);
  color: var(--gs-action);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.incidents-page__note button:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}
</style>
