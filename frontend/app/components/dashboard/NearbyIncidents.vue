<template>
  <section class="nearby-incidents" aria-labelledby="nearby-incidents-heading">
    <div class="nearby-incidents__header">
      <div>
        <h2 id="nearby-incidents-heading">{{ title || t('nearby.title') }}</h2>
        <p>{{ nearbySort === 'recent' ? t('nearby.subtitleRecent') : t('nearby.subtitleNearest') }}</p>
      </div>
      <NuxtLink
        v-if="viewAllTo"
        :to="viewAllTo"
        class="nearby-incidents__view-all"
      >
        {{ t('common.viewAll') }}
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      </NuxtLink>
    </div>

    <div class="nearby-incidents__sort" role="group" :aria-label="t('nearby.sortLabel')">
      <button
        v-for="option in sortOptions"
        :key="option.value"
        type="button"
        class="nearby-incidents__sort-option"
        :aria-pressed="nearbySort === option.value"
        @click="nearbySort = option.value"
      >
        {{ t(option.label) }}
      </button>
    </div>

    <p v-if="isLoading" class="nearby-incidents__state">
      {{ t('nearby.loading') }}
    </p>
    <p
      v-else-if="errorMessage"
      class="nearby-incidents__state nearby-incidents__state--error"
    >
      {{ errorMessage }}
    </p>

    <!-- ยังไม่รู้ตำแหน่งผู้ใช้: ไม่แสดงการ์ด เพราะคำนวณระยะทางจริงไม่ได้ -->
    <div
      v-else-if="nearbySort === 'nearest' && !hasUserLocation"
      class="nearby-incidents__state nearby-incidents__state--location"
    >
      <p>{{ locationError || t('nearby.enableLocation') }}</p>
      <button
        type="button"
        class="nearby-incidents__location-button"
        :disabled="isLocating"
        @click="$emit('request-location')"
      >
        <span v-if="isLocating">{{ t('location.locating') }}</span>
        <span v-else>{{ t('location.useCurrent') }}</span>
      </button>
    </div>

    <p v-else-if="!incidents.length" class="nearby-incidents__state">
      {{ t('nearby.empty') }}
    </p>

    <div v-else class="nearby-incidents__list">
      <button
        v-for="incident in incidents.slice(0, 2)"
        :key="incident.id"
        type="button"
        class="incident-card"
        :class="{
          'incident-card--selected': selectedIncidentId === incident.id,
        }"
        :style="{ '--incident-color': incident.markerColor || 'var(--gs-line-strong)' }"
        :aria-label="t('nearby.selectIncident', { name: incident.category || incidentTitle(incident) })"
        @click="$emit('select', incident)"
      >
        <div
          class="incident-card__media"
          :class="{ 'incident-card__media--empty': !incident.imageUrl }"
        >
          <img
            v-if="incident.imageUrl"
            class="incident-card__photo"
            :src="incident.imageUrl"
            :alt="incident.title"
          />
          <!-- ถ้าเหตุการณ์นี้ไม่มีรูปเลย ให้แสดงไอคอนประเภทเหตุการณ์แทน -->
          <img
            v-else
            class="incident-card__type-icon"
            :src="incident.iconUrl || '/icons/Alert.svg'"
            alt=""
            aria-hidden="true"
          />

          <!-- ป้ายบอกจำนวนรูปทั้งหมดในเหตุการณ์ แสดงเมื่อมีมากกว่า 1 รูป -->
          <span
            v-if="incident.imageCount > 1"
            class="incident-card__photo-count"
            :aria-label="t('nearby.photoCount', { count: incident.imageCount })"
          >
            <img src="/icons/Photo.svg" alt="" aria-hidden="true" />
            {{ incident.imageCount }}
          </span>
        </div>

        <div class="incident-card__body">
          <!-- ใช้ประเภทเหตุการณ์เป็นหัวข้อเดียว (ชื่อเหตุการณ์มักซ้ำกับประเภท) -->
          <div class="incident-card__eyebrow">
            <h3 class="incident-card__category">
              <img :src="incident.iconUrl || '/icons/Alert.svg'" alt="" />
              <span>{{ incident.category || incidentTitle(incident) }}</span>
            </h3>
            <StatusBadge :tone="incident.statusTone" :label="incident.statusLabel" />
          </div>
          <p class="incident-card__summary">{{ incidentSummary(incident) }}</p>

          <p class="incident-card__location">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
              <circle cx="12" cy="10" r="2" />
            </svg>
            {{ getPlaceLabel(incident) }}
          </p>
          <div class="incident-card__meta">
            <span>{{ distanceLabel(incident) }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ incident.time || t('time.justNow') }}</span>
          </div>

          <!-- จำนวนรายงานที่ถูกรวมอยู่ในเหตุการณ์นี้ -->
          <p class="incident-card__report-count">
            {{ incident.reportCount ? t('units.reports', { count: incident.reportCount }) : t('nearby.unknownReportCount') }}
          </p>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup>
