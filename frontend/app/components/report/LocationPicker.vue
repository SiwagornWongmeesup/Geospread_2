<template>
  <section class="location-picker" aria-labelledby="location-picker-heading">
    <header class="location-picker__header">
      <svg class="location-picker__header-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2a7 7 0 0 0-7 7c0 5.1 7 13 7 13s7-7.9 7-13a7 7 0 0 0-7-7Zm0 9.6A2.6 2.6 0 1 1 12 6a2.6 2.6 0 0 1 0 5.6Z" fill="currentColor" />
      </svg>
      <div>
        <h2 id="location-picker-heading" class="location-picker__title">ตำแหน่งเหตุการณ์</h2>
        <p class="location-picker__subtitle">ตรวจสอบตำแหน่งก่อนส่งรายงาน</p>
      </div>
    </header>

    <div class="location-picker__current" :class="{ 'location-picker__current--ready': incidentLocation }">
      <div class="location-picker__info">
        <strong class="location-picker__label">{{ locationLabel }}</strong>
        <span class="location-picker__hint">{{ locationHint }}</span>
      </div>
      <button
        type="button"
        class="location-picker__button"
        :disabled="isLocating"
        :aria-busy="isLocating"
        @click="useCurrentLocation"
      >
        <svg class="location-picker__button-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3a1 1 0 0 1 1 1v1.1a7 7 0 0 1 5.9 5.9H20a1 1 0 1 1 0 2h-1.1a7 7 0 0 1-5.9 5.9V20a1 1 0 1 1-2 0v-1.1A7 7 0 0 1 5.1 13H4a1 1 0 1 1 0-2h1.1A7 7 0 0 1 11 5.1V4a1 1 0 0 1 1-1Zm0 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" fill="currentColor" />
        </svg>
        <span>{{ isLocating ? 'กำลังขอตำแหน่ง…' : 'ใช้ตำแหน่งปัจจุบัน' }}</span>
      </button>
    </div>
    <p v-if="locationError" class="location-picker__error" role="alert">{{ locationError }}</p>

    <div class="location-picker__map" aria-label="แผนที่ตำแหน่งเหตุการณ์">
      <MapboxMap
        :center="mapCenter"
        :zoom="12"
        :show-geolocate-control="false"
        class="location-picker__map-canvas"
      />
      <span v-if="incidentLocation" class="map-marker map-marker--incident" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 2a7 7 0 0 0-7 7c0 5.1 7 13 7 13s7-7.9 7-13a7 7 0 0 0-7-7Z" fill="currentColor" />
          <circle cx="12" cy="9" r="2.3" fill="#fff" />
        </svg>
      </span>
    </div>

    <p class="location-picker__note">
      ระบบจะขอสิทธิ์เข้าถึงตำแหน่งเฉพาะเมื่อคุณกดปุ่มด้านบนเท่านั้น
    </p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import MapboxMap from '~/components/MapboxMap.vue'

const { incidentLocation, setCurrentLocation } = useReportIncident()
const isLocating = ref(false)
const locationError = ref('')

const defaultMapCenter = [98.9853, 18.7883]
const mapCenter = computed(() => incidentLocation.value
  ? [incidentLocation.value.lng, incidentLocation.value.lat]
  : defaultMapCenter)

const locationLabel = computed(() => {
  if (isLocating.value) return 'กำลังค้นหาตำแหน่ง…'
  return incidentLocation.value ? 'ตั้งตำแหน่งเหตุการณ์แล้ว' : 'ยังไม่ได้เลือกตำแหน่ง'
})

const locationHint = computed(() => {
  if (!incidentLocation.value) return 'กดปุ่มเพื่อใช้ตำแหน่งที่คุณอยู่ ณ ตอนนี้'

  const { lat, lng, accuracyM } = incidentLocation.value
  const accuracyText = accuracyM ? ` · ความแม่นยำประมาณ ${Math.round(accuracyM)} ม.` : ''

  return `${lat.toFixed(6)}, ${lng.toFixed(6)}${accuracyText}`
})

