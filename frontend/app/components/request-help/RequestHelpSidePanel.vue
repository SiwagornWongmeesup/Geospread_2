<template>
  <aside class="side" :aria-label="t('requestHelp.sideLabel')">
    <section class="map">
      <header class="map__header">
        <div>
          <h2>{{ t('requestHelp.locationHeading') }}</h2>
          <p>{{ t('requestHelp.locationHint') }}</p>
        </div>
        <button type="button" class="map__current-button" :disabled="isLocating" :aria-busy="isLocating" @click="useCurrentLocation">
          {{ isLocating ? t('location.requesting') : t('location.useCurrent') }}
        </button>
      </header>

      <section class="map__selection" :class="{ 'map__selection--ready': location }" aria-live="polite">
        <strong>{{ location ? t('report.locationChosen') : t('requestHelp.noLocation') }}</strong>
        <span>{{ locationLabel }}</span>
      </section>

      <p v-if="locationError" class="map__status map__status--error" role="alert">{{ locationError }}</p>

      <div class="map__canvas">
        <MapboxMap :center="mapCenter" :zoom="14" :show-geolocate-control="false" :editable-location="location" :allow-location-selection="true" class="map__canvas-map" @location-select="setMapLocation" />
        <!-- ค้นหาสถานที่ หรือวางพิกัด/ลิงก์ Google Maps เพื่อปักหมุด -->
        <MapLocationSearch variant="pick" @select="setSearchLocation" />
      </div>

      <!-- ช่องกรอกรายละเอียดที่อยู่ (ตอนนี้ยังไม่ได้ส่งไป API) -->
      <label class="map__address">
        <span class="map__address-label">
          {{ t('requestHelp.addressLabel') }}
          <span class="map__new-badge">{{ t('requestHelp.new') }}</span>
        </span>
        <input
          v-model="addressDetail"
          type="text"
          maxlength="200"
          :placeholder="t('requestHelp.addressPlaceholder')"
        />
      </label>

      <!-- ข้อความบอกว่าใครเห็นข้อมูลอะไรบ้าง -->
      <p class="map__privacy">
        <svg class="map__privacy-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
        <span>{{ t('requestHelp.privacy') }}</span>
      </p>

      <p v-if="submissionFeedback" class="map__submission-feedback" role="status">{{ submissionFeedback }}</p>
      <div class="map__action">
        <button type="button" class="map__submit-button" :disabled="isSubmitting" @click="emit('submit')">
          {{ isSubmitting ? t('requestHelp.submitting') : t('requestHelp.submit') }}
        </button>
      </div>

      <!-- เบอร์ฉุกเฉิน: กดแล้วเปิดหน้าโทรออกของโทรศัพท์ -->
      <p class="map__emergency">
        {{ t('requestHelp.emergencyBefore') }}
        <a href="tel:1669">1669</a>
        {{ t('requestHelp.emergencyOr') }}
        <a href="tel:1784">1784</a>
        {{ t('requestHelp.emergencyAfter') }}
      </p>
    </section>
  </aside>
</template>
<script setup>
import { computed, ref } from 'vue'
import MapboxMap from '~/components/map/MapboxMap.vue'
import MapLocationSearch from '~/components/map/MapLocationSearch.vue'
import { useGeolocation } from '~/composables/useGeolocation'

const props = defineProps({
  location: { type: Object, default: null },
  isSubmitting: { type: Boolean, default: false },
  submissionFeedback: { type: String, default: '' },
})
const emit = defineEmits(['update:location', 'submit'])
const { getCurrentLocation, isLocating, locationError } = useGeolocation()
const { t } = useLocale()
// รายละเอียดที่อยู่ที่ผู้ใช้พิมพ์ เช่น บ้านเลขที่ ชั้น จุดสังเกต (ยังไม่ได้ส่งไป API)
const addressDetail = ref('')
const defaultMapCenter = [100.5018, 13.7563]
const mapCenter = computed(() => props.location ? [props.location.lng, props.location.lat] : defaultMapCenter)
const locationLabel = computed(() => {
  if (!props.location) return t('requestHelp.noLocation')
  const { lat, lng, accuracyM } = props.location
  const accuracyLabel = accuracyM !== null && accuracyM !== undefined ? ` · ${t('report.accuracy', { value: Math.round(accuracyM) })}` : ''
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}${accuracyLabel}`
})
const setMapLocation = (location) => emit('update:location', { ...location, accuracyM: null, source: 'map' })
// ผลค้นหา/พิกัดที่กรอก ถือเป็นจุดที่ผู้ใช้เลือกเอง (source 'map' ตามที่ฐานข้อมูลรองรับ)
const setSearchLocation = (item) => emit('update:location', { lat: item.center[1], lng: item.center[0], accuracyM: null, source: 'map' })
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

/* ช่องบ้านเลขที่ ชั้น จุดสังเกต */
.map__address {
  display: grid;
  gap: 8px;
  margin-top: 16px;
}

.map__address-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #102968;
  font-size: 15px;
  font-weight: 800;
}

.map__new-badge {
  padding: 3px 8px;
  border-radius: 6px;
  background: #102968;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
}

.map__address input {
  box-sizing: border-box;
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid #d4dfee;
  border-radius: 12px;
  color: #17345f;
  font: inherit;
  font-size: 15px;
}

.map__address input:focus {
  border-color: #1479ef;
  outline: 3px solid rgb(20 121 239 / 15%);
}

/* กล่องข้อความเรื่องความเป็นส่วนตัว */
.map__privacy {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 12px 0 0;
  padding: 14px 16px;
  border-radius: 12px;
  background: #eef4fd;
  color: #102968;
  font-size: 14px;
  line-height: 1.55;
}

.map__privacy-icon {
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  margin-top: 2px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

/* ข้อความเบอร์ฉุกเฉินใต้ปุ่มส่ง */
.map__emergency {
  margin: 12px 0 0;
  color: #60718c;
  font-size: 14px;
  text-align: center;
}

.map__emergency a {
  color: #1d63d8;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
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
