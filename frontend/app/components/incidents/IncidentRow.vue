<script setup>
// แถวเหตุการณ์ 1 แถวในรายการหน้า /incidents (จอคอม)
// คอลัมน์ตรงกันทุกแถว (เหตุการณ์ · สถานะ · รายงาน · ระยะ) จะได้ไล่สายตาเทียบกันได้เร็ว
// กดทั้งแถว = เลือกเหตุการณ์นี้ แผนที่ด้านขวาจะเลื่อนไปที่หมุดและเปิดรายละเอียด
const props = defineProps({
  incident: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])

const { t } = useLocale()

// บรรทัดรอง: ชื่อพื้นที่ · เวลา
const metaText = computed(() => {
  return `${props.incident.areaLabel} · ${props.incident.time}`
})

// ยังไม่รู้ตำแหน่งผู้ใช้ = ไม่รู้ระยะ แสดงขีดแทน
const distanceText = computed(() => {
  if (props.incident.distanceFromUserLabel) {
    return props.incident.distanceFromUserLabel
  }
  return '–'
})
</script>

<template>
  <li>
    <button
      type="button"
      class="incident-row"
      :class="{ 'incident-row--selected': isSelected }"
      :aria-current="isSelected ? 'true' : undefined"
      @click="emit('select', incident)"
    >
      <img class="incident-row__icon" :src="incident.iconUrl" alt="" aria-hidden="true" />

      <span class="incident-row__main">
        <span class="incident-row__title">{{ incident.title || t('incidentCard.noTitle') }}</span>
        <span class="incident-row__meta">{{ metaText }}</span>
      </span>

      <span class="incident-row__status" :class="`incident-row__status--${incident.statusTone}`">
        {{ incident.statusLabel }}
      </span>

      <span class="incident-row__number">{{ t('units.reports', { count: incident.reportCount }) }}</span>
      <span class="incident-row__number incident-row__distance">{{ distanceText }}</span>
    </button>
  </li>
</template>

<style scoped>
/* คอลัมน์: ไอคอน · ชื่อและพื้นที่ · สถานะ · จำนวนรายงาน · ระยะ (ต้องตรงกับหัวตารางใน pages/incidents.vue) */
.incident-row {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) 128px 84px 112px;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 12px 16px;
  border: 0;
  border-radius: var(--gs-radius-sm);
  background: transparent;
  color: var(--gs-ink);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 140ms ease;
}

.incident-row:hover {
  background: var(--gs-surface-sunken);
}

.incident-row--selected,
.incident-row--selected:hover {
  background: var(--gs-action-tint);
}

.incident-row:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--gs-action);
}

.incident-row__icon {
  width: 36px;
  height: 36px;
}

.incident-row__main {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.incident-row__title {
  overflow: hidden;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.incident-row--selected .incident-row__title {
  color: var(--gs-action);
}

.incident-row__meta {
  overflow: hidden;
  color: var(--gs-muted);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ป้ายสถานะ: สีเดียวกับจุดในปุ่มกรอง */
.incident-row__status {
  justify-self: start;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.incident-row__status--verified {
  background: #e3f1e8;
  color: var(--gs-verified);
}

.incident-row__status--ongoing {
  background: var(--gs-action-tint);
  color: var(--gs-action);
}

.incident-row__status--pending {
  background: var(--gs-danger-tint);
  color: var(--gs-danger);
}

.incident-row--selected .incident-row__status--ongoing {
  background: var(--gs-surface);
}

.incident-row__number {
  color: var(--gs-ink-2);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.incident-row__distance {
  text-align: right;
}
</style>
