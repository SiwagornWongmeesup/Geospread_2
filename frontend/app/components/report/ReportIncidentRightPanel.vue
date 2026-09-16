<template>
  <aside class="report-incident-side-panel" aria-label="ตำแหน่งและคู่มือการแจ้งเหตุ">
    <LocationPicker />

    <section class="quick-guide" aria-labelledby="quick-guide-heading">
      <div class="quick-guide__heading">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 20v-5.5L3.7 18A1 1 0 0 1 2 17.3v-1.1a1 1 0 0 1 .3-.7L7 10.8V7.5L4.7 8.8A1 1 0 0 1 3.2 8L2.7 7a1 1 0 0 1 .4-1.4L7 3.4V2a1 1 0 1 1 2 0v18a1 1 0 1 1-2 0Zm6-1.6v-3.7l3.3 3.3a1 1 0 0 0 1.7-.7v-1.1a1 1 0 0 0-.3-.7L13 10.8V7.5l2.3 1.3a1 1 0 0 0 1.5-.8l.5-1a1 1 0 0 0-.4-1.4L13 3.4V2a1 1 0 1 0-2 0v18a1 1 0 1 0 2 0v-1.6Z" fill="currentColor" />
        </svg>
        <div>
          <h2 id="quick-guide-heading">คู่มือฉบับย่อ</h2>
          <p>{{ selectedType.guideTitle }}</p>
        </div>
      </div>
      <ol>
        <li v-for="step in selectedType.guideSteps" :key="step">{{ step }}</li>
      </ol>
      <NuxtLink to="/safety-guide">ดูคู่มือฉบับเต็ม</NuxtLink>
    </section>
  </aside>
</template>

<script setup>
import LocationPicker from '~/components/report/LocationPicker.vue'

const { selectedType } = useReportIncident()
</script>

<style scoped>
.report-incident-side-panel {
  display: grid;
  align-content: start;
  gap: 0.875rem;
  padding: 1rem;
  background: #f8fbff;
}

.quick-guide {
  padding: 1rem;
  border-radius: 0.875rem;
  background: #fff;
  box-shadow: 0 4px 16px rgb(31 72 125 / 8%);
}

.quick-guide__heading {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
}

.quick-guide__heading svg {
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  color: #1479ef;
}

.quick-guide h2 {
  margin: 0;
  color: #102968;
  font-size: 0.95rem;
}

.quick-guide p {
  margin: 0.15rem 0 0;
  color: #56718f;
  font-size: 0.72rem;
  font-weight: 700;
}

.quick-guide ol {
  display: grid;
  gap: 0.4rem;
  margin: 0.8rem 0;
  padding-left: 1.15rem;
  color: #405878;
  font-size: 0.74rem;
  line-height: 1.45;
}

.quick-guide li::marker {
  color: #1479ef;
  font-weight: 800;
}

.quick-guide a {
  display: block;
  padding: 0.55rem;
  border-radius: 0.5rem;
  background: #1479ef;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
}

.quick-guide a:hover,
.quick-guide a:focus-visible {
  background: #096bdc;
  outline: none;
}
</style>