const getLocationErrorMessage = (error) => {
  if (error?.code === 1) return 'ไม่ได้รับอนุญาตให้เข้าถึงตำแหน่ง กรุณาอนุญาตใน browser แล้วลองอีกครั้ง'
  if (error?.code === 2) return 'ยังระบุตำแหน่งไม่ได้ ลองขยับไปจุดที่มีสัญญาณดีขึ้นแล้วลองอีกครั้ง'
  if (error?.code === 3) return 'ใช้เวลาค้นหาตำแหน่งนานเกินไป กรุณาลองอีกครั้ง'
  return 'ไม่สามารถอ่านตำแหน่งปัจจุบันได้ กรุณาลองอีกครั้ง'
}

const useCurrentLocation = () => {
  locationError.value = ''

  if (!navigator.geolocation) {
    locationError.value = 'Browser นี้ไม่รองรับการระบุตำแหน่ง'
    return
  }

  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracyM: position.coords.accuracy,
      })
      isLocating.value = false
    },
    (error) => {
      locationError.value = getLocationErrorMessage(error)
      isLocating.value = false
    },
    {
      enableHighAccuracy: true,
      timeout: 15_000,
      maximumAge: 0,
    },
  )
}
</script>

<style scoped>
/* ============================== Location Picker Base ============================== */

.location-picker {
  padding: 1rem;
  border-radius: 0.875rem;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(31, 72, 125, 0.08);
}

/* ============================== Header ============================== */

.location-picker__header {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
}

.location-picker__header-icon {
  width: 1.9rem;
  height: 1.9rem;
  color: #1479ef;
  flex-shrink: 0;
}

.location-picker__title {
  margin: 0;
  color: #102968;
  font-size: 1rem;
  font-weight: 700;
}

.location-picker__subtitle {
  margin: 0.18rem 0 0;
  color: #63758f;
  font-size: 0.74rem;
}

/* ============================== Current Location Box ============================== */

.location-picker__current {
  display: grid;
  gap: 0.65rem;
  margin: 0.9rem 0;
  padding: 0.75rem;
  border-radius: 0.65rem;
  background: #fff4f4;
}

.location-picker__current--ready {
  background: #edf8f2;
}

.location-picker__current--ready .location-picker__label {
  color: #187a49;
}

.location-picker__current--ready .location-picker__hint {
  color: #45735d;
}

.location-picker__info {
  display: flex;
  flex-direction: column;
}

.location-picker__label {
  display: block;
  color: #c22831;
  font-size: 0.8rem;
  font-weight: 700;
}

.location-picker__hint {
  display: block;
  margin-top: 0.15rem;
  color: #7b6870;
  font-size: 0.7rem;
  line-height: 1.35;
}

.location-picker__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 2.55rem;
  border: 0;
  border-radius: 0.5rem;
  background: #e8333c;
  color: #ffffff;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.location-picker__button-icon {
  width: 1.2rem;
  height: 1.2rem;
}

.location-picker__button:hover,
.location-picker__button:focus-visible {
  background: #cf202a;
  outline: none;
}

.location-picker__button:disabled {
  cursor: progress;
  opacity: 0.72;
}

.location-picker__error {
  margin: -0.25rem 0 0.8rem;
  padding: 0.65rem 0.75rem;
  border-radius: 0.55rem;
  background: #fff1f1;
  color: #b4232a;
  font-size: 0.72rem;
  font-weight: 650;
  line-height: 1.4;
}

/* ============================== Map Container ============================== */

.location-picker__map {
  position: relative;
  height: 17rem;
  overflow: hidden;
  border-radius: 0.7rem;
  background: #dceef1;
}

.location-picker__map-canvas {
  width: 100%;
  height: 100%;
  min-height: 0;
}

/* ============================== Map Markers ============================== */

.map-marker {
  position: absolute;
  display: block;
  pointer-events: none;
}

.map-marker--incident {
  top: 50%;
  left: 50%;
  width: 2.8rem;
  height: 2.8rem;
  color: #e52d38;
  transform: translate(-50%, -100%);
  filter: drop-shadow(0 4px 5px rgba(114, 22, 27, 0.28));
}

.map-marker--incident svg {
  display: block;
  width: 100%;
  height: 100%;
}

/* ============================== Footer Note ============================== */

.location-picker__note {
  margin: 0.65rem 0 0;
  color: #63758f;
  font-size: 0.7rem;
  line-height: 1.4;
}
</style>
