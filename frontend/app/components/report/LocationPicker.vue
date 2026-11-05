<template>
  <section class="location-picker" aria-labelledby="location-picker-heading">
    <header class="location-picker__header">
      <div>
        <h2 id="location-picker-heading">{{ t('report.locationHeading') }}</h2>
        <p>{{ t('report.locationHint') }}</p>
      </div>
      <button type="button" class="location-picker__current-button" :disabled="isLocating" :aria-busy="isLocating"
        @click="useCurrentLocation"><img src="/icons/Location.svg" alt="">{{ isLocating ? t('location.requesting') : t('location.useCurrent') }}</button>
    </header>
    <section class="location-picker__selection" :class="{ 'location-picker__selection--ready': incidentLocation }"
      aria-live="polite"><img src="/icons/Location.svg" alt="">
      <div><strong>{{ locationLabel }}</strong><span>{{ locationHint }}</span></div><b
        v-if="incidentLocation">{{ t('report.locationChosen') }}</b>
    </section>
    <p v-if="locationError" class="location-picker__error" role="alert">{{ locationError }}</p>
    <!-- คอมพิวเตอร์ที่ไม่มี GPS จะเดาตำแหน่งจาก Wi-Fi/IP ซึ่งอาจคลาดไปหลายกิโลเมตร -->
    <p v-else-if="isLowAccuracy" class="location-picker__warning" role="status">
      {{ t('report.lowAccuracy', { accuracy: accuracyLabel }) }}
    </p>
    <div class="location-picker__map" :class="{ 'location-picker__map--fullscreen': isFullscreen }">
      <MapboxMap :center="mapCenter" :zoom="14" :show-geolocate-control="false" :editable-location="incidentLocation"
        :allow-location-selection="true" class="location-picker__map-canvas" @location-select="setMapLocation" />
      <!-- ค้นหาสถานที่ หรือวางพิกัด/ลิงก์ Google Maps เพื่อปักหมุด -->
      <MapLocationSearch variant="pick" @select="setSearchLocation" />
      <button type="button" class="location-picker__fullscreen"
        :aria-label="isFullscreen ? t('report.mapShrink') : t('report.mapFullscreen')" @click="isFullscreen = !isFullscreen"><span
          v-if="isFullscreen">{{ t('report.mapShrink') }}</span><span v-else>{{ t('report.mapExpand') }}</span></button>
      <div class="location-picker__legend"><span><i class="incident"></i>{{ t('report.legendIncident') }}</span></div>
      <button v-if="isFullscreen" type="button" class="location-picker__confirm"
        @click="isFullscreen = false; locationError = incidentLocation ? '' : 'report.chooseBeforeConfirm'">{{ t('report.confirmLocation') }}</button>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import MapboxMap from '~/components/map/MapboxMap.vue'
import MapLocationSearch from '~/components/map/MapLocationSearch.vue'
import { useGeolocation } from '~/composables/useGeolocation'

