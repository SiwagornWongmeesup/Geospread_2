<template>
  <ReportIncidentRightPanel v-if="isReportIncident" />

  <aside v-else class="app-right-panel" aria-label="ข้อมูลเสริม">
    <section class="app-right-panel__section">
      <h2>ดำเนินการด่วน</h2>

      <div class="app-right-panel__actions">
        <NuxtLink v-for="action in quickActions" :key="action.to" :to="action.to" :class="`action-card--${action.tone}`">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="action.icon" fill="currentColor" />
          </svg>
          <strong>{{ action.label }}</strong>
          <span>{{ action.description }}</span>
        </NuxtLink>
      </div>
    </section>

    <section class="app-right-panel__section">
      <div class="app-right-panel__section-heading">
        <h2>ตำแหน่งที่ติดตาม</h2>
        <NuxtLink to="/followed-locations" class="app-right-panel__text-link">จัดการ</NuxtLink>
      </div>
      <ul class="followed-locations">
        <li v-for="location in followedLocations" :key="location.name">
          <span class="followed-locations__marker" aria-hidden="true">{{ location.initial }}</span>
          <span class="followed-locations__details">
            <strong>{{ location.name }}</strong>
            <small>{{ location.area }} · {{ location.distance }}</small>
          </span>
          <NuxtLink :to="location.to">ดูแผนที่</NuxtLink>
        </li>
      </ul>
    </section>

    <section v-if="showSafetyGuide" class="app-right-panel__section safety-guide">
      <div class="app-right-panel__section-heading">
        <div>
          <p class="safety-guide__eyebrow">คำแนะนำสำหรับ {{ selectedIncident.category }}</p>
          <h2>คู่มือความปลอดภัย</h2>
        </div>
        <button type="button" aria-label="ปิดคู่มือความปลอดภัย" @click="clearSelectedIncident">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m7 7 10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" />
          </svg>
        </button>
      </div>
      <p class="safety-guide__title">{{ selectedIncident.title }}</p>
      <ol>
        <li v-for="step in selectedIncident.safetySteps" :key="step">{{ step }}</li>
      </ol>
      <NuxtLink to="/safety-guide" class="safety-guide__link">ดูคู่มือฉบับเต็ม</NuxtLink>
    </section>

    <TodaySummary />
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import TodaySummary from '~/components/dashboard/TodaySummary.vue'
import ReportIncidentRightPanel from '~/components/report/ReportIncidentRightPanel.vue'

const route = useRoute()
const { selectedIncident, clearSelectedIncident } = useHomeDashboard()

const quickActions = [
  { label: 'รายงานเหตุการณ์', description: 'แจ้งสิ่งที่คุณพบ', to: '/report-incident', tone: 'report', icon: 'M12 2a2 2 0 0 1 1.8 1.12l8 16A2 2 0 0 1 20 22H4a2 2 0 0 1-1.8-2.88l8-16A2 2 0 0 1 12 2Zm0 5.5a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-5a1 1 0 0 0-1-1Zm0 9a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z' },
  { label: 'ขอความช่วยเหลือ', description: 'ขอแรงสนับสนุนจากชุมชน', to: '/request-help', tone: 'help', icon: 'M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A5.5 5.5 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.51L12 21.35Z' },
]

const followedLocations = [
  { initial: 'ว', name: 'วัดเจดีย์หลวง', area: 'เมืองเชียงใหม่', distance: '1.2 กม.', to: '/map' },
  { initial: 'ส', name: 'สนามบินเชียงใหม่', area: 'สุเทพ', distance: '3.4 กม.', to: '/map' },
  { initial: 'น', name: 'นิมมานเหมินท์', area: 'สุเทพ', distance: '5.1 กม.', to: '/map' },
]

const showSafetyGuide = computed(() => route.path === '/' && selectedIncident.value)
const isReportIncident = computed(() => route.path === '/report-incident')
</script>

