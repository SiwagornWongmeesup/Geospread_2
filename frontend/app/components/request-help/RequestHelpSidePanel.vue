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
        <strong>{{ locationTitle }}</strong>
        <span>{{ locationLabel }}</span>
      </section>

      <p v-if="locationError" class="map__status map__status--error" role="alert">{{ locationError }}</p>
      <!-- GPS ไม่แม่น (เช่น คอมที่ไม่มี GPS เดาจาก Wi-Fi) บอกให้ลากหมุดไปจุดจริง คนมาช่วยจะได้ไม่ไปผิดที่ -->
      <p v-else-if="isLowAccuracy" class="map__status map__status--warning" role="status">
        {{ t('requestHelp.lowAccuracy', { accuracy: accuracyLabel }) }}
      </p>

      <div class="map__canvas">
        <MapboxMap :center="mapCenter" :zoom="14" :editable-location="location" :allow-location-selection="true" class="map__canvas-map" @location-select="setMapLocation" />
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

      <p v-if="submissionFeedback && !hideSubmit" class="map__submission-feedback" role="status">{{ submissionFeedback }}</p>
      <!-- มือถือแบบทีละขั้นซ่อนปุ่มส่งตรงนี้ เพราะปุ่มส่งอยู่ในขั้นสุดท้าย -->
      <div v-if="!hideSubmit" class="map__action">
        <button type="button" class="map__submit-button" :disabled="isSubmitting" @click="emit('submit')">
          {{ isSubmitting ? t('requestHelp.submitting') : t('requestHelp.submit') }}
        </button>
      </div>

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
  hideSubmit: { type: Boolean, default: false },
})
const emit = defineEmits(['update:location', 'submit'])
const { getCurrentLocation, isLocating, locationError } = useGeolocation()
const { t } = useLocale()
// รายละเอียดที่อยู่ที่ผู้ใช้พิมพ์ เช่น บ้านเลขที่ ชั้น จุดสังเกต (ยังไม่ได้ส่งไป API)
const addressDetail = ref('')
const defaultMapCenter = [100.5018, 13.7563]
const mapCenter = computed(() => props.location ? [props.location.lng, props.location.lat] : defaultMapCenter)
// หัวข้อของกล่องตำแหน่ง: บอกว่าตำแหน่งมาจากไหน
const locationTitle = computed(() => {
  // ยังไม่ได้เลือก
  if (!props.location) return t('requestHelp.noLocation')
  // ใช้ตำแหน่งปัจจุบัน (GPS)
  if (props.location.source === 'device') return t('location.currentPlace')
  // ค้นหาสถานที่: ใช้ชื่อสถานที่ที่ค้นเจอ
  if (props.location.placeName) return props.location.placeName
  // คลิกบนแผนที่
  return t('report.pinnedOnMap')
})