const { incidentLocation, setReporterLocation, setIncidentLocation } = useReportIncident()
const { getCurrentLocation, isLocating, locationError } = useGeolocation()
const isFullscreen = ref(false)
const defaultMapCenter = [98.9853, 18.7883]
const mapCenter = computed(() => incidentLocation.value ? [incidentLocation.value.lng, incidentLocation.value.lat] : defaultMapCenter)
const { t } = useLocale()
// placeName ของตำแหน่งจากเครื่องเก็บเป็น key (location.currentPlace) เพื่อให้สลับภาษาได้
const locationLabel = computed(() => {
  // ยังไม่ได้เลือกจุด
  if (!incidentLocation.value) return t('report.noLocation')

  const placeName = incidentLocation.value.placeName
  // คลิกบนแผนที่: ไม่มีชื่อสถานที่ แสดงว่าเป็นจุดที่ปักเอง
  if (!placeName) return t('report.pinnedOnMap')
  // ใช้ตำแหน่งปัจจุบัน: ชื่อเก็บเป็น key ของข้อความ ต้องแปลก่อน
  if (placeName === 'location.currentPlace') return t(placeName)
  // ค้นหาสถานที่: ใช้ชื่อสถานที่ที่ค้นเจอ
  return placeName
})
const locationHint = computed(() => {
  if (!incidentLocation.value) return t('report.noLocationHint')
  const { lat, lng, accuracyM } = incidentLocation.value
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}${accuracyM !== null ? ` · ${t('report.accuracy', { value: Math.round(accuracyM) })}` : ''}`
})
// เกินระยะนี้ถือว่าตำแหน่งจากเครื่องไม่แม่นพอสำหรับระบุจุดเกิดเหตุ
const lowAccuracyThresholdM = 200
const isLowAccuracy = computed(() => {
  const location = incidentLocation.value
  return location?.source === 'device' && location.accuracyM !== null && location.accuracyM > lowAccuracyThresholdM
})
const accuracyLabel = computed(() => {
  const accuracy = incidentLocation.value?.accuracyM ?? 0
  return accuracy >= 1000 ? t('units.kilometers', { value: (accuracy / 1000).toFixed(1) }) : t('units.meters', { value: Math.round(accuracy) })
})
// ผลค้นหา/พิกัดที่กรอก ถือเป็นจุดที่ผู้ใช้เลือกเอง (source 'map' ตามที่ฐานข้อมูลรองรับ)
const setSearchLocation = (item) => {
  locationError.value = ''
  setIncidentLocation({ lat: item.center[1], lng: item.center[0], accuracyM: null, placeName: item.label, source: 'map' })
}
const setMapLocation = (location) => {
  setIncidentLocation({ ...location, accuracyM: null, source: 'map' })
}

const useCurrentLocation = async () => {
  try {
    const location = await getCurrentLocation()
    setReporterLocation(location)

    // อย่าเขียนทับหมุดที่ผู้ใช้เลือกเองบนแผนที่ แต่ยัง refresh จุดที่มาจากเครื่องได้
    if (!incidentLocation.value || incidentLocation.value.source === 'device') {
      setIncidentLocation({ ...location, placeName: 'location.currentPlace', source: 'device' })
    }
  } catch {
    // useGeolocation แปลงและเก็บข้อความผิดพลาดสำหรับแสดงผลแล้ว
  }
}

// ให้แผงด้านข้าง/ฟอร์มสั่งขอตำแหน่งปัจจุบันได้
defineExpose({ useCurrentLocation })
</script>

<style scoped>
.location-picker {
  color: #102968
}

.location-picker__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 13px
}

.location-picker h2 {
  margin: 0;
  font-size: 17px
}

.location-picker__header p {
  margin: 3px 0 0;
  color: #52708b;
  font-size: 12px
}

.location-picker__current-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 39px;
  padding: 0 11px;
  border: 1px solid var(--gs-action);
  border-radius: 8px;
  background: var(--gs-action-tint);
  color: var(--gs-action);
  font: inherit;
  font-size: 14px;
  font-weight: 750;
  cursor: pointer
}

.location-picker__current-button img,
.location-picker__selection>img {
  width: 17px;
  height: 17px
}

.location-picker__current-button img {
  /* ไอคอนเดิมสีดำ ใช้ตามสีตัวอักษรของปุ่ม (น้ำเงินเข้ม) */
  opacity: .85
}

.location-picker__selection {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 12px 0;
  padding: 11px 12px;
  border: 1px solid #dbe7f5;
  border-radius: 9px;
  background: #f9fbff
}

.location-picker__selection>img {
  filter: invert(39%) sepia(54%) saturate(852%) hue-rotate(182deg)
}

.location-picker__selection div {
  min-width: 0;
  flex: 1
}

.location-picker__selection strong,
.location-picker__selection span {
  display: block
}

.location-picker__selection strong {
  color: #29457a;
  font-size: 12px
}

.location-picker__selection span {
  margin-top: 1.92px;
  overflow: hidden;
  color: #52708b;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap
}

.location-picker__selection b {
  padding: 5px 7px;
  border-radius: 6px;
  background: #e8f8ed;
  color: #23874f;
  font-size: 12px;
  white-space: nowrap
}

.location-picker__error {
  margin: 0 0 10px;
  padding: 10px 11px;
  border-radius: 7px;
  background: #fff1f1;
  color: #b4232a;
  font-size: 12px
}

.location-picker__map {
  position: relative;
  height: 432px;
  overflow: hidden;
  border: 1px solid #d6e3f2;
  border-radius: 10px;
  background: #dceef1
}

.location-picker__map-canvas {
  width: 100%;
  height: 100%;
  min-height: 0
}

.location-picker__fullscreen {
  position: absolute;
  z-index: 2;
  right: 12px;
  bottom: 48px;
  min-height: 32px;
  padding: 0 9px;
  border: 0;
  border-radius: 6px;
  background: #fff;
  color: #23427c;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 5px 13px rgb(31 72 125 / 18%);
  cursor: pointer
}

.location-picker__legend {
  position: absolute;
  z-index: 2;
  bottom: 10px;
  left: 10px;
  display: flex;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 6px;
  background: rgb(255 255 255 / 93%);
  color: #39517f;
  font-size: 12px;
  box-shadow: 0 3px 11px rgb(31 72 125 / 13%)
}

.location-picker__legend span {
  display: flex;
  align-items: center;
  gap: 4px
}

.location-picker__legend i {
  width: 9px;
  height: 9px;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgb(20 48 106 / 15%)
}

.location-picker__legend .incident {
  background: #e8343e
}

.location-picker__map--fullscreen {
  position: fixed;
  z-index: 70;
  inset: 16px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 13px 32px rgb(15 23 42 / 28%)
}

.location-picker__confirm {
  position: absolute;
  z-index: 3;
  right: 12px;
  bottom: 11px;
  min-height: 38px;
  padding: 0 13px;
  border: 0;
  border-radius: 7px;
  background: #1479ef;
  color: #fff;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap
}

@media(max-width:768px) {
  .location-picker__header {
    align-items: stretch;
    flex-direction: column
  }

  .location-picker__current-button {
    width: 100%
  }

  .location-picker__map {
    height: 320px
  }

  .location-picker__fullscreen {
    bottom: 52px
  }
}

@media(min-width:784px) {
  .location-picker__map {
    height: clamp(512px, 58dvh, 672px);
  }

  .location-picker__fullscreen {
    display: none
  }
}
.location-picker__warning {
  margin: 10px 0 0;
  padding: 10px 12px;
  border: 1px solid #ecd3a4;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-pending-tint);
  color: var(--gs-pending);
  font-size: 13px;
  line-height: 1.5
}
</style>