<style scoped>
.app-right-panel {
  display: grid;
  align-content: start;
  gap: 0.875rem;
  padding: 1rem;
  background: #f8fbff;
}

.app-right-panel__section {
  padding: 1rem;
  border: 1px solid #dfe8f4;
  border-radius: 0.875rem;
  background: #fff;
  box-shadow: 0 3px 12px rgb(31 72 125 / 5%);
}

.app-right-panel h2 {
  margin: 0 0 0.5rem;
  color: #123765;
  font-size: 0.95rem;
}

.app-right-panel__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.app-right-panel__actions a {
  display: grid;
  justify-items: center;
  gap: 0.25rem;
  min-height: 8.3rem;
  padding: 0.8rem 0.45rem;
  border-radius: 0.65rem;
  color: #fff;
  text-align: center;
  text-decoration: none;
  transition: transform 160ms ease, filter 160ms ease;
}

.app-right-panel__actions a:hover,
.app-right-panel__actions a:focus-visible {
  outline: none;
  filter: brightness(0.95);
  transform: translateY(-2px);
}

.app-right-panel__actions svg {
  width: 1.9rem;
  height: 1.9rem;
}

.app-right-panel__actions strong {
  font-size: 0.8rem;
  line-height: 1.3;
}

.app-right-panel__actions span {
  font-size: 0.67rem;
  line-height: 1.35;
}

.action-card--report {
  background: #ee343d;
}

.action-card--help {
  background: #1377e9;
}

.app-right-panel__section-heading {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 0.5rem;
}

.app-right-panel__section-heading h2 {
  margin-bottom: 0.6rem;
}

.app-right-panel__text-link {
  color: #1479ef;
  font-size: 0.74rem;
  font-weight: 700;
  text-decoration: none;
}

.app-right-panel__text-link:hover {
  text-decoration: underline;
}

.followed-locations {
  display: grid;
  gap: 0.55rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.followed-locations li {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.45rem;
}

.followed-locations__marker {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border-radius: 50%;
  background: #e6f1ff;
  color: #1479ef;
  font-size: 0.76rem;
  font-weight: 800;
}

.followed-locations__details {
  display: grid;
  min-width: 0;
  gap: 0.1rem;
}

.followed-locations__details strong {
  overflow: hidden;
  color: #294265;
  font-size: 0.72rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.followed-locations__details small {
  overflow: hidden;
  color: #7b8ba2;
  font-size: 0.63rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.followed-locations li > a {
  padding: 0.35rem 0.45rem;
  border-radius: 0.35rem;
  background: #eaf3ff;
  color: #1479ef;
  font-size: 0.61rem;
  font-weight: 700;
  text-decoration: none;
}

.followed-locations li > a:hover {
  background: #d9ebff;
}

.safety-guide {
  border-color: #bcd9fc;
  background: #f7fbff;
}

.safety-guide__eyebrow {
  margin: 0 0 0.2rem;
  color: #5c7da6;
  font-size: 0.66rem;
}

.safety-guide__title {
  margin: 0 0 0.55rem;
  color: #304b70;
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.4;
}

.safety-guide button {
  display: grid;
  width: 1.4rem;
  height: 1.4rem;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: #e3eefb;
  color: #37618f;
  cursor: pointer;
}

.safety-guide button svg {
  width: 0.85rem;
  height: 0.85rem;
}

.safety-guide button:hover {
  background: #d1e4fb;
}

.safety-guide ol {
  display: grid;
  gap: 0.35rem;
  margin: 0 0 0.7rem;
  padding-left: 1.1rem;
  color: #405878;
  font-size: 0.72rem;
  line-height: 1.45;
}

.safety-guide__link {
  display: block;
  padding: 0.5rem;
  border-radius: 0.45rem;
  background: #1479ef;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
}

.safety-guide__link:hover {
  background: #096bdc;
}
</style>
