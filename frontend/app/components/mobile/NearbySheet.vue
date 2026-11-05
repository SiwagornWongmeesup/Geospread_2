<template>
  <!-- แผ่นรายการด้านล่างจอหน้าแรกมือถือ: สลับดู "เหตุใกล้คุณ" กับ "ขอความช่วยเหลือใกล้คุณ" -->
  <section
    class="nearby-sheet"
    :class="[`nearby-sheet--${state}`, { 'nearby-sheet--dragging': dragHeight !== null }]"
    :style="dragHeight !== null ? { height: `${dragHeight}px` } : null"
    :aria-label="t('nearbySheet.label')"
  >
    <!-- แถบจับด้านบน: ลากขึ้น/ลงเพื่อขยายหรือหุบ, กดเพื่อสลับหุบ/เปิดครึ่งจอ -->
    <button
      type="button"
      class="nearby-sheet__handle"
      :aria-expanded="state !== 'collapsed'"
      :aria-label="state === 'collapsed' ? t('nearbySheet.expand') : t('nearbySheet.collapse')"
      @pointerdown="startDrag"
      @pointermove="moveDrag"
      @pointerup="endDrag"
      @pointercancel="cancelDrag"
      @keydown.up.prevent="step(1)"
      @keydown.down.prevent="step(-1)"
      @click="onHandleClick"
    >
      <span aria-hidden="true"></span>
    </button>

    <div class="nearby-sheet__tabs" role="tablist" :aria-label="t('nearbySheet.tabsLabel')">
      <button
        v-for="tab in tabs"
        :id="`nearby-tab-${tab.key}`"
        :key="tab.key"
        type="button"
        role="tab"
        class="nearby-sheet__tab"
        :aria-selected="activeTab === tab.key"
        :tabindex="activeTab === tab.key ? 0 : -1"
        aria-controls="nearby-sheet-panel"
        @click="selectTab(tab.key)"
        @keydown.right.prevent="focusOtherTab"
        @keydown.left.prevent="focusOtherTab"
      >
        {{ t(tab.label) }}
        <span class="nearby-sheet__count">{{ tab.items.length }}</span>
      </button>
    </div>

    <div
      id="nearby-sheet-panel"
      class="nearby-sheet__panel"
      role="tabpanel"
      :hidden="state === 'collapsed' && dragHeight === null"
      :aria-labelledby="`nearby-tab-${activeTab}`"
    >
      <!-- ชวนติดตั้งแอป อยู่ในแผ่นรายการ ไม่บังแผนที่ กดปิดได้ -->
      <InstallAppBanner class="nearby-sheet__install" />

      <button
        v-if="!hasUserLocation"
        type="button"
        class="nearby-sheet__locate"
        :disabled="isLocating"
        @click="$emit('request-location')"
      >
        {{ isLocating ? t('location.locating') : t('nearbySheet.useLocation') }}
      </button>

      <!-- ปุ่มเลือกรัศมี "รอบตัว" กดแล้วบอกแม่ (Mobile.vue) ให้เปลี่ยนรัศมี รายการจะกรองใหม่ทันที -->
      <div v-if="hasUserLocation" class="nearby-sheet__radius" role="group" :aria-label="t('nearbySheet.radiusLabel')">
        <button
          v-for="option in radiusOptions"
          :key="option"
          type="button"
          class="nearby-sheet__radius-chip"
          :aria-pressed="radiusMeters === option"
          @click="$emit('change-radius', option)"
        >
          {{ t('units.kilometers', { value: option / 1000 }) }}
        </button>
      </div>

      <p v-if="isLoading" class="nearby-sheet__state">{{ t('nearby.loading') }}</p>
      <!-- ยังไม่รู้ตำแหน่ง: บอกว่าต้องเปิดตำแหน่งก่อนถึงจะเห็นเหตุรอบตัว (ปุ่มด้านบน) -->
      <p v-else-if="!hasUserLocation" class="nearby-sheet__state">{{ t('nearbySheet.needLocation') }}</p>
      <p v-else-if="!activeItems.length" class="nearby-sheet__state">
        {{ activeTab === 'incidents' ? t('nearbySheet.emptyIncidents', { radius: radiusLabel }) : t('nearbySheet.emptyHelpRequests', { radius: radiusLabel }) }}
      </p>

      <ul v-else class="nearby-sheet__list">
        <li v-for="item in activeItems" :key="item.id">
          <button type="button" class="nearby-sheet__item" @click="$emit('select', item)">
            <span class="nearby-sheet__icon" :class="`nearby-sheet__icon--${item.kind}`">
              <img :src="item.iconUrl" alt="" />
            </span>
            <span class="nearby-sheet__body">
              <span class="nearby-sheet__title-row">
                <strong>{{ item.title }}</strong>
                <StatusBadge v-if="item.statusLabel" :tone="item.statusTone" :label="item.statusLabel" />
              </span>
              <span>{{ getPlaceLabel(item) }} · {{ item.time }}</span>
            </span>
            <span v-if="item.distanceMeters !== null" class="nearby-sheet__distance">
              {{ item.distanceFromUserLabel }}
            </span>
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import StatusBadge from '~/components/common/StatusBadge.vue'
import InstallAppBanner from '~/components/common/InstallAppBanner.vue'
import { usePlaceNames } from '~/composables/usePlaceNames'

