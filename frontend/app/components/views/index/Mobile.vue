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
        :popup-padding="{ top: 174, right: 16, bottom: 72, left: 16 }"
        :reporter-location="userLocation"
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

    <section class="mobile-home__nearby" aria-labelledby="mobile-nearby-title">
      <div class="mobile-home__sheet-handle" aria-hidden="true" />
      <header class="mobile-home__nearby-header">
        <div>
          <h1 id="mobile-nearby-title">เหตุการณ์ใกล้คุณ</h1>
          <p>ติดตามสถานการณ์ในพื้นที่ที่เลือก</p>
        </div>
        <NuxtLink to="/incidents" class="mobile-home__view-all"
          >ดูทั้งหมด <span aria-hidden="true">›</span></NuxtLink
        >
      </header>
      <p v-if="isLoadingMap" class="mobile-home__state">
        กำลังโหลดเหตุการณ์...
      </p>
      <p
        v-else-if="mapError"
        class="mobile-home__state mobile-home__state--error"
      >
        {{ mapError }}
      </p>

      <!-- ยังไม่รู้ตำแหน่งผู้ใช้: ไม่แสดงการ์ด เพราะคำนวณระยะทางจริงไม่ได้ -->
      <div
        v-else-if="!userLocation"
        class="mobile-home__state mobile-home__state--location"
      >
        <p>{{ locationError || "เปิดตำแหน่งปัจจุบันเพื่อดูเหตุการณ์ที่อยู่ใกล้คุณ" }}</p>
        <button
          type="button"
          class="mobile-home__location-button"
          :disabled="isLocating"
          @click="focusCurrentLocation"
        >
          <span v-if="isLocating">กำลังหาตำแหน่ง...</span>
          <span v-else>ใช้ตำแหน่งปัจจุบัน</span>
        </button>
      </div>

      <p v-else-if="!nearbyIncidentCards.length" class="mobile-home__state">
        ยังไม่มีเหตุการณ์ใกล้พื้นที่นี้
      </p>
      <div v-else class="mobile-home__incident-list">
        <button
          v-for="incident in nearbyIncidentCards.slice(0, 4)"
          :key="incident.id"
          type="button"
          class="mobile-incident"
          :class="{
            'mobile-incident--selected': selectedIncident?.id === incident.id,
          }"
          @click="selectIncident(incident)"
        >
          <div
            class="mobile-incident__media"
            :class="{ 'mobile-incident__media--empty': !incident.imageUrl }"
          >
            <img
              v-if="incident.imageUrl"
              :src="incident.imageUrl"
              :alt="incident.title"
            /><img
              v-else
              :src="incident.iconUrl || '/icons/Alert.svg'"
              alt=""
              aria-hidden="true"
            />
          </div>
          <div class="mobile-incident__content">
            <span
              class="mobile-incident__category"
              :style="{ backgroundColor: incident.markerColor || '#1479ef' }"
              ><img
                :src="incident.iconUrl || '/icons/Alert.svg'"
                alt=""
                aria-hidden="true"
              />{{ incident.category || "เหตุการณ์" }}</span
            >
            <h2>{{ previewText(incident) }}</h2>
            <p class="mobile-incident__area">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Zm0-8.5a2.5 2.5 0 1 1 0-5"
                /></svg
              >{{ getPlaceLabel(incident) }}
            </p>
            <p class="mobile-incident__meta">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8" />
                <path d="M12 7v5l3.2 2" /></svg
              >{{
                incident.distanceFromUserLabel ||
                incident.distance ||
                "ยังไม่ทราบระยะทาง"
              }}
              · {{ incident.time || "เมื่อสักครู่" }}
            </p>
          </div>
          <div class="mobile-incident__side">
            <span
              class="mobile-incident__status"
              :class="`mobile-incident__status--${incident.statusTone || 'pending'}`"
              >{{ incident.statusLabel || "รอตรวจสอบ" }}</span
            ><svg
              class="mobile-incident__arrow"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="m9 5 7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import MapboxMap from "~/components/map/MapboxMap.vue";
import MapLocationSearch from "~/components/map/MapLocationSearch.vue";
import { useGeolocation } from "~/composables/useGeolocation";
import { usePlaceNames } from "~/composables/usePlaceNames";

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
} = useHomeDashboard();
const { getCurrentLocation, isLocating, locationError } = useGeolocation();
const { loadPlaceNames, getPlaceLabel } = usePlaceNames();

// หาชื่อสถานที่ของการ์ดที่แสดงอยู่ (4 ใบแรก) เมื่อรู้ตำแหน่งผู้ใช้แล้วเท่านั้น
// ถ้ายังไม่รู้ตำแหน่ง การ์ดถูกซ่อนอยู่ จึงยังไม่ต้องถาม Mapbox (ประหยัดโควตา)
watch(
  () => [nearbyIncidentCards.value, userLocation.value],
  () => {
    if (!userLocation.value) {
      return;
    }
    loadPlaceNames(nearbyIncidentCards.value.slice(0, 4));
  },
  { immediate: true },
);

