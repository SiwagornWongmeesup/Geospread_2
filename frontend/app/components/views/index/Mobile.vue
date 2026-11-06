<template>
  <div class="mobile-home">
    <section
      class="mobile-home__map-section"
      :class="{ 'mobile-home__map-section--popup-open': selectedIncident }"
      :aria-label="t('common.incidentMap')"
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
        @select-item="selectMapItem"
        @select-group="showGroupItems"
        @close-popup="clearSelectedIncident"
        @open-report="openReportDetail"
      />
      <!-- ปุ่มนี้แทนปุ่มของ Mapbox ที่ขอสิทธิ์เข็มทิศเพิ่ม และถูกปิดถาวรเมื่อโดนปฏิเสธครั้งเดียว -->
      <button
        type="button"
        class="mobile-home__locate"
        :disabled="isLocating"
        :aria-busy="isLocating"
        :aria-label="t('location.useCurrent')"
        @click="focusCurrentLocation"
      >
        <img src="/icons/Location.svg" alt="">
      </button>
      <MapLocationSearch
        class="mobile-home__location-search"
        :show-current-location="false"
        :is-locating="isLocating"
        :location-error="locationError"
        @locate="focusCurrentLocation"
        @select="selectArea"
        @clear-selection="clearAreaSelection"
      />
      <p v-if="mapError" class="mobile-home__map-error">{{ mapError }}</p>
    </section>

    <!-- ยังไม่ได้เลือกหมุด: แสดงรายการเหตุ/คำขอความช่วยเหลือใกล้คุณ กดรายการแล้วเปิดรายละเอียด -->
    <NearbySheet
      v-show="!selectedIncident"
      :incidents="sheetIncidentList"
      :help-requests="sheetHelpRequestList"
      :is-loading="isLoadingMap"
      :has-user-location="Boolean(userLocation)"
      :is-locating="isLocating"
      :radius-meters="nearbyRadiusMeters"
      :group-items="selectedGroupItems"
      @select="selectIncident"
      @request-location="focusCurrentLocation"
      @change-radius="changeNearbyRadius"
      @clear-group="clearGroupItems"
    />

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
import { computed, ref, watch } from "vue";
const { t } = useLocale();
import MapboxMap from "~/components/map/MapboxMap.vue";
import MapLocationSearch from "~/components/map/MapLocationSearch.vue";
import IncidentBottomSheet from "~/components/map/IncidentBottomSheet.vue";
import NearbySheet from "~/components/mobile/NearbySheet.vue";
import { useGeolocation } from "~/composables/useGeolocation";

const {
  selectedIncident,
  selectedIncidentPreview,
  selectedIncidentDetail,
  publicMapItems,
  sheetIncidentList,
  sheetHelpRequestList,
  nearbyRadiusMeters,
  isLoadingMap,
  userLocation,
  mapError,
  mapCenter,
  selectIncident,
  clearSelectedIncident,
  setUserLocation,
  fetchPublicMapItems,
} = useHomeDashboard();
const { getCurrentLocation, shouldAutoLocate, isLocating, locationError } = useGeolocation();
const selectedArea = ref(null);
// เหตุในกลุ่มหมุดที่กดบนแผนที่ (ว่าง = แผ่นด้านล่างแสดงรายการรอบตัวตามปกติ)
const selectedGroupItems = ref([]);
// จุดของหมุดที่กดล่าสุด เก็บไว้แม้ปิดรายละเอียดแล้ว แผนที่จะได้อยู่ที่เดิม
// (เดิมปิดแล้วจุดกลางกลับไปเป็นหมุดอันแรกในรายการ แผนที่เลยบินไปหมุดอื่น)
const focusedCenter = ref(null);

watch(selectedIncident, (incident) => {
  if (incident) {
    focusedCenter.value = [incident.lng, incident.lat];
  }
});

