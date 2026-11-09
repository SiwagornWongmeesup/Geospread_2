<script setup>
// การ์ดเหตุการณ์ 1 ใบในหน้า /incidents
// incident = รายการจาก useHomeDashboard (allIncidentCards) ทั้งเหตุการณ์ที่รวมแล้วและรายงานรอตรวจ
const props = defineProps({
  incident: { type: Object, required: true },
})

const emit = defineEmits(['show-on-map'])

const { t } = useLocale()

// บรรทัดที่ตั้ง: บอกระยะห่างถ้ารู้ตำแหน่งผู้ใช้ ไม่รู้ก็บอกชื่อพื้นที่
const placeText = computed(() => {
  if (props.incident.distanceFromUserLabel) {
    return props.incident.distanceFromUserLabel
  }
  return props.incident.areaLabel
})
</script>

<template>
  <article class="incident-card">
    <div class="incident-card__top">
      <img class="incident-card__icon" :src="incident.iconUrl" alt="" aria-hidden="true" />
      <div class="incident-card__meta">
        <span class="incident-card__status" :class="`incident-card__status--${incident.statusTone}`">{{ incident.statusLabel }}</span>
        <!-- รายงานที่ยังไม่มีประเภท category กับสถานะเป็นคำเดียวกัน ไม่ต้องแสดงซ้ำ -->
        <span v-if="incident.category !== incident.statusLabel">{{ incident.category }}</span>
      </div>
    </div>

    <h3>{{ incident.title || t('incidentCard.noTitle') }}</h3>

    <p class="incident-card__place">{{ placeText }} · {{ incident.time }}</p>
    <p class="incident-card__count">{{ t('units.reports', { count: incident.reportCount }) }}</p>

    <button type="button" class="incident-card__map" @click="emit('show-on-map', incident)">
      {{ t('incidentsPage.showOnMap') }}
    </button>
  </article>
</template>

<style scoped>
.incident-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
}

.incident-card__top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.incident-card__icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.incident-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  color: var(--gs-ink-2);
  font-size: 12px;
  font-weight: 700;
}

.incident-card__meta span {
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--gs-surface-sunken);
}

.incident-card__meta .incident-card__status--verified {
  background: #e3f1e8;
  color: #1d6b3a;
}

.incident-card__meta .incident-card__status--ongoing {
  background: var(--gs-action-tint);
  color: var(--gs-action);
}

.incident-card__meta .incident-card__status--pending {
  background: var(--gs-danger-tint);
  color: var(--gs-danger);
}

.incident-card h3 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 16px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.incident-card__place,
.incident-card__count {
  margin: 0;
  color: var(--gs-ink-2);
  font-size: 14px;
}

.incident-card__map {
  align-self: flex-start;
  margin-top: auto;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid var(--gs-line-strong);
  border-radius: 8px;
  background: var(--gs-surface);
  color: var(--gs-action);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.incident-card__map:hover {
  background: var(--gs-action-tint);
}

.incident-card__map:focus-visible {
  outline: 3px solid rgb(10 83 183 / 20%);
}
</style>