const selectedArea = ref(null);
const activeMapCenter = computed(() => {
  if (selectedIncident.value)
    return [selectedIncident.value.lng, selectedIncident.value.lat];
  return selectedArea.value?.center || mapCenter.value;
});
const activeMapZoom = computed(() => selectedArea.value?.zoom || 11);
const previewText = (incident) =>
  String(incident?.description || "").trim() ||
  incident?.title ||
  "ยังไม่มีรายละเอียดเพิ่มเติม";
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
.mobile-home__nearby {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  display: grid;
  gap: 0.85rem;
  max-height: min(52dvh, 28rem);
  padding: 0.7rem 1rem calc(0.8rem + env(safe-area-inset-bottom));
  overflow: auto;
  border-radius: 1.45rem 1.45rem 0 0;
  background: rgb(255 255 255 / 98%);
  box-shadow: 0 -1rem 2.5rem rgb(19 55 104 / 20%);
}
.mobile-home__sheet-handle {
  width: 2.7rem;
  height: 0.32rem;
  margin: 0 auto -0.15rem;
  border-radius: 999px;
  background: #dce5f1;
}
.mobile-home__nearby-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 0.75rem;
}
.mobile-home__nearby h1 {
  margin: 0;
  color: #102968;
  font-size: clamp(1.15rem, 5.5vw, 1.5rem);
  font-weight: 900;
  letter-spacing: -0.035em;
  line-height: 1.1;
}
.mobile-home__nearby-header p {
  margin: 0.24rem 0 0;
  color: #60779e;
  font-size: 0.72rem;
  font-weight: 650;
}
.mobile-home__view-all {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.22rem;
  margin-top: 0.15rem;
  color: #146ee7;
  font-size: 0.84rem;
  font-weight: 850;
  text-decoration: none;
}
.mobile-home__view-all span {
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 0.65;
}
.mobile-home__state {
  margin: 0;
  padding: 0.85rem;
  border-radius: 0.75rem;
  background: #f4f8fd;
  color: #58729a;
  font-size: 0.8rem;
  font-weight: 750;
}
.mobile-home__state--location {
  display: grid;
  gap: 10px;
}
.mobile-home__state--location p {
  margin: 0;
}
.mobile-home__location-button {
  justify-self: start;
  padding: 8px 16px;
  border: 0;
  border-radius: 999px;
  background: #2563eb;
  color: #fff;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
}
.mobile-home__location-button:disabled {
  background: #93b4f0;
}
.mobile-home__state--error {
  background: #fff1f1;
  color: #b91c1c;
}
.mobile-home__incident-list {
  display: grid;
  gap: 0.6rem;
}
.mobile-incident {
  display: grid;
  grid-template-columns: 4.8rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  min-height: 5.9rem;
  padding: 0.45rem;
  border: 1px solid #e1eaf5;
  border-radius: 0.9rem;
  background: #fff;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 0.3rem 0.9rem rgb(30 65 120 / 5%);
}
.mobile-incident--selected {
  border-color: #4b90f5;
  background: #f7fbff;
}
.mobile-incident__media {
  display: grid;
  width: 4.8rem;
  height: 4.8rem;
  place-items: center;
  overflow: hidden;
  border-radius: 0.65rem;
  background: #eaf2fb;
}
.mobile-incident__media > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mobile-incident__media--empty > img {
  width: 2rem;
  height: 2rem;
  object-fit: contain;
  filter: invert(32%) sepia(71%) saturate(1671%) hue-rotate(199deg)
    brightness(96%) contrast(93%);
}
.mobile-incident__content {
  min-width: 0;
}
.mobile-incident__category {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  gap: 0.28rem;
  padding: 0.25rem 0.45rem;
  overflow: hidden;
  border-radius: 999px;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 850;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mobile-incident__category img {
  width: 0.78rem;
  height: 0.78rem;
  flex: 0 0 auto;
  object-fit: contain;
  filter: brightness(0) invert(1);
}
.mobile-incident h2 {
  display: -webkit-box;
  margin: 0.32rem 0 0.25rem;
  overflow: hidden;
  color: #102968;
  font-size: 0.83rem;
  font-weight: 850;
  letter-spacing: -0.018em;
  line-height: 1.22;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.mobile-incident__area,
.mobile-incident__meta {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.25rem;
  margin: 0.14rem 0 0;
  overflow: hidden;
  color: #62799d;
  font-size: 0.66rem;
  font-weight: 650;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mobile-incident__area svg,
.mobile-incident__meta svg {
  width: 0.86rem;
  height: 0.86rem;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}
.mobile-incident__side {
  display: grid;
  align-self: stretch;
  align-items: center;
  justify-items: end;
  gap: 0.5rem;
  padding: 0.2rem 0.15rem 0.2rem 0;
}
.mobile-incident__status {
  padding: 0.27rem 0.42rem;
  border-radius: 999px;
  font-size: 0.57rem;
  font-weight: 850;
  line-height: 1;
  white-space: nowrap;
}
.mobile-incident__status--pending {
  background: #fff0df;
  color: #c65d00;
}
.mobile-incident__status--ongoing {
  background: #e5efff;
  color: #1768d7;
}
.mobile-incident__status--verified {
  background: #e0f5e9;
  color: #18764a;
}
.mobile-incident__arrow {
  width: 1.15rem;
  height: 1.15rem;
  fill: none;
  stroke: #6a81a6;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.2;
}
.mobile-home__view-all:focus-visible,
.mobile-incident:focus-visible {
  outline: 3px solid rgb(20 110 231 / 35%);
  outline-offset: 3px;
}
.mobile-incident:active {
  transform: scale(0.985);
}
@media (min-width: 30rem) {
  .mobile-home__location-search:deep(.map-location-tools) {
    left: 1.25rem;
    width: calc(100% - 6.5rem);
  }
  .mobile-home__nearby {
    padding-right: 1.25rem;
    padding-left: 1.25rem;
  }
}
@media (max-height: 42rem) {
  .mobile-home__nearby {
    max-height: 46dvh;
  }
  .mobile-home__nearby-header p {
    display: none;
  }
}
</style>
