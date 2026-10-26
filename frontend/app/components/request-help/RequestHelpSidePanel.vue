<template>
  <aside class="side" aria-label="เลือกตำแหน่งที่ต้องการความช่วยเหลือ">
    <section class="map">
      <header class="map__header">
        <div>
          <h2>ตำแหน่งที่ต้องการความช่วยเหลือ</h2>
          <p>กดใช้ตำแหน่งปัจจุบัน หรือคลิกบนแผนที่เพื่อเลือกจุด</p>
        </div>
        <button type="button" class="map__current-button" :disabled="isLocating" :aria-busy="isLocating" @click="useCurrentLocation">
          {{ isLocating ? 'กำลังขอตำแหน่ง…' : 'ใช้ตำแหน่งปัจจุบัน' }}
        </button>
      </header>

      <section class="map__selection" :class="{ 'map__selection--ready': location }" aria-live="polite">
        <strong>{{ location ? 'เลือกตำแหน่งแล้ว' : 'ยังไม่ได้เลือกตำแหน่ง' }}</strong>
        <span>{{ locationLabel }}</span>
      </section>

      <p v-if="locationError" class="map__status map__status--error" role="alert">{{ locationError }}</p>

      <div class="map__canvas">
        <MapboxMap :center="mapCenter" :zoom="14" :show-geolocate-control="false" :editable-location="location" :allow-location-selection="true" class="map__canvas-map" @location-select="setMapLocation" />
      </div>

      <p v-if="submissionFeedback" class="map__submission-feedback" role="status">{{ submissionFeedback }}</p>
      <div class="map__action">
        <button type="button" class="map__submit-button" :disabled="isSubmitting" @click="emit('submit')">
          {{ isSubmitting ? 'กำลังส่งคำขอ…' : 'ส่งคำขอความช่วยเหลือ' }}
        </button>
      </div>
    </section>
  </aside>
</template>
<script setup>
import { computed } from 'vue'
import MapboxMap from '~/components/map/MapboxMap.vue'
import { useGeolocation } from '~/composables/useGeolocation'

const props = defineProps({
  location: { type: Object, default: null },
  isSubmitting: { type: Boolean, default: false },
  submissionFeedback: { type: String, default: '' },
})
const emit = defineEmits(['update:location', 'submit'])
const { getCurrentLocation, isLocating, locationError } = useGeolocation()
const defaultMapCenter = [100.5018, 13.7563]
const mapCenter = computed(() => props.location ? [props.location.lng, props.location.lat] : defaultMapCenter)
const locationLabel = computed(() => {
  if (!props.location) return 'ยังไม่ได้เลือกตำแหน่ง'
  const { lat, lng, accuracyM } = props.location
  const accuracyLabel = accuracyM !== null && accuracyM !== undefined ? ` · ความแม่นยำประมาณ ${Math.round(accuracyM)} ม.` : ''
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}${accuracyLabel}`
})
const setMapLocation = (location) => emit('update:location', { ...location, accuracyM: null, source: 'map' })
const useCurrentLocation = async () => {
  try {
    const location = await getCurrentLocation()
    emit('update:location', location)
  } catch {
    // useGeolocation จัดการข้อความผิดพลาดให้แสดงใน locationError แล้ว
  }
}
</script>
<style scoped>
.side {
  min-width: 0;
  padding-left: 1.15rem;
  border-left: 1px solid #e0eaf6;
}

.map__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: .8rem;
}

.map h2 {
  margin: 0;
  color: #102968;
  font-size: 1.05rem;
}

.map__header p,
.map__selection span,
.map__status {
  color: #60718c;
  font-size: .78rem;
  line-height: 1.5;
}

.map__header p {
  margin: .2rem 0 0;
}

.map__current-button {
  flex: 0 0 auto;
  min-height: 2.45rem;
  padding: 0 .7rem;
  border: 0;
  border-radius: .45rem;
  background: #eb2631;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: .73rem;
  font-weight: 800;
}

.map__current-button:disabled {
  cursor: wait;
  opacity: .7;
}

.map__selection {
  display: grid;
  gap: .12rem;
  margin: .75rem 0;
  padding: .68rem .75rem;
  border: 1px solid #dbe7f5;
  border-radius: .55rem;
  background: #f9fbff;
}

.map__selection strong {
  color: #29457a;
  font-size: .78rem;
}

.map__selection--ready {
  border-color: #bfe5ca;
  background: #f4fcf6;
}

.map__selection span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map__status {
  margin: 0 0 .65rem;
}

.map__status--error {
  padding: .6rem .7rem;
  border-radius: .45rem;
  background: #fff1f1;
  color: #b4232a;
}

.map__canvas {
  position: relative;
  height: clamp(32rem, 58dvh, 42rem);
  overflow: hidden;
  border: 1px solid #d6e3f2;
  border-radius: .65rem;
  background: #e4f3fb;
}

.map__canvas-map {
  width: 100%;
  height: 100%;
}

.map__submission-feedback {
  margin: .75rem 0 0;
  padding: .75rem;
  border-radius: .6rem;
  background: #edf6ff;
  color: #24558e;
  font-size: .82rem;
}

.map__action {
  display: flex;
  margin-top: .75rem;
}

.map__submit-button {
  width: 100%;
  min-height: 3rem;
  padding: 0 1rem;
  border: 0;
  border-radius: .65rem;
  background: #eb2631;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
}

.map__submit-button:disabled {
  cursor: not-allowed;
  opacity: .7;
}

@media (max-width: 58rem) {
  .side {
    padding: 1rem 0 0;
    border-top: 1px solid #e0eaf6;
    border-left: 0;
  }
}

@media (min-width: 58.01rem) {
  /* ให้แผนที่ใช้ความสูงที่เหลือของคอลัมน์ขวา และเลื่อนปุ่มลงไปท้ายคอลัมน์ */
  .side {
    display: flex;
  }

  .map {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  .map__canvas {
    flex: 1 1 auto;
    height: auto;
    min-height: 32rem;
  }
}

@media (max-width: 48rem) {
  .map__header {
    align-items: stretch;
    flex-direction: column;
  }

  .map__current-button {
    width: 100%;
  }

  .map__submit-button {
    width: 100%;
  }

  .map__canvas {
    height: 24rem;
  }
}
</style>