// บรรทัดล่าง: พิกัด + ความแม่นยำ หรือวิธีเลือกตำแหน่งถ้ายังไม่ได้เลือก
const locationLabel = computed(() => {
  if (!props.location) return t('requestHelp.noLocationHint')
  const { lat, lng, accuracyM } = props.location
  const accuracyLabel = accuracyM !== null && accuracyM !== undefined ? ` · ${t('report.accuracy', { value: Math.round(accuracyM) })}` : ''
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}${accuracyLabel}`
})
// เกินระยะนี้ถือว่าตำแหน่งจากเครื่องไม่แม่นพอ (เท่ากับหน้าแจ้งเหตุ)
const lowAccuracyThresholdM = 200
const isLowAccuracy = computed(() => {
  const location = props.location
  if (!location || location.source !== 'device') return false
  if (location.accuracyM === null || location.accuracyM === undefined) return false
  return location.accuracyM > lowAccuracyThresholdM
})
// ระยะคลาดเคลื่อน: เกิน 1 กม. แสดงเป็นกิโลเมตร
const accuracyLabel = computed(() => {
  const accuracy = props.location?.accuracyM ?? 0
  if (accuracy >= 1000) return t('units.kilometers', { value: (accuracy / 1000).toFixed(1) })
  return t('units.meters', { value: Math.round(accuracy) })
})

const setMapLocation = (location) => emit('update:location', { ...location, accuracyM: null, source: 'map' })
// ผลค้นหา/พิกัดที่กรอก ถือเป็นจุดที่ผู้ใช้เลือกเอง (source 'map' ตามที่ฐานข้อมูลรองรับ)
const setSearchLocation = (item) => emit('update:location', { lat: item.center[1], lng: item.center[0], accuracyM: null, placeName: item.label, source: 'map' })
const applyCurrentLocation = async ({ keepSelectedPin }) => {
  try {
    const location = await getCurrentLocation()
    if (keepSelectedPin && props.location?.source === 'map') return
    emit('update:location', location)
  } catch {
    // useGeolocation จัดการข้อความผิดพลาดให้แสดงใน locationError แล้ว
  }
}

// ผู้ใช้กดปุ่มเอง: ใช้ตำแหน่งจริงแทนหมุดเดิมเสมอ
const useCurrentLocation = () => applyCurrentLocation({ keepSelectedPin: false })
// หน้าสั่งขอให้เองตอนเข้าขั้นตำแหน่ง: ระหว่างรอผู้ใช้อาจปักหมุดไปแล้ว จึงห้ามทับหมุดนั้น
const locateAutomatically = () => applyCurrentLocation({ keepSelectedPin: true })

defineExpose({ locateAutomatically })
</script>
<style scoped>
.side {
  min-width: 0;
  padding-left: 18px;
  border-left: 1px solid #e0eaf6;
}

.map__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 13px;
}

.map h2 {
  margin: 0;
  color: #102968;
  font-size: 17px;
}

.map__header p,
.map__selection span,
.map__status {
  color: #60718c;
  font-size: 12px;
  line-height: 1.5;
}

.map__header p {
  margin: 3px 0 0;
}

.map__current-button {
  flex: 0 0 auto;
  min-height: 39px;
  padding: 0 11px;
  border: 1px solid var(--gs-action);
  border-radius: 8px;
  background: var(--gs-action-tint);
  color: var(--gs-action);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 750;
}

.map__current-button:disabled {
  cursor: wait;
  opacity: .7;
}

.map__selection {
  display: grid;
  gap: 1.92px;
  margin: 12px 0;
  padding: 11px 12px;
  border: 1px solid #dbe7f5;
  border-radius: 9px;
  background: #f9fbff;
}

.map__selection strong {
  color: #29457a;
  font-size: 12px;
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
  margin: 0 0 10px;
}

.map__status--warning {
  padding: 10px 12px;
  border: 1px solid #ecd3a4;
  border-radius: 8px;
  background: var(--gs-pending-tint);
  color: var(--gs-pending);
  font-size: 13px;
}

.map__status--error {
  padding: 10px 11px;
  border-radius: 7px;
  background: #fff1f1;
  color: #b4232a;
}

.map__canvas {
  position: relative;
  height: clamp(512px, 58dvh, 672px);
  overflow: hidden;
  border: 1px solid #d6e3f2;
  border-radius: 10px;
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


.map__submission-feedback {
  margin: 12px 0 0;
  padding: 12px;
  border-radius: 10px;
  background: #edf6ff;
  color: #24558e;
  font-size: 13px;
}

.map__action {
  display: flex;
  margin-top: 12px;
}

.map__submit-button {
  width: 100%;
  min-height: 48px;
  padding: 0 16px;
  border: 0;
  border-radius: 10px;
  background: var(--gs-action);
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
}

.map__submit-button:disabled {
  cursor: not-allowed;
  opacity: .7;
}

@media (max-width: 928px) {
  .side {
    padding: 16px 0 0;
    border-top: 1px solid #e0eaf6;
    border-left: 0;
  }
}

@media (min-width: 928px) {
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
    min-height: 512px;
  }
}

/* จอกว้าง (สองคอลัมน์): ย้ายปุ่มส่งขึ้นไปบนสุดของคอลัมน์ขวา เหนือส่วนตำแหน่ง
   เดิมอยู่ใต้แผนที่ ต้องเลื่อนลงถึงจะเห็น / จอแคบ (คอลัมน์เดียว) ปุ่มยังอยู่ท้ายฟอร์มเหมือนเดิม */
@media (min-width: 1200px) {
  .map__action {
    order: -2;
    margin: 0 0 14px;
    padding-bottom: 14px;
    border-bottom: 1px solid #e0eaf6;
  }

  .map__submission-feedback {
    order: -1;
    margin: 0 0 12px;
  }
}

@media (max-width: 768px) {
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
    height: 384px;
  }
}
</style>
