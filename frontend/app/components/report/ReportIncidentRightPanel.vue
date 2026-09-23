<template>
  <aside class="report-incident-side-panel" aria-label="ตำแหน่งและคู่มือการแจ้งเหตุ">
    <LocationPicker />

    <section class="quick-guide" aria-labelledby="quick-guide-heading">
      <div class="quick-guide__heading">
        <svg class="quick-guide__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 20v-5.5L3.7 18A1 1 0 0 1 2 17.3v-1.1a1 1 0 0 1 .3-.7L7 10.8V7.5L4.7 8.8A1 1 0 0 1 3.2 8L2.7 7a1 1 0 0 1 .4-1.4L7 3.4V2a1 1 0 1 1 2 0v18a1 1 0 1 1-2 0Zm6-1.6v-3.7l3.3 3.3a1 1 0 0 0 1.7-.7v-1.1a1 1 0 0 0-.3-.7L13 10.8V7.5l2.3 1.3a1 1 0 0 0 1.5-.8l.5-1a1 1 0 0 0-.4-1.4L13 3.4V2a1 1 0 1 0-2 0v18a1 1 0 1 0 2 0v-1.6Z" fill="currentColor" />
        </svg>
        <div>
          <h2 id="quick-guide-heading" class="quick-guide__title">คู่มือฉบับย่อ</h2>
          <p class="quick-guide__subtitle">{{ activeGuide.guideTitle }}</p>
        </div>
      </div>
      <ol class="quick-guide__list">
        <li 
          v-for="step in activeGuide.guideSteps" 
          :key="step"
          class="quick-guide__item"
        >
          {{ step }}
        </li>
      </ol>
      <NuxtLink to="/safety-guide" class="quick-guide__link">
        ดูคู่มือฉบับเต็ม
      </NuxtLink>
    </section>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import LocationPicker from '~/components/report/LocationPicker.vue'
import { defaultIncidentGuide } from '~/data/reportIncidentGuides'

const { userSelectedType } = useReportIncident()
const activeGuide = computed(() => userSelectedType.value ?? defaultIncidentGuide)
</script>

<style scoped>
/* ============================== Side Panel Container ============================== */

.report-incident-side-panel {
  display: grid;
  align-content: start;
  gap: 0.875rem;
  padding: 1rem;
  background: #f8fbff;
}

/* ============================== Quick Guide Card ============================== */

.quick-guide {
  padding: 1rem;
  border-radius: 0.875rem;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(31, 72, 125, 0.08);
}

.quick-guide__heading {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
}

.quick-guide__icon {
  width: 2rem;
  height: 2rem;
  color: #1479ef;
  flex-shrink: 0;
}

.quick-guide__title {
  margin: 0;
  color: #102968;
  font-size: 0.95rem;
  font-weight: 700;
}

.quick-guide__subtitle {
  margin: 0.15rem 0 0;
  color: #56718f;
  font-size: 0.72rem;
  font-weight: 700;
}

/* ============================== Guide Steps List ============================== */

.quick-guide__list {
  display: grid;
  gap: 0.4rem;
  margin: 0.8rem 0;
  padding-left: 1.15rem;
  color: #405878;
  font-size: 0.74rem;
  line-height: 1.45;
}

.quick-guide__item::marker {
  color: #1479ef;
  font-weight: 800;
}

/* ============================== Full Guide Link ============================== */

.quick-guide__link {
  display: block;
  padding: 0.55rem;
  border-radius: 0.5rem;
  background: #1479ef;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.quick-guide__link:hover,
.quick-guide__link:focus-visible {
  background: #096bdc;
  outline: none;
}
</style>
