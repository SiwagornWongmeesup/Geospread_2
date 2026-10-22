<template>
  <section class="nearby-incidents" aria-labelledby="nearby-incidents-heading">
    <div class="nearby-incidents__header">
      <div>
        <h2 id="nearby-incidents-heading">{{ title }}</h2>
        <p>เหตุการณ์ล่าสุดที่เกิดขึ้นใกล้ตำแหน่งปัจจุบันของคุณ</p>
      </div>
      <NuxtLink
        v-if="viewAllTo"
        :to="viewAllTo"
        class="nearby-incidents__view-all"
      >
        ดูทั้งหมด
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      </NuxtLink>
    </div>

    <p v-if="isLoading" class="nearby-incidents__state">
      กำลังโหลดเหตุการณ์บนแผนที่...
    </p>
    <p
      v-else-if="errorMessage"
      class="nearby-incidents__state nearby-incidents__state--error"
    >
      {{ errorMessage }}
    </p>
    <p v-else-if="!incidents.length" class="nearby-incidents__state">
      ยังไม่มีเหตุการณ์ที่แสดงบนแผนที่
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
        :aria-label="`เลือกเหตุการณ์ ${incident.title || 'ที่เลือก'}`"
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
          <div
            v-else
            class="incident-card__empty-media"
            aria-label="ไม่มีรูปภาพ"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="8.5" cy="9" r="1.5" />
              <path d="m4 18 5.2-5.2 3.1 3.1 2.4-2.4L20 18" />
            </svg>
          </div>
        </div>

        <div class="incident-card__body">
          <div class="incident-card__eyebrow">
            <span class="incident-card__category">
              <img :src="incident.iconUrl || '/Alert.svg'" alt="" />
              {{ incident.category || "เหตุการณ์" }}
            </span>
            <span class="incident-card__status">รอตรวจสอบ</span>
          </div>

          <h3 :title="incidentTitle(incident)">{{ incidentTitle(incident) }}</h3>
          <p class="incident-card__summary">{{ incidentSummary(incident) }}</p>

          <p class="incident-card__location">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
              <circle cx="12" cy="10" r="2" />
            </svg>
            พื้นที่ที่รายงาน
          </p>
          <div class="incident-card__meta">
            <span>{{ distanceLabel(incident) }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ incident.time || "เมื่อสักครู่" }}</span>
          </div>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup>
defineEmits(['select'])
defineProps({
  title: { type: String, default: "เหตุการณ์ใกล้คุณ" },
  viewAllTo: { type: String, default: "/incidents" },
  selectedIncidentId: { type: String, default: null },
  incidents: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  errorMessage: { type: String, default: null },
});

const MOCK_DISTANCE_LABEL = "750 ม. จากคุณ";

const incidentTitle = (incident) =>
  String(incident?.title || "").trim() || "เหตุการณ์ที่รายงาน";

const incidentSummary = (incident) => {
  const summary = String(incident?.description || "").trim();
  return summary && summary !== incidentTitle(incident)
    ? summary
    : "ยังไม่มีรายละเอียดเพิ่มเติม";
};

const distanceLabel = (incident) =>
  incident?.distanceFromUserLabel || MOCK_DISTANCE_LABEL;
</script>

<style scoped>
.nearby-incidents {
  padding: 1rem;
  border: 1px solid #dfe8f4;
  border-radius: 1rem;
  background: #fff;
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
  color: #102968;
  font-size: 1.05rem;
}
.nearby-incidents__header p {
  margin: 0.2rem 0 0;
  color: #536f98;
  font-size: 0.76rem;
}
.nearby-incidents__view-all {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.28rem;
  color: #2563eb;
  font-size: 0.82rem;
  font-weight: 800;
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
  color: #164ec2;
  text-decoration: underline;
  text-underline-offset: 0.2rem;
}
.nearby-incidents__view-all:focus-visible,
.incident-card:focus-visible {
  outline: 3px solid rgb(37 99 235 / 30%);
  outline-offset: 3px;
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
  border: 1px dashed #cdd9e8;
  border-radius: 0.75rem;
  background: #f8fbff;
  color: #526e95;
  font-size: 0.82rem;
  font-weight: 700;
}
.nearby-incidents__state--error {
  border-color: #fecaca;
  background: #fff7f7;
  color: #b91c1c;
}
.incident-card {
  display: grid;
  min-width: 0;
  height: 100%;
  padding: 10px;
  min-height: 8.4rem;
  grid-template-columns: clamp(7.5rem, 30%, 10rem) minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid #e0e8f3;
  border-radius: 0.875rem;
  background: #fff;
  color: inherit;
  text-align: left;
  cursor: pointer;
  font: inherit;
  transition: border-color 160ms ease, box-shadow 160ms ease,
    transform 160ms ease;
}
.incident-card:hover,
.incident-card--selected {
  border-color: #1976e9;
  box-shadow: 0 0.5rem 1.25rem rgb(19 104 204 / 14%);
  transform: translateY(-2px);
}
.incident-card__media {
  display: grid;
  min-height: 100%;
  place-items: center;
  overflow: hidden;
  border-radius: 10px;
  background: #eef4fb;
}
.incident-card__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.incident-card__empty-media {
  color: #8494b2;
}
.incident-card__empty-media svg {
  width: 2rem;
  height: 2rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
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
  min-width: 0;
  align-items: center;
  gap: 0.42rem;
}
.incident-card__category,
.incident-card__status {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.46rem;
  overflow: hidden;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 800;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.incident-card__category {
  color: #24528e;
  background: #eef6ff;
}
.incident-card__category img {
  width: 0.78rem;
  height: 0.78rem;
  object-fit: contain;
}
.incident-card__status {
  flex: 0 0 auto;
  color: #9b5b00;
  background: #fff0d4;
}
.incident-card h3 {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #152b56;
  font-size: 0.9rem;
  font-weight: 800;
  line-height: 1.28;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}
.incident-card__summary {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #536f98;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.35;
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
  color: #55739d;
  font-size: 0.72rem;
  font-weight: 700;
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
  color: #627d9f;
  font-size: 0.67rem;
  font-weight: 650;
  white-space: nowrap;
}
.incident-card__meta span {
  overflow: hidden;
  text-overflow: ellipsis;
}
@media (max-width: 46rem) {
  .nearby-incidents__list {
    grid-template-columns: 1fr;
  }
  .incident-card__body {
    padding: 0.72rem 0.78rem;
  }
  .incident-card h3 {
    font-size: 0.88rem;
  }
}
</style>