const props = defineProps({
  incidents: { type: Array, default: () => [] },
  helpRequests: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  hasUserLocation: { type: Boolean, default: false },
  isLocating: { type: Boolean, default: false },
  // รัศมีที่ถือว่า "รอบตัว" (เมตร) ใช้บอกในข้อความตอนไม่มีรายการ
  radiusMeters: { type: Number, default: 5000 },
})

// รัศมีแบบอ่านง่าย เช่น "5 กม."
const radiusLabel = computed(() => t('units.kilometers', { value: Math.round(props.radiusMeters / 1000) }))

// ตัวเลือกรัศมี (เมตร) = 1 / 5 / 10 / 25 กม.
const radiusOptions = [1000, 5000, 10000, 25000]

defineEmits(['select', 'request-location', 'change-radius'])

const { t } = useLocale()
// ชื่อสถานที่จริงของแต่ละรายการ (แทนข้อความกลางๆ "พื้นที่ที่รายงาน")
const { loadPlaceNames, getPlaceLabel } = usePlaceNames()

// ความสูงของแผ่น 3 ระดับ: หุบ (เห็นแค่แท็บ) / ครึ่งจอ / เกือบเต็มจอ
const states = ['collapsed', 'half', 'full']
const state = ref('half')
const activeTab = ref('incidents')

const COLLAPSED_PX = 96
const heightOf = (name) => {
  if (name === 'collapsed') return COLLAPSED_PX
  return window.innerHeight * (name === 'full' ? 0.72 : 0.34)
}

// ลากแถบจับ: ระหว่างลากความสูงตามนิ้ว ปล่อยแล้วดีดไประดับที่ใกล้ที่สุด
const dragHeight = ref(null)
let drag = null
let suppressClick = false

const startDrag = (event) => {
  drag = { startY: event.clientY, startHeight: heightOf(state.value), moved: false }
  event.currentTarget.setPointerCapture?.(event.pointerId)
}

const moveDrag = (event) => {
  if (!drag) return
  const dy = drag.startY - event.clientY
  if (!drag.moved && Math.abs(dy) < 6) return
  drag.moved = true
  dragHeight.value = Math.min(heightOf('full'), Math.max(COLLAPSED_PX, drag.startHeight + dy))
}

const endDrag = (event) => {
  if (!drag) return
  if (drag.moved) {
    const dy = drag.startY - event.clientY
    const current = dragHeight.value
    // ลากเกิน 60px ให้ไปอีกระดับตามทิศที่ลาก ไม่อย่างนั้นกลับไประดับที่ใกล้ที่สุด
    const index = states.indexOf(state.value)
    if (Math.abs(dy) > 60) {
      state.value = states[Math.max(0, Math.min(states.length - 1, index + Math.sign(dy)))]
    } else {
      state.value = states.reduce((best, name) => (Math.abs(heightOf(name) - current) < Math.abs(heightOf(best) - current) ? name : best))
    }
    suppressClick = true
  }
  drag = null
  dragHeight.value = null
}

const cancelDrag = () => {
  drag = null
  dragHeight.value = null
}

const onHandleClick = () => {
  if (suppressClick) {
    suppressClick = false
    return
  }
  state.value = state.value === 'collapsed' ? 'half' : 'collapsed'
}

const step = (direction) => {
  const index = states.indexOf(state.value)
  state.value = states[Math.max(0, Math.min(states.length - 1, index + direction))]
}

// กดแท็บตอนหุบอยู่ ให้เปิดขึ้นมาครึ่งจอด้วย
const selectTab = (key) => {
  activeTab.value = key
  if (state.value === 'collapsed') state.value = 'half'
}

// ลูกศรซ้าย/ขวาบนแท็บ: สลับไปอีกแท็บและย้ายโฟกัสตาม (มีแค่ 2 แท็บ)
const focusOtherTab = () => {
  let nextKey = 'incidents'
  if (activeTab.value === 'incidents') {
    nextKey = 'help'
  }
  selectTab(nextKey)
  document.getElementById(`nearby-tab-${nextKey}`)?.focus()
}

const tabs = computed(() => [
  { key: 'incidents', label: 'nearbySheet.incidents', items: props.incidents },
  { key: 'help', label: 'nearbySheet.helpRequests', items: props.helpRequests },
])

const activeItems = computed(() => tabs.value.find((tab) => tab.key === activeTab.value)?.items ?? [])

// ถามชื่อสถานที่เฉพาะรายการที่แสดงอยู่ (ไม่เกิน 20 รายการ) กันการเรียก Mapbox มากเกินไป
watch(activeItems, (items) => {
  loadPlaceNames(items.slice(0, 20))
}, { immediate: true })
</script>

