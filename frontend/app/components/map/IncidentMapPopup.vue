<script setup>
defineProps({
  incident: {
    type: Object,
    default: null,
  },
});

defineEmits(["close"]);
</script>

<template>
  <article v-if="incident" class="incident-map-popup" aria-live="polite">
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

    <div class="incident-map-popup__heading">
      <span
        class="incident-map-popup__icon"
        :style="{ backgroundColor: incident.markerColor }"
        aria-hidden="true"
      >
        <img :src="incident.iconUrl || '/Alert.svg'" alt="" />
      </span>
      <div>
        <p class="incident-map-popup__status">
          {{ incident.statusLabel || "เหตุการณ์" }}
        </p>
        <h2>{{ incident.title || "รายงานเหตุการณ์" }}</h2>
      </div>
    </div>

    <p v-if="incident.description" class="incident-map-popup__description">
      {{ incident.description }}
    </p>

    <dl class="incident-map-popup__meta">
      <div v-if="incident.location">
        <dt>ตำแหน่ง</dt>
        <dd>{{ incident.location }}</dd>
      </div>
      <div v-if="incident.time">
        <dt>เวลา</dt>
        <dd>{{ incident.time }}</dd>
      </div>
      <div v-if="incident.distance">
        <dt>ข้อมูล</dt>
        <dd>{{ incident.distance }}</dd>
      </div>
    </dl>
  </article>
</template>

<style scoped>
.incident-map-popup {
  position: relative;
  width: min(22rem, 100%);
  padding: 1rem;
  border-radius: 0.875rem;
  background: #fff;
  color: #173a75;
  box-shadow: 0 12px 28px rgb(15 50 96 / 20%);
}
.incident-map-popup__close {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: #58719a;
  cursor: pointer;
}
.incident-map-popup__close:hover {
  background: #edf5ff;
  color: #0876eb;
}
.incident-map-popup__close:focus-visible {
  outline: 3px solid rgb(8 118 235 / 28%);
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
.incident-map-popup__heading {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding-right: 2rem;
}
.incident-map-popup__icon {
  display: grid;
  width: 2.4rem;
  height: 2.4rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.7rem;
}
.incident-map-popup__icon img {
  width: 1.3rem;
  height: 1.3rem;
  filter: brightness(0) invert(1);
}
.incident-map-popup__status {
  margin: 0 0 0.12rem;
  color: #3973b8;
  font-size: 0.7rem;
  font-weight: 800;
}
.incident-map-popup h2 {
  margin: 0;
  color: #173a75;
  font-size: 0.94rem;
  line-height: 1.35;
}
.incident-map-popup__description {
  margin: 0.75rem 0 0;
  color: #536d97;
  font-size: 0.78rem;
  line-height: 1.5;
}
.incident-map-popup__meta {
  display: grid;
  gap: 0.3rem;
  margin: 0.75rem 0 0;
  padding-top: 0.7rem;
  border-top: 1px solid #e5edf7;
}
.incident-map-popup__meta div {
  display: flex;
  gap: 0.5rem;
  font-size: 0.7rem;
  line-height: 1.35;
}
.incident-map-popup__meta dt {
  min-width: 3.3rem;
  color: #7288a9;
}
.incident-map-popup__meta dd {
  margin: 0;
  color: #315581;
  font-weight: 700;
}
</style>
