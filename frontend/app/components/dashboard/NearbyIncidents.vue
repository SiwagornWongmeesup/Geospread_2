<template>
  <section class="nearby-incidents" aria-labelledby="nearby-incidents-heading">
    <div class="nearby-incidents__header">
      <div>
        <h2 id="nearby-incidents-heading">{{ title }}</h2>
        <p>ติดตามเหตุการณ์ที่แสดงบนแผนที่ของคุณ</p>
      </div>
      <NuxtLink
        v-if="viewAllTo"
        :to="viewAllTo"
        class="nearby-incidents__view-all"
        >ดูทั้งหมด</NuxtLink
      >
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
      <article
        v-for="incident in incidents"
        :key="incident.id"
        class="incident-card"
        :class="{
          'incident-card--selected': selectedIncidentId === incident.id,
        }"
      >
        <button
          type="button"
          class="incident-card__open"
          :aria-pressed="selectedIncidentId === incident.id"
          @click="$emit('select', incident)"
        >
          <div
            class="incident-card__media"
            :class="`incident-card__media--${incident.tone}`"
          >
            <img
              v-if="incident.imageUrl"
              class="incident-card__photo"
              :src="incident.imageUrl"
              :alt="incident.title"
            />
            <img
              v-else
              class="incident-card__fallback-icon"
              :src="incident.iconUrl || '/Alert.svg'"
              alt=""
              aria-hidden="true"
            />
            <span class="incident-card__status">{{
              incident.statusLabel || "กำลังดำเนินการ"
            }}</span>
          </div>

          <div class="incident-card__body">
            <p class="incident-card__type">{{ incident.category }}</p>
            <h3>{{ incident.title }}</h3>
            <p class="incident-card__description">
              {{
                incident.description ||
                "ยังไม่มีรายละเอียดเพิ่มเติมจากรายงานนี้"
              }}
            </p>

            <dl class="incident-card__meta">
              <div>
                <dt>รายงานโดย</dt>
                <dd>{{ incident.reporterLabel || "ชุมชน" }}</dd>
              </div>
              <div>
                <dt>รัศมีผลกระทบ</dt>
                <dd>{{ incident.radiusLabel || "ไม่ระบุ" }}</dd>
              </div>
              <div>
                <dt>ข้อมูลล่าสุด</dt>
                <dd>{{ incident.time }}</dd>
              </div>
            </dl>
          </div>
        </button>

        <div class="incident-card__footer">
          <span>{{ incident.reportCount || 1 }} รายงาน</span>
          <button
            type="button"
            class="incident-card__report"
            :class="{ 'incident-card__report--sent': isReported(incident.id) }"
            :disabled="isReported(incident.id)"
            @click="reportIncident(incident)"
          >
            {{
              isReported(incident.id) ? "ส่งให้ตรวจสอบแล้ว" : "รายงานเหตุการณ์"
            }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  title: { type: String, default: "เหตุการณ์ใกล้คุณ" },
  viewAllTo: { type: String, default: "/incidents" },
  selectedIncidentId: { type: String, default: null },
  incidents: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  errorMessage: { type: String, default: null },
});

const emit = defineEmits(["select", "report"]);
const reportedIncidentIds = ref(new Set());
const isReported = (incidentId) => reportedIncidentIds.value.has(incidentId);

const reportIncident = (incident) => {
  reportedIncidentIds.value = new Set([
    ...reportedIncidentIds.value,
    incident.id,
  ]);
  emit("report", incident);
};
</script>

<style scoped>
.nearby-incidents {
  padding: 1rem;
  border: 1px solid #dfe8f4;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 4px 16px rgb(31 72 125 / 6%);
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
  color: #6c7c93;
  font-size: 0.76rem;
}
.nearby-incidents__view-all {
  color: #2563eb;
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
}
.nearby-incidents__view-all:hover {
  text-decoration: underline;
}
.nearby-incidents__list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}
.nearby-incidents__state {
  margin: 0;
  padding: 0.9rem;
  border: 1px dashed #cdd9e8;
  border-radius: 0.75rem;
  background: #f8fbff;
  color: #5d6f89;
  font-size: 0.82rem;
  font-weight: 700;
}
.nearby-incidents__state--error {
  border-color: #fecaca;
  background: #fff7f7;
  color: #b91c1c;
}
.incident-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e0e8f3;
  border-radius: 0.875rem;
  background: #fff;
  color: inherit;
  transition: border-color 160ms ease, box-shadow 160ms ease,
    transform 160ms ease;
}
.incident-card:hover,
.incident-card--selected {
  border-color: #1976e9;
  box-shadow: 0 8px 20px rgb(19 104 204 / 14%);
  transform: translateY(-2px);
}
.incident-card__open {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.incident-card__open:focus-visible,
.incident-card__report:focus-visible {
  outline: 3px solid rgb(8 118 235 / 28%);
  outline-offset: -3px;
}
.incident-card__media {
  position: relative;
  display: grid;
  height: 8.25rem;
  place-items: center;
  overflow: hidden;
  background: #4285c5;
}
.incident-card__media--red {
  background: #dc5a5f;
}
.incident-card__media--orange {
  background: #d98c3e;
}
.incident-card__media--green {
  background: #3b9a72;
}
.incident-card__media--gray {
  background: #718096;
}
.incident-card__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.incident-card__fallback-icon {
  width: 3.2rem;
  height: 3.2rem;
  filter: brightness(0) invert(1);
  opacity: 0.95;
}
.incident-card__status {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  padding: 0.23rem 0.55rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 92%);
  color: #173a75;
  font-size: 0.67rem;
  font-weight: 800;
}
.incident-card__body {
  padding: 0.8rem;
}
.incident-card__type {
  margin: 0 0 0.28rem;
  color: #3973b8;
  font-size: 0.7rem;
  font-weight: 800;
}
.incident-card h3 {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #152b56;
  font-size: 0.9rem;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.incident-card__description {
  display: -webkit-box;
  min-height: 2.9em;
  margin: 0.4rem 0 0.7rem;
  overflow: hidden;
  color: #637895;
  font-size: 0.73rem;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.incident-card__meta {
  display: grid;
  gap: 0.36rem;
  margin: 0;
  padding-top: 0.65rem;
  border-top: 1px solid #edf2f8;
}
.incident-card__meta div {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.68rem;
}
.incident-card__meta dt {
  color: #7488a7;
}
.incident-card__meta dd {
  margin: 0;
  overflow: hidden;
  color: #385780;
  font-weight: 700;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.incident-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: auto;
  padding: 0.65rem 0.8rem;
  border-top: 1px solid #edf2f8;
  color: #71839f;
  font-size: 0.68rem;
}
.incident-card__report {
  min-height: 1.9rem;
  padding: 0.25rem 0.55rem;
  border: 1px solid #d6e5f8;
  border-radius: 0.45rem;
  background: #f5f9ff;
  color: #1d67c5;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}
.incident-card__report:hover {
  border-color: #a9cef7;
  background: #e9f3ff;
}
.incident-card__report:disabled {
  cursor: default;
  border-color: #cde8d8;
  background: #ecfaf1;
  color: #237849;
}
@media (max-width: 84rem) {
  .nearby-incidents__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 46rem) {
  .nearby-incidents__list {
    grid-template-columns: 1fr;
  }
  .incident-card__media {
    height: 10rem;
  }
}
</style>