<style scoped>
.nearby-sheet {
  position: absolute;
  z-index: 20;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  /* ย่ออยู่: เห็นแท็บและรายการ 2-3 อันแรก ส่วนบนยังเห็นแผนที่ */
  height: 34dvh;
  box-sizing: border-box;
  border-radius: 22px 22px 0 0;
  background: #ffffff;
  box-shadow: 0 -8px 28px rgb(16 41 104 / 18%);
  transition: height 240ms ease;
}

.nearby-sheet--collapsed {
  height: 96px;
}

.nearby-sheet--full {
  height: 72dvh;
}

/* ระหว่างลาก ความสูงต้องตามนิ้วทันที ไม่ต้องมีแอนิเมชัน */
.nearby-sheet--dragging {
  transition: none;
}

.nearby-sheet__handle {
  display: grid;
  flex: 0 0 auto;
  align-self: stretch;
  width: 100%;
  height: 26px;
  touch-action: none;
  padding: 0;
  place-items: center;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.nearby-sheet__handle span {
  width: 40px;
  height: 5px;
  border-radius: 999px;
  background: #cfdbea;
}

/* แท็บสองปุ่มแบบแอปรถเมล์: ปุ่มที่เลือกเป็นสีขาวนูนขึ้น อีกปุ่มกลืนกับพื้นฟ้าอ่อน */
.nearby-sheet__tabs {
  display: grid;
  flex: 0 0 auto;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin: 0 16px;
  padding: 4px;
  border-radius: 14px;
  background: #e6effa;
}

.nearby-sheet__tab {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 8px;
  border: 0;
  border-radius: 11px;
  background: transparent;
  color: #4a5f86;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease;
}

.nearby-sheet__tab[aria-selected='true'] {
  background: #ffffff;
  color: #102968;
  box-shadow: 0 2px 8px rgb(16 41 104 / 12%);
}

.nearby-sheet__count {
  min-width: 22px;
  padding: 1px 6px;
  box-sizing: border-box;
  border-radius: 999px;
  background: #d3e0f3;
  color: #102968;
  font-size: 12px;
}

.nearby-sheet__tab[aria-selected='true'] .nearby-sheet__count {
  background: #102968;
  color: #ffffff;
}

.nearby-sheet__panel {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  /* เว้นล่างให้พ้นปุ่ม + ของแถบเมนูที่ยื่นขึ้นมา */
  padding: 8px 16px 48px;
  overscroll-behavior: contain;
}

.nearby-sheet__locate {
  width: 100%;
  min-height: 40px;
  margin-bottom: 4px;
  border: 1px dashed #b7c8e3;
  border-radius: 10px;
  background: #f5f8fd;
  color: #1d4ed8;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

/* ปุ่มรัศมี 4 อันเรียงแถวเดียว ปุ่มที่เลือกอยู่เป็นสีน้ำเงินเข้ม */
.nearby-sheet__radius {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  margin: 4px 0 8px;
}

.nearby-sheet__radius-chip {
  min-height: 36px;
  padding: 0 4px;
  border: 1px solid #cfdbea;
  border-radius: 999px;
  background: #ffffff;
  color: #4a5f86;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease;
}

.nearby-sheet__radius-chip[aria-pressed='true'] {
  border-color: #102968;
  background: #102968;
  color: #ffffff;
}

.nearby-sheet__radius-chip:focus-visible {
  outline: 3px solid rgb(37 99 235 / 35%);
  outline-offset: 2px;
}

.nearby-sheet__state {
  margin: 16px 0;
  color: #52708b;
  font-size: 14px;
  text-align: center;
}

.nearby-sheet__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.nearby-sheet__list li + li {
  border-top: 1px solid #edf1f7;
}

.nearby-sheet__item {
  display: flex;
  width: 100%;
  min-height: 64px;
  align-items: center;
  gap: 12px;
  padding: 10px 2px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.nearby-sheet__item:active {
  background: #f3f7fd;
}

.nearby-sheet__icon {
  display: grid;
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px;
  background: #fdecec;
}

.nearby-sheet__icon--help_request {
  background: #e5f4ec;
}

.nearby-sheet__icon img {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.nearby-sheet__body {
  display: grid;
  flex: 1;
  min-width: 0;
  gap: 2px;
}

.nearby-sheet__body strong,
.nearby-sheet__body > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ชื่อเหตุ + ป้ายสถานะอยู่บรรทัดเดียวกัน ชื่อยาวจะตัดเป็น … ป้ายไม่โดนตัด */
.nearby-sheet__title-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
}

.nearby-sheet__body strong {
  min-width: 0;
  color: #102968;
  font-size: 15px;
}

.nearby-sheet__body > span:not(.nearby-sheet__title-row) {
  color: #52708b;
  font-size: 13px;
}

.nearby-sheet__distance {
  flex: 0 0 auto;
  color: #1d4ed8;
  font-size: 14px;
  font-weight: 700;
}

.nearby-sheet__handle:focus-visible,
.nearby-sheet__tab:focus-visible,
.nearby-sheet__item:focus-visible,
.nearby-sheet__locate:focus-visible {
  outline: 3px solid rgb(37 99 235 / 35%);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .nearby-sheet,
  .nearby-sheet__tab {
    transition: none;
  }
}

.nearby-sheet__install {
  margin-bottom: 10px;
}
</style>