import StatusBadge from "~/components/common/StatusBadge.vue";
import { usePlaceNames } from "~/composables/usePlaceNames";

defineEmits(['select', 'request-location'])
const props = defineProps({
  hasUserLocation: { type: Boolean, default: false },
  isLocating: { type: Boolean, default: false },
  locationError: { type: String, default: "" },
  title: { type: String, default: "" },
  viewAllTo: { type: String, default: "/incidents" },
  selectedIncidentId: { type: String, default: null },
  incidents: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  errorMessage: { type: String, default: null },
});

const incidentTitle = (incident) =>
  String(incident?.title || "").trim() || t("incident.reportedTitle");

const incidentSummary = (incident) => {
  const summary = String(incident?.description || "").trim();
  return summary && summary !== incidentTitle(incident)
    ? summary
    : t("incident.noDetails");
};

const { loadPlaceNames, getPlaceLabel } = usePlaceNames();
const { nearbySort } = useHomeDashboard();
const { t } = useLocale();

const sortOptions = [
  { value: "nearest", label: "nearby.sortNearest" },
  { value: "recent", label: "nearby.sortRecent" },
];

// ทุกครั้งที่รายการการ์ดเปลี่ยน ให้หาชื่อสถานที่ของการ์ดที่แสดงอยู่ (2 ใบแรก)
// ถ้ายังไม่รู้ตำแหน่งผู้ใช้ การ์ดถูกซ่อนอยู่ จึงยังไม่ต้องถาม Mapbox (ประหยัดโควตา)
watch(
  () => [props.incidents, props.hasUserLocation, nearbySort.value],
  () => {
    if (nearbySort.value === "nearest" && !props.hasUserLocation) {
      return;
    }
    loadPlaceNames(props.incidents.slice(0, 2));
  },
  { immediate: true },
);

const distanceLabel = (incident) =>
  incident?.distanceFromUserLabel || t("units.unknownDistance");
</script>

<style scoped>
.nearby-incidents {
  padding: 1.1rem 1.25rem 1.25rem;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
}
.nearby-incidents__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.nearby-incidents h2 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 1.05rem;
  font-weight: 700;
}
.nearby-incidents__header p {
  margin: 0.2rem 0 0;
  color: var(--gs-muted);
  font-size: 0.85rem;
}
.nearby-incidents__view-all {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.28rem;
  color: var(--gs-action);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
}
.nearby-incidents__view-all svg {
  width: 0.92rem;
  height: 0.92rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}