const activeMapCenter = computed(() => focusedCenter.value || selectedArea.value?.center || mapCenter.value);
const activeMapZoom = computed(() => selectedArea.value?.zoom || 11);
const selectArea = (area) => {
  focusedCenter.value = null;
  selectedArea.value = area;
  clearSelectedIncident();
};
const clearAreaSelection = () => {
  focusedCenter.value = null;
  selectedArea.value = null;
  clearSelectedIncident();
};

const openReportDetail = ({incidentId, reportId}) => {
  navigateTo(`/incidents/${incidentId}/reports/${reportId}`)
}


// ลูก (NearbySheet) บอกว่าผู้ใช้กดปุ่มรัศมีใหม่ → เปลี่ยนค่าในกล่อง รายการเหตุรอบตัวจะกรองใหม่เอง
const changeNearbyRadius = (meters) => {
  nearbyRadiusMeters.value = meters;
};

// ลูก (MapboxMap) บอกว่าผู้ใช้กดกลุ่มหมุดที่ติดกัน → เก็บรายการไว้ให้แผ่นด้านล่างแสดง
const showGroupItems = (items) => {
  clearSelectedIncident();
  selectedGroupItems.value = items;
};

const clearGroupItems = () => {
  selectedGroupItems.value = [];
};

// กดหมุดเดี่ยวบนแผนที่: ออกจากรายการกลุ่มเดิม แล้วเปิดรายละเอียดหมุดนั้น
const selectMapItem = (item) => {
  clearGroupItems();
  selectIncident(item);
};

const focusCurrentLocation = async () => {
  try {
    const location = await getCurrentLocation();
    setUserLocation(location);
    focusedCenter.value = null;
    selectedArea.value = { center: [location.lng, location.lat], zoom: 13 };
    clearSelectedIncident();
  } catch {
    /* MapLocationSearch renders the error. */
  }
};
onMounted(async () => {
  void fetchPublicMapItems();
  // ถ้ารู้ตำแหน่งแล้วไม่ต้องขอซ้ำ และไม่เด้งถามทุกครั้งที่เปิดหน้า (ดู shouldAutoLocate)
  if (!userLocation.value && await shouldAutoLocate()) {
    void focusCurrentLocation();
  }
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
/* ช่องค้นหาอยู่บนสุดของแผนที่ ใต้แถบโลโก้ (แถบโลโก้จัดการ safe area ด้านบนให้แล้ว) */
.mobile-home__location-search:deep(.map-location-tools) {
  top: 12px;
  left: 14px;
  width: calc(100% - 94px);
}
.mobile-home__location-search:deep(.map-location-tools__search) {
  min-height: 50px;
  border-radius: 14px;
}
.mobile-home__location-search:deep(.map-location-tools__search input) {
  font-size: 15px;
}
.mobile-home__location-search:deep(.map-location-tools__results) {
  max-height: min(304px, calc(100dvh - 232px));
}
/* อยู่ใต้ปุ่มซูมและเข็มทิศของแผนที่ */
.mobile-home__locate {
  position: absolute;
  top: 112px;
  right: 10px;
  z-index: 5;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 0 0 2px rgb(0 0 0 / 10%);
  cursor: pointer;
}
.mobile-home__locate:disabled {
  opacity: 0.6;
}
.mobile-home__locate img {
  width: 15px;
  height: 15px;
}
.mobile-home__map-error {
  position: absolute;
  top: 74px;
  right: 16px;
  left: 16px;
  z-index: 6;
  margin: 0;
  padding: 10px 13px;
  border-radius: 11px;
  background: rgb(255 247 247 / 96%);
  color: #b91c1c;
  font-size: 12px;
  font-weight: 750;
  box-shadow: 0 8px 18px rgb(127 29 29 / 12%);
}
@media (min-width: 480px) {
  .mobile-home__location-search:deep(.map-location-tools) {
    left: 20px;
    width: calc(100% - 104px);
  }
}
</style>
