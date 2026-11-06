<template>
  <!-- หน้าคอม: กล่องรายการของกลุ่มหมุดที่ติดกัน ลอยอยู่มุมล่างซ้ายของแผนที่ -->
  <section class="map-group-panel" :aria-label="t('nearbySheet.groupTitle', { count: items.length })">
    <header class="map-group-panel__head">
      <strong>{{ t('nearbySheet.groupTitle', { count: items.length }) }}</strong>
      <button type="button" class="map-group-panel__close" :aria-label="t('nearbySheet.closeGroup')" @click="$emit('close')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2.2" /></svg>
      </button>
    </header>

    <ul class="map-group-panel__list">
      <li v-for="item in items" :key="item.id">
        <button
          type="button"
          class="map-group-panel__item"
          :aria-current="selectedItemId === item.id ? 'true' : undefined"
          @click="$emit('select', item)"
        >
          <img :src="item.iconUrl" alt="" />
          <span class="map-group-panel__body">
            <span class="map-group-panel__title-row">
              <strong>{{ item.title }}</strong>
              <StatusBadge v-if="item.statusLabel" :tone="item.statusTone" :label="item.statusLabel" />
            </span>
            <!-- ทุกรายการอยู่จุดเดียวกัน เวลาจึงสำคัญกว่าและขึ้นก่อน ไม่โดนตัดเป็น … -->
            <span class="map-group-panel__meta">{{ item.time }} · {{ getPlaceLabel(item) }}</span>
          </span>
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { watch } from 'vue'
import StatusBadge from '~/components/common/StatusBadge.vue'
import { usePlaceNames } from '~/composables/usePlaceNames'

const props = defineProps({
  items: { type: Array, default: () => [] },
  selectedItemId: { type: String, default: null },
})

defineEmits(['select', 'close'])

const { t } = useLocale()
// ชื่อสถานที่จริงของแต่ละรายการ
const { loadPlaceNames, getPlaceLabel } = usePlaceNames()

// ถามชื่อสถานที่ไม่เกิน 20 รายการ กันการเรียก Mapbox มากเกินไป
watch(() => props.items, (items) => {
  loadPlaceNames(items.slice(0, 20))
}, { immediate: true })
</script>

<style scoped>
.map-group-panel {
  position: absolute;
  z-index: 6;
  bottom: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  /* แคบกว่าครึ่งแผนที่ จะได้ไม่บังหมุดที่อยู่กลางแผนที่ */
  width: min(300px, calc(100% - 32px));
  max-height: min(420px, calc(100% - 112px));
  border: 1px solid var(--gs-line-strong);
  border-radius: 14px;
  background: var(--gs-surface);
  box-shadow: 0 12px 28px rgb(15 41 104 / 22%);
}

.map-group-panel__head {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 10px 10px 16px;
  border-bottom: 1px solid #edf1f7;
}

.map-group-panel__head strong {
  color: #102968;
  font-size: 15px;
  line-height: 1.4;
}

.map-group-panel__close {
  display: grid;
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #4a5f86;
  cursor: pointer;
}

.map-group-panel__close:hover {
  background: #f3f7fd;
}

.map-group-panel__close svg {
  width: 20px;
  height: 20px;
}

.map-group-panel__list {
  min-height: 0;
  margin: 0;
  padding: 4px 8px 8px;
  overflow-y: auto;
  list-style: none;
}

.map-group-panel__item {
  display: flex;
  width: 100%;
  min-height: 56px;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.map-group-panel__item:hover,
.map-group-panel__item[aria-current='true'] {
  background: #f3f7fd;
}

.map-group-panel__item img {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.map-group-panel__body {
  display: grid;
  flex: 1;
  min-width: 0;
  gap: 2px;
}

.map-group-panel__title-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
}

.map-group-panel__title-row strong {
  min-width: 0;
  overflow: hidden;
  color: #102968;
  font-size: 14px;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-group-panel__meta {
  overflow: hidden;
  color: #52708b;
  font-size: 13px;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-group-panel__close:focus-visible,
.map-group-panel__item:focus-visible {
  outline: 3px solid rgb(37 99 235 / 35%);
  outline-offset: 1px;
}
</style>
