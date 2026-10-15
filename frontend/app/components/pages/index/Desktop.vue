<template>
  <div class="desktop-home">
    <section class="desktop-home__map" aria-label="แผนที่เหตุการณ์">
      <MapboxMap
        :center="activeMapCenter"
        :zoom="activeMapZoom"
        :show-geolocate-control="false"
        :map-items="publicMapItems"
        :selected-item-id="selectedIncident?.id"
        :reporter-location="userLocation"
        class="desktop-home__map-canvas"
        @select-item="selectIncident"
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
      <IncidentMapPopup
        class="desktop-home__map-popup"
        :incident="selectedIncidentPreview"
        @close="clearSelectedIncident"
      />
    </section>

    <NearbyIncidents
      :selected-incident-id="selectedIncident?.id"
      :incidents="nearbyIncidentCards"
      :is-loading="isLoadingMap"
      :error-message="mapError"
    />

    <div class="desktop-home__lower-grid">
      <HelpRequests />
      <RecentActivity />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import MapboxMap from '~/components/MapboxMap.vue'
import IncidentMapPopup from '~/components/map/IncidentMapPopup.vue'
import HelpRequests from '~/components/dashboard/HelpRequests.vue'
import NearbyIncidents from '~/components/dashboard/NearbyIncidents.vue'
import RecentActivity from '~/components/dashboard/RecentActivity.vue'
import MapLocationSearch from '~/components/map/MapLocationSearch.vue'
import { useGeolocation } from '~/composables/useGeolocation'

const {
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
} = useHomeDashboard()

const { getCurrentLocation, isLocating, locationError } = useGeolocation()
const selectedArea = ref(null)

const activeMapCenter = computed(() => selectedArea.value?.center || mapCenter.value)
const activeMapZoom = computed(() => selectedArea.value?.zoom || 11)

const selectArea = (area) => {
  selectedArea.value = area
  clearSelectedIncident()
}

const clearAreaSelection = () => {
  selectedArea.value = null
  clearSelectedIncident()
}

const focusCurrentLocation = async () => {
  try {
    const location = await getCurrentLocation()
    setUserLocation(location)
    selectedArea.value = {
      center: [location.lng, location.lat],
      zoom: 13,
    }
    clearSelectedIncident()
  } catch {
    // ข้อความผิดพลาดแสดงในเครื่องมือเลือกพื้นที่แล้ว
  }
}

onMounted(() => {
  void fetchPublicMapItems()
})
</script>

<style scoped>
.desktop-home {
  display: grid;
  gap: 1rem;
  min-height: 100%;
  padding: 1.25rem;
  background: #f5f8fc;
}

.desktop-home__map {
  position: relative;
  width: 100%;
  height: clamp(28rem, 58dvh, 42rem);
  min-height: 28rem;
  overflow: hidden;
  border: 1px solid #dce6f2;
  border-radius: 1rem;
  background: #dceef1;
  box-shadow: 0 8px 24px rgb(36 75 122 / 10%);
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
  border-radius: 0.625rem;
  background: rgb(255 255 255 / 94%);
  color: #b91c1c;
  font-size: 0.78rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgb(26 58 108 / 12%);
}

.desktop-home__map-popup {
  position: absolute;
  z-index: 2;
  bottom: 1rem;
  left: 1rem;
  max-width: calc(100% - 2rem);
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
    min-height: 20rem;
  }
}
</style>