.nearby-incidents__view-all:hover {
  color: var(--gs-action-hover);
  text-decoration: underline;
  text-underline-offset: 0.2rem;
}
.nearby-incidents__view-all:focus-visible,
.incident-card:focus-visible {
  outline: 3px solid rgb(29 53 87 / 30%);
  outline-offset: 3px;
}
.nearby-incidents__sort {
  display: inline-flex;
  gap: 2px;
  margin-bottom: 0.9rem;
  padding: 3px;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface-sunken);
  box-shadow: inset 0 0 0 1px var(--gs-line);
}
.nearby-incidents__sort-option {
  min-height: 2rem;
  padding: 0.25rem 0.9rem;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--gs-muted);
  cursor: pointer;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
}
.nearby-incidents__sort-option:hover {
  color: var(--gs-ink);
}
.nearby-incidents__sort-option[aria-pressed="true"] {
  background: var(--gs-surface);
  color: var(--gs-ink);
  box-shadow: 0 1px 2px rgb(23 32 46 / 12%), inset 0 0 0 1px var(--gs-line);
}
.nearby-incidents__sort-option:focus-visible {
  outline: 3px solid rgb(29 53 87 / 30%);
  outline-offset: 1px;
}
.nearby-incidents__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: 1fr;
  gap: 0.8rem;
}
.nearby-incidents__state {
  margin: 0;
  padding: 0.9rem;
  border: 1px dashed var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface-sunken);
  color: var(--gs-ink-2);
  font-size: 0.875rem;
  font-weight: 500;
}
.nearby-incidents__state--location {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.nearby-incidents__state--location p {
  margin: 0;
}
.nearby-incidents__location-button {
  min-height: 2.5rem;
  padding: 0.45rem 1rem;
  border: 0;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-action);
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
}
.nearby-incidents__location-button:hover {
  background: var(--gs-action-hover);
}
.nearby-incidents__location-button:disabled {
  background: #7d8796;
  cursor: wait;
}
.nearby-incidents__state--error {
  border-color: #efc2c0;
  border-style: solid;
  background: var(--gs-danger-tint);
  color: var(--gs-danger-hover);
}
.incident-card {
  display: grid;
  min-width: 0;
  height: 100%;
  padding: 10px;
  min-height: 8.4rem;
  grid-template-columns: clamp(7.5rem, 30%, 10rem) minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
  color: inherit;
  text-align: left;
  cursor: pointer;
  font: inherit;
  transition: border-color 160ms ease, background-color 160ms ease;
}
.incident-card:hover {
  border-color: var(--gs-line-strong);
  background: var(--gs-surface-sunken);
}
.incident-card--selected {
  border-color: var(--gs-action);
  box-shadow: inset 0 0 0 1px var(--gs-action);
}
.incident-card__media {
  position: relative;
  display: grid;
  min-height: 100%;
  place-items: center;
  overflow: hidden;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface-sunken);
}
.incident-card__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.incident-card__type-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}
.incident-card__photo-count {
  position: absolute;
  right: 6px;
  bottom: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 7px;
  border-radius: 999px;
  background: rgb(15 23 42 / 70%);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
}
.incident-card__photo-count img {
  width: 14px;
  height: 10px;
  /* ไฟล์ Photo.svg เป็นสีดำ เปลี่ยนเป็นสีขาวให้เห็นบนพื้นเข้ม */
  filter: brightness(0) invert(1);
}
.incident-card__body {
  display: grid;
  min-width: 0;
  align-content: start;
  gap: 6px;
  padding: 0.7rem 0.78rem;
}
.incident-card__eyebrow {
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
  align-items: center;
  row-gap: 0.35rem;
  gap: 0.42rem;
}
.incident-card__category {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  /* ไม่ใช้ overflow: hidden ที่ตัวป้าย เพราะจะตัดไอคอนชิดขอบ ให้ span ข้างในตัดข้อความแทน */
  padding: 5px 12px 5px 10px;
  flex: 0 1 auto;
  max-width: 100%;
  box-sizing: border-box;
  border-radius: var(--gs-radius-sm);
  background: color-mix(in srgb, var(--incident-color) 18%, var(--gs-surface));
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 22px;
}
.incident-card__category {
  color: var(--gs-ink);
}
.incident-card__category span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.incident-card__category img {
  flex: 0 0 auto;
  width: 1.1rem;
  height: 1.1rem;
  object-fit: contain;
}
.incident-card__eyebrow .status-badge {
  margin-left: auto;
}
.incident-card__summary {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--gs-ink-2);
  font-size: 0.85rem;
  font-weight: 400;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.incident-card__location {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.28rem;
  margin: 0.08rem 0 0;
  overflow: hidden;
  color: var(--gs-muted);
  font-size: 0.8rem;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.incident-card__location svg {
  width: 0.86rem;
  height: 0.86rem;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}
.incident-card__meta {
  display: flex;
  min-width: 0;
  gap: 0.3rem;
  margin-top: 0.05rem;
  overflow: hidden;
  color: var(--gs-muted);
  font-size: 0.8rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.incident-card__meta span {
  overflow: hidden;
  text-overflow: ellipsis;
}
.incident-card__report-count {
  justify-self: start;
  margin: 0;
  color: var(--gs-ink-2);
  font-size: 0.8rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
@media (max-width: 46rem) {
  .nearby-incidents__list {
    grid-template-columns: 1fr;
  }
  .incident-card__body {
    padding: 0.72rem 0.78rem;
  }
}
</style>
