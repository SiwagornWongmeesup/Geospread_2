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
  const placeName = incidentLocation.value?.placeName
  if (!placeName) return t('report.noLocation')
  return placeName === 'location.currentPlace' ? t(placeName) : placeName
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
</script>

<style scoped>
.location-picker {
  color: #102968
}

.location-picker__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: .8rem
}

.location-picker h2 {
  margin: 0;
  font-size: 1.05rem
}

.location-picker__header p {
  margin: .2rem 0 0;
  color: #62779d;
  font-size: .76rem
}

.location-picker__current-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .4rem;
  min-height: 2.45rem;
  padding: 0 .7rem;
  border: 0;
  border-radius: .45rem;
  background: #eb2631;
  color: #fff;
  font: inherit;
  font-size: .73rem;
  font-weight: 800;
  cursor: pointer
}

.location-picker__current-button img,
.location-picker__selection>img {
  width: 1.05rem;
  height: 1.05rem
}

.location-picker__current-button img {
  filter: brightness(0) invert(1)
}

.location-picker__selection {
  display: flex;
  align-items: center;
  gap: .55rem;
  margin: .75rem 0;
  padding: .68rem .75rem;
  border: 1px solid #dbe7f5;
  border-radius: .55rem;
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
  font-size: .78rem
}

.location-picker__selection span {
  margin-top: .12rem;
  overflow: hidden;
  color: #62779d;
  font-size: .67rem;
  text-overflow: ellipsis;
  white-space: nowrap
}

.location-picker__selection b {
  padding: .3rem .45rem;
  border-radius: .35rem;
  background: #e8f8ed;
  color: #23874f;
  font-size: .65rem;
  white-space: nowrap
}

.location-picker__error {
  margin: 0 0 .65rem;
  padding: .6rem .7rem;
  border-radius: .45rem;
  background: #fff1f1;
  color: #b4232a;
  font-size: .72rem
}

.location-picker__map {
  position: relative;
  height: 27rem;
  overflow: hidden;
  border: 1px solid #d6e3f2;
  border-radius: .65rem;
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
  right: .75rem;
  bottom: 3rem;
  min-height: 2rem;
  padding: 0 .55rem;
  border: 0;
  border-radius: .4rem;
  background: #fff;
  color: #23427c;
  font: inherit;
  font-size: .66rem;
  font-weight: 800;
  box-shadow: 0 .3rem .8rem rgb(31 72 125 / 18%);
  cursor: pointer
}

.location-picker__legend {
  position: absolute;
  z-index: 2;
  bottom: .65rem;
  left: .65rem;
  display: flex;
  gap: .6rem;
  padding: .45rem .6rem;
  border-radius: .4rem;
  background: rgb(255 255 255 / 93%);
  color: #39517f;
  font-size: .65rem;
  box-shadow: 0 .2rem .7rem rgb(31 72 125 / 13%)
}

.location-picker__legend span {
  display: flex;
  align-items: center;
  gap: .25rem
}

.location-picker__legend i {
  width: .55rem;
  height: .55rem;
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
  inset: 1rem;
  height: auto;
  border-radius: .75rem;
  box-shadow: 0 .8rem 2rem rgb(15 23 42 / 28%)
}

.location-picker__confirm {
  position: absolute;
  z-index: 3;
  right: .75rem;
  bottom: .7rem;
  min-height: 2.4rem;
  padding: 0 .8rem;
  border: 0;
  border-radius: .45rem;
  background: #1479ef;
  color: #fff;
  font: inherit;
  font-size: .72rem;
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

@media(max-width:48rem) {
  .location-picker__header {
    align-items: stretch;
    flex-direction: column
  }

  .location-picker__current-button {
    width: 100%
  }

  .location-picker__map {
    height: 20rem
  }

  .location-picker__fullscreen {
    bottom: 3.25rem
  }
}

@media(min-width:49rem) {
  .location-picker__map {
    height: clamp(32rem, 58dvh, 42rem);
  }

  .location-picker__fullscreen {
    display: none
  }
}
.location-picker__warning {
  margin: .6rem 0 0;
  padding: .6rem .75rem;
  border: 1px solid #ecd3a4;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-pending-tint);
  color: var(--gs-pending);
  font-size: .82rem;
  line-height: 1.5
}
</style>
