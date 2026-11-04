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
        aria-controls="nearby-sheet-panel"
        @click="selectTab(tab.key)"
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
      <button
        v-if="!hasUserLocation"
        type="button"
        class="nearby-sheet__locate"
        :disabled="isLocating"
        @click="$emit('request-location')"
      >
        {{ isLocating ? t('location.locating') : t('nearbySheet.useLocation') }}
      </button>

      <p v-if="isLoading" class="nearby-sheet__state">{{ t('nearby.loading') }}</p>
      <p v-else-if="!activeItems.length" class="nearby-sheet__state">
        {{ activeTab === 'incidents' ? t('nearbySheet.emptyIncidents') : t('nearbySheet.emptyHelpRequests') }}
      </p>

      <ul v-else class="nearby-sheet__list">
        <li v-for="item in activeItems" :key="item.id">
          <button type="button" class="nearby-sheet__item" @click="$emit('select', item)">
            <span class="nearby-sheet__icon" :class="`nearby-sheet__icon--${item.kind}`">
              <img :src="item.iconUrl" alt="" />
            </span>
            <span class="nearby-sheet__body">
              <strong>{{ item.title }}</strong>
              <span>{{ item.areaLabel }} · {{ item.time }}</span>
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
import { computed, ref } from 'vue'

const props = defineProps({
  incidents: { type: Array, default: () => [] },
  helpRequests: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  hasUserLocation: { type: Boolean, default: false },
  isLocating: { type: Boolean, default: false },
})

defineEmits(['select', 'request-location'])

const { t } = useLocale()

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

const tabs = computed(() => [
  { key: 'incidents', label: 'nearbySheet.incidents', items: props.incidents },
  { key: 'help', label: 'nearbySheet.helpRequests', items: props.helpRequests },
])

const activeItems = computed(() => tabs.value.find((tab) => tab.key === activeTab.value)?.items ?? [])
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
  font-size: 0.9rem;
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
  font-size: 0.75rem;
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
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.nearby-sheet__state {
  margin: 16px 0;
  color: #6b7a99;
  font-size: 0.9rem;
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
.nearby-sheet__body span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nearby-sheet__body strong {
  color: #102968;
  font-size: 0.95rem;
}

.nearby-sheet__body span {
  color: #6b7a99;
  font-size: 0.8rem;
}

.nearby-sheet__distance {
  flex: 0 0 auto;
  color: #1d4ed8;
  font-size: 0.85rem;
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
</style>
