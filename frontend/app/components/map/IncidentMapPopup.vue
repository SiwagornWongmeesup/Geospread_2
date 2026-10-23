<script setup>
defineProps({
  incident: {
    type: Object,
    required: true,
  },
});

defineEmits(["close"]);

const MOCK_DISTANCE_LABEL = "750 ม. จากคุณ";

const incidentTitle = (incident) =>
  String(incident?.title || "").trim() || "เหตุการณ์ที่รายงาน";
const incidentSummary = (incident) => {
  const summary = String(incident?.description || "").trim();
  return summary && summary !== incidentTitle(incident)
    ? summary
    : "ยังไม่มีรายละเอียดเพิ่มเติม";
};
</script>

<template>
  <article class="incident-map-popup" aria-live="polite">
    <header class="incident-map-popup__header">
      <p class="incident-map-popup__category">
        <img :src="incident.iconUrl || '/icons/Alert.svg'" alt="" />
        <span>{{ incident.category || "เหตุการณ์" }}</span>
      </p>
      <span class="incident-map-popup__status">รอตรวจสอบ</span>
      <button
        class="incident-map-popup__close"
        type="button"
        aria-label="ปิดรายละเอียดเหตุการณ์"
        @click="$emit('close')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m7 7 10 10M17 7 7 17" />
        </svg>
      </button>
    </header>

    <h2 :title="incidentTitle(incident)">{{ incidentTitle(incident) }}</h2>
    <p class="incident-map-popup__summary">{{ incidentSummary(incident) }}</p>

    <p class="incident-map-popup__location">
      <img src="/icons/Location.svg" alt="" aria-hidden="true" />
      พื้นที่ที่รายงาน
    </p>
    <p class="incident-map-popup__meta">
      <img src="/icons/Time.svg" alt="" aria-hidden="true" />

      {{ incident.time || "เมื่อสักครู่" }}
            <span aria-hidden="true">·</span>

            {{ incident.distanceFromUserLabel || MOCK_DISTANCE_LABEL }}

    </p>

    <button class="incident-map-popup__details-button" type="button">
      ดูรายละเอียด
    </button>
  </article>
</template>

<style scoped>
.incident-map-popup {
  width: min(20.5rem, calc(100vw - 2rem));
  color: #102968;
  font-family: inherit;
}
.incident-map-popup__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 2rem;
  align-items: center;
  gap: 0.45rem;
}
.incident-map-popup__category {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.38rem;
  margin: 0;
  color: #1e4f91;
  font-size: 0.83rem;
  font-weight: 850;
  line-height: 1.15;
}
.incident-map-popup__category img {
  width: 1.7rem;
  height: 1.7rem;
  flex: 0 0 auto;
  object-fit: contain;
}
.incident-map-popup__category span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.incident-map-popup__status {
  padding: 0.3rem 0.55rem;
  border-radius: 999px;
  background: #fff0d5;
  color: #9b5b00;
  font-size: 0.69rem;
  font-weight: 850;
  line-height: 1;
  white-space: nowrap;
}
.incident-map-popup__close {
  display: grid;
  width: 2rem;
  height: 2rem;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 0.55rem;
  background: #f1f6fc;
  color: #58719a;
  cursor: pointer;
}
.incident-map-popup__close:hover {
  background: #e2efff;
  color: #1d4ed8;
}
.incident-map-popup__close:focus-visible,
.incident-map-popup__details-button:focus-visible {
  outline: 3px solid rgb(37 99 235 / 35%);
  outline-offset: 2px;
}
.incident-map-popup__close svg {
  width: 1rem;
  height: 1rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 2;
}
.incident-map-popup h2 {
  display: -webkit-box;
  margin: 0.78rem 0 0;
  overflow: hidden;
  color: #102968;
  font-size: 1.08rem;
  font-weight: 900;
  letter-spacing: -0.025em;
  line-height: 1.26;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.incident-map-popup__summary {
  display: -webkit-box;
  overflow: hidden;
  padding-top: 10px;
  color: #526f98;
  font-size: 0.79rem;
  font-weight: 650;
  line-height: 1.42;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.incident-map-popup__location,
.incident-map-popup__meta {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.35rem;
  padding-top: 10px;
  overflow: hidden;
  color: #597398;
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.incident-map-popup__location > img,
.incident-map-popup__meta > img {
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
  object-fit: contain;
}
.incident-map-popup__meta span {
  color: #91a2ba;
}
.incident-map-popup__details-button {
  width: 100%;
  margin-top: 0.88rem;
  padding: 0.66rem 0.8rem;
  border: 0;
  border-radius: 0.68rem;
  background: #1674e8;
  color: #fff;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 850;
  line-height: 1.2;
  cursor: pointer;
  box-shadow: 0 0.4rem 0.9rem rgb(22 116 232 / 22%);
}
.incident-map-popup__details-button:hover {
  background: #0e63cf;
}
.incident-map-popup__details-button:active {
  transform: translateY(1px);
}
@media (max-width: 22rem) {
  .incident-map-popup {
    width: calc(100vw - 2.25rem);
  }
  .incident-map-popup__category {
    font-size: 0.76rem;
  }
  .incident-map-popup h2 {
    font-size: 1rem;
  }
}
</style>
