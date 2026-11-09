<template>
  <div class="desktop-home">
    <section class="desktop-home__map" :aria-label="t('common.incidentMap')">
      <MapboxMap
        :center="activeMapCenter"
        :zoom="activeMapZoom"
        :map-items="publicMapItems"
        :selected-item-id="selectedIncident?.id"
        :selected-item="selectedIncidentPreview"
        :selected-incident-detail="selectedIncidentDetail"
        :popup-padding="{ top: 330, right: 32, bottom: 48, left: 32 }"
        :reporter-location="userLocation"
        class="desktop-home__map-canvas"
        @select-item="selectMapItem"
        @select-group="showGroupItems"
        @close-popup="clearSelectedIncident"
        @open-report="openReportDetail"
        @open-help-request="openHelpRequestPage"
      />
      <!-- กดกลุ่มหมุดที่ติดกัน: แสดงเหตุในกลุ่มเป็นรายการ กดรายการแล้วเปิดการ์ดบนแผนที่ -->
      <MapGroupPanel
        v-if="selectedGroupItems.length"
        :items="selectedGroupItems"
        :selected-item-id="selectedIncident?.id"
        @select="selectIncident"
        @close="clearGroupItems"
      />
      <MapLocationSearch
        :is-locating="isLocating"
        :location-error="locationError"
        @locate="focusCurrentLocation"
        @select="selectArea"
        @clear-selection="clearAreaSelection"
      />
      <div v-if="mapError" class="desktop-home__map-status">
        {{ mapError }}
      </div>
    </section>

    <NearbyIncidents
      :selected-incident-id="selectedIncident?.id"
      :incidents="nearbyIncidentCards"
      :is-loading="isLoadingMap"
      :error-message="mapError"
      :has-user-location="Boolean(userLocation)"
      :is-locating="isLocating"
      :location-error="locationError"
      @select="selectIncident"
      @request-location="focusCurrentLocation"
    />

    <div class="desktop-home__lower-grid">
      <HelpRequests />
      <RecentActivity />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import MapboxMap from '~/components/map/MapboxMap.vue'
import MapGroupPanel from '~/components/map/MapGroupPanel.vue'
import HelpRequests from '~/components/dashboard/HelpRequests.vue'
import NearbyIncidents from '~/components/dashboard/NearbyIncidents.vue'
import RecentActivity from '~/components/dashboard/RecentActivity.vue'
import MapLocationSearch from '~/components/map/MapLocationSearch.vue'
import { useGeolocation } from '~/composables/useGeolocation'
import { openHelpRequestPage } from '~/composables/useHomeDashboard'

const {
  selectedIncident,
  selectedIncidentPreview,
  selectedIncidentDetail,
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
  takePendingMapFocus,
} = useHomeDashboard()
const { t } = useLocale()

const { getCurrentLocation, isLocating, locationError } = useGeolocation()
const selectedArea = ref(null)
// เหตุในกลุ่มหมุดที่กดบนแผนที่ (ว่าง = ไม่แสดงกล่องรายการ)
const selectedGroupItems = ref([])

const showGroupItems = (items) => {
  clearSelectedIncident()
  selectedGroupItems.value = items
}

const clearGroupItems = () => {
  selectedGroupItems.value = []
}

// กดหมุดเดี่ยวบนแผนที่: ปิดกล่องรายการกลุ่มเดิม แล้วเปิดการ์ดของหมุดนั้น
const selectMapItem = (item) => {
  clearGroupItems()
  selectIncident(item)
}

// จุดของหมุดที่กดล่าสุด เก็บไว้แม้ปิดการ์ดแล้ว แผนที่จะได้อยู่ที่เดิม
// (เดิมปิดการ์ดแล้วจุดกลางกลับไปเป็นหมุดอันแรกในรายการ แผนที่เลยบินไปหมุดอื่น)
const focusedCenter = ref(null)

watch(selectedIncident, (incident) => {
  if (incident) {
    focusedCenter.value = [incident.lng, incident.lat]
  }
})

const activeMapCenter = computed(() => focusedCenter.value || selectedArea.value?.center || mapCenter.value)
const activeMapZoom = computed(() => selectedArea.value?.zoom || 11)

const selectArea = (area) => {
  focusedCenter.value = null
  selectedArea.value = area
  clearSelectedIncident()
}

const clearAreaSelection = () => {
  focusedCenter.value = null
  selectedArea.value = null
  clearSelectedIncident()
}

const openReportDetail = ({incidentId, reportId}) => {
  navigateTo(`/incidents/${incidentId}/reports/${reportId}`)
}

const focusCurrentLocation = async () => {
  try {
    const location = await getCurrentLocation()
    setUserLocation(location)
    focusedCenter.value = null
    selectedArea.value = {
      center: [location.lng, location.lat],
      zoom: 13,
    }
    clearSelectedIncident()
  } catch {
    // ข้อความผิดพลาดแสดงในเครื่องมือเลือกพื้นที่แล้ว
  }
}

// เพิ่งส่งรายงาน/ขอความช่วยเหลือมา: เปิดหมุดนั้นบนแผนที่
// ถ้าหาหมุดไม่เจอ (เช่น ยังไม่ขึ้นแผนที่) ให้เลื่อนแผนที่ไปจุดที่ส่งแทน
const focusJustSubmittedItem = () => {
  const focus = takePendingMapFocus()
  if (!focus) {
    return
  }
  if (focus.item) {
    selectMapItem(focus.item)
    return
  }
  focusedCenter.value = [focus.lng, focus.lat]
}

onMounted(async () => {
  await fetchPublicMapItems()
  focusJustSubmittedItem()
})
</script>

<style scoped>
.desktop-home {
  display: grid;
  gap: 1rem;
  min-height: 100%;
  padding: 1.25rem;
  background: var(--gs-paper);
}

.desktop-home__map {
  position: relative;
  width: 100%;
  /* เต็มพื้นที่ที่มองเห็น: 100vh - header (64px + margin 24px) - padding บน/ล่างของหน้า */
  /* เหตุการณ์ใกล้คุณจะอยู่ถัดลงไป ต้องเลื่อนลงถึงจะเห็น */
  height: calc(100dvh - 88px - 2.5rem);
  /* แผนที่จะไม่เตี้ยกว่า550px */
  min-height: 550px;
  overflow: hidden;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius);
  background: #e9e7e0;
}

.desktop-home__map-canvas {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.desktop-home__map-status {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  max-width: min(22rem, calc(100% - 2rem));
  padding: 0.65rem 0.8rem;
  border: 1px solid #fecaca;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface);
  color: var(--gs-danger);
  font-size: 0.78rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgb(26 58 108 / 12%);
}

.desktop-home__lower-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.92fr);
  gap: 1rem;
}

@media (max-width: 72rem) {
  .desktop-home__lower-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 48rem) {
  .desktop-home {
    padding: 1rem;
  }

  .desktop-home__map {
    height: clamp(20rem, 58dvh, 32rem);
    min-height: 20rem;
  }
}
</style>
