<script setup>
// ตัวกรองหน้า /incidents: สถานะ (ปุ่มพร้อมจำนวน) และระยะทางจากผู้ใช้
// ค่าที่เลือกเก็บไว้ที่หน้าแม่ (v-model:distance, v-model:status) คอมโพเนนต์นี้แค่แสดงและแจ้งค่าที่เปลี่ยน
const props = defineProps({
  distance: { type: String, default: 'any' },
  status: { type: String, default: 'any' },
  // จำนวนเหตุการณ์ของแต่ละสถานะ { any, verified, ongoing, pending } ใช้แสดงบนปุ่ม
  statusCounts: { type: Object, default: () => ({}) },
  // รู้ตำแหน่งผู้ใช้แล้วหรือยัง (ยังไม่รู้ = กรองระยะทางไม่ได้)
  hasLocation: { type: Boolean, default: false },
  isLocating: { type: Boolean, default: false },
  locationError: { type: String, default: '' },
})

const emit = defineEmits(['update:distance', 'update:status', 'locate'])

const { t } = useLocale()

// ข้อความของตัวเลือกระยะทางอยู่ใน locales: incidentFilter.distance.*
const distanceOptions = ['any', 'within2', 'within5', 'within10', 'over10']
// สถานะใช้ข้อความเดียวกับป้ายบนรายการ (status.*) จะได้ตรงกัน
const statusOptions = ['any', 'verified', 'ongoing', 'pending']

const statusLabel = (option) => {
  if (option === 'any') {
    return t('incidentFilter.status.any')
  }
  return t(`status.${option}`)
}

const countOf = (option) => {
  const count = props.statusCounts[option]
  if (count === undefined) {
    return 0
  }
  return count
}

const changeDistance = (event) => {
  emit('update:distance', event.target.value)
}
</script>

<template>
  <section class="incident-filter" :aria-label="t('incidentFilter.label')">
    <!-- สถานะ: กดเลือกได้ทีละอัน เห็นจำนวนของแต่ละสถานะเลยโดยไม่ต้องเปิดเมนู -->
    <div class="incident-filter__status" role="group" :aria-label="t('incidentFilter.statusLabel')">
      <button
        v-for="option in statusOptions"
        :key="option"
        type="button"
        class="incident-filter__chip"
        :class="`incident-filter__chip--${option}`"
        :aria-pressed="props.status === option"
        @click="emit('update:status', option)"
      >
        <span class="incident-filter__dot" aria-hidden="true"></span>
        {{ statusLabel(option) }}
        <span class="incident-filter__count">{{ countOf(option) }}</span>
      </button>
    </div>

    <div class="incident-filter__distance">
      <label>
        <span>{{ t('incidentFilter.distanceLabel') }}</span>
        <select :value="props.distance" :disabled="!hasLocation" @change="changeDistance">
          <option v-for="option in distanceOptions" :key="option" :value="option">{{ t(`incidentFilter.distance.${option}`) }}</option>
        </select>
      </label>

      <!-- ยังไม่รู้ตำแหน่ง: ให้กดเพื่อใช้ตำแหน่งปัจจุบัน จะได้กรองตามระยะทางและเห็นระยะห่าง -->
      <button v-if="!hasLocation" type="button" class="incident-filter__locate" :disabled="isLocating" @click="emit('locate')">
        <img src="/icons/Location.svg" alt="" aria-hidden="true" />
        {{ isLocating ? t('incidentsPage.locating') : t('incidentsPage.useMyLocation') }}
      </button>
    </div>

    <p v-if="!hasLocation" class="incident-filter__hint" :class="{ 'incident-filter__hint--error': locationError }">
      {{ locationError || t('incidentsPage.locationHint') }}
    </p>
  </section>
</template>

<style scoped>
.incident-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
}

/* ---- ปุ่มสถานะ ---- */
.incident-filter__status {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.incident-filter__chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 10px 0 12px;
  border: 1px solid var(--gs-line-strong);
  border-radius: 999px;
  background: var(--gs-surface);
  color: var(--gs-ink-2);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease;
}

.incident-filter__chip:hover {
  border-color: var(--gs-ink-2);
}

.incident-filter__chip[aria-pressed='true'] {
  border-color: var(--gs-action);
  background: var(--gs-action);
  color: #ffffff;
}

/* จุดสีบอกสถานะ สีเดียวกับป้ายในรายการ */
.incident-filter__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gs-muted);
}

.incident-filter__chip--any .incident-filter__dot {
  display: none;
}

.incident-filter__chip--verified .incident-filter__dot {
  background: var(--gs-verified);
}

.incident-filter__chip--ongoing .incident-filter__dot {
  background: var(--gs-action);
}

.incident-filter__chip--pending .incident-filter__dot {
  background: var(--gs-danger);
}

.incident-filter__chip[aria-pressed='true'] .incident-filter__dot {
  box-shadow: 0 0 0 2px #ffffff;
}

.incident-filter__count {
  min-width: 22px;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--gs-surface-sunken);
  color: var(--gs-ink-2);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.incident-filter__chip[aria-pressed='true'] .incident-filter__count {
  background: rgb(255 255 255 / 18%);
  color: #ffffff;
}

/* ---- ระยะทาง ---- */
.incident-filter__distance {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.incident-filter__distance label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gs-muted);
  font-size: 14px;
  font-weight: 600;
}

.incident-filter__distance select {
  min-height: 36px;
  padding: 0 10px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface);
  color: var(--gs-ink);
  font: inherit;
  font-size: 14px;
}

.incident-filter__distance select:disabled {
  background: var(--gs-surface-sunken);
  color: var(--gs-muted);
  cursor: not-allowed;
}

.incident-filter__locate {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface);
  color: var(--gs-action);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.incident-filter__locate:hover {
  background: var(--gs-action-tint);
}

.incident-filter__locate:disabled {
  cursor: wait;
  opacity: 0.7;
}

.incident-filter__locate img {
  width: 16px;
  height: 16px;
}

.incident-filter__chip:focus-visible,
.incident-filter__distance select:focus-visible,
.incident-filter__locate:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

.incident-filter__hint {
  flex-basis: 100%;
  margin: -4px 0 0;
  color: var(--gs-muted);
  font-size: 12px;
  text-align: right;
}

.incident-filter__hint--error {
  color: var(--gs-danger);
}

@media (max-width: 640px) {
  .incident-filter__hint {
    text-align: left;
  }
}
</style>
