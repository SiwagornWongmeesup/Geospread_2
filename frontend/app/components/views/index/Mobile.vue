<template>
  <div class="mobile-home">
    <section
      class="mobile-home__map-section"
      :class="{ 'mobile-home__map-section--popup-open': selectedIncident }"
      aria-label="แผนที่เหตุการณ์"
    >
      <MapboxMap
        :center="activeMapCenter"
        :zoom="activeMapZoom"
        :map-items="publicMapItems"
        :selected-item-id="selectedIncident?.id"
        :selected-item="selectedIncidentPreview"
        :selected-incident-detail="selectedIncidentDetail"
        :popup-padding="{ top: 80, right: 16, bottom: 420, left: 16 }"
        :reporter-location="userLocation"
        :show-popup="false"
        class="mobile-home__map"
        @select-item="selectIncident"
        @close-popup="clearSelectedIncident"
        @open-report="openReportDetail"
      />
      <MapLocationSearch
        class="mobile-home__location-search"
        :is-locating="isLocating"
        :location-error="locationError"
        @locate="focusCurrentLocation"
        @select="selectArea"
        @clear-selection="clearAreaSelection"
      />
      <p v-if="mapError" class="mobile-home__map-error">{{ mapError }}</p>
    </section>

    <!-- กดหมุดแล้วแสดงรายละเอียดเป็นแผ่นเลื่อนขึ้นจากด้านล่าง (แทน popup บนแผนที่) -->
    <IncidentBottomSheet
      :incident="selectedIncidentPreview"
      :incident-detail="selectedIncidentDetail"
      @close="clearSelectedIncident"
      @open-report="openReportDetail"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import MapboxMap from "~/components/map/MapboxMap.vue";
import MapLocationSearch from "~/components/map/MapLocationSearch.vue";
import IncidentBottomSheet from "~/components/map/IncidentBottomSheet.vue";
import { useGeolocation } from "~/composables/useGeolocation";

const {
  selectedIncident,
  selectedIncidentPreview,
  selectedIncidentDetail,
  publicMapItems,
  userLocation,
  mapError,
  mapCenter,
  selectIncident,
  clearSelectedIncident,
  setUserLocation,
  fetchPublicMapItems,
} = useHomeDashboard();
const { getCurrentLocation, isLocating, locationError } = useGeolocation();
const selectedArea = ref(null);
const activeMapCenter = computed(() => {
  if (selectedIncident.value)
    return [selectedIncident.value.lng, selectedIncident.value.lat];
  return selectedArea.value?.center || mapCenter.value;
});
const activeMapZoom = computed(() => selectedArea.value?.zoom || 11);
const selectArea = (area) => {
  selectedArea.value = area;
  clearSelectedIncident();
};
const clearAreaSelection = () => {
  selectedArea.value = null;
  clearSelectedIncident();
};

const openReportDetail = ({incidentId, reportId}) => {
  navigateTo(`/incidents/${incidentId}/reports/${reportId}`)
}


const focusCurrentLocation = async () => {
  try {
    const location = await getCurrentLocation();
    setUserLocation(location);
    selectedArea.value = { center: [location.lng, location.lat], zoom: 13 };
    clearSelectedIncident();
  } catch {
    /* MapLocationSearch renders the error. */
  }
};
onMounted(() => {
  void fetchPublicMapItems();
});
</script>

<style scoped>
.mobile-home {
  position: relative;
  min-height: 100%;
  overflow: hidden;
  background: #dceef1;
  color: #102968;
}
.mobile-home__map-section {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.mobile-home__map-section--popup-open {
  z-index: 12;
}
.mobile-home__map {
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
/* ช่องค้นหาอยู่บนสุดของจอ (เดิมอยู่ใต้แถบโลโก้ซึ่งเอาออกแล้ว) */
.mobile-home__location-search:deep(.map-location-tools) {
  top: max(12px, env(safe-area-inset-top));
  left: 0.9rem;
  width: calc(100% - 5.9rem);
}
.mobile-home__location-search:deep(.map-location-tools__current-location) {
  min-width: 2.9rem;
}
.mobile-home__location-search:deep(.map-location-tools__search) {
  min-height: 3.1rem;
  border-radius: 0.9rem;
}
.mobile-home__location-search:deep(.map-location-tools__search input) {
  font-size: 0.95rem;
}
.mobile-home__location-search:deep(.map-location-tools__results) {
  max-height: min(19rem, calc(100dvh - 11rem));
}
.mobile-home__map-error {
  position: absolute;
  top: 4.6rem;
  right: 1rem;
  left: 1rem;
  z-index: 6;
  margin: 0;
  padding: 0.65rem 0.8rem;
  border-radius: 0.7rem;
  background: rgb(255 247 247 / 96%);
  color: #b91c1c;
  font-size: 0.78rem;
  font-weight: 750;
  box-shadow: 0 0.5rem 1.1rem rgb(127 29 29 / 12%);
}
@media (min-width: 30rem) {
  .mobile-home__location-search:deep(.map-location-tools) {
    left: 1.25rem;
    width: calc(100% - 6.5rem);
  }
}
</style>
