<template>
  <ReportIncidentRightPanel v-if="isReportIncident" />

  <aside v-else class="app-right-panel" :aria-label="t('rightPanel.label')">
    <section class="app-right-panel__section">
      <h2>{{ t('rightPanel.quickActions') }}</h2>

      <div class="app-right-panel__actions">
        <NuxtLink v-for="action in quickActions" :key="action.to" :to="action.to" :class="`action-card--${action.tone}`">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="action.icon" fill="currentColor" />
          </svg>
          <span class="action-card__text">
            <strong>{{ t(action.label) }}</strong>
            <span>{{ t(action.description) }}</span>
          </span>
        </NuxtLink>
      </div>
    </section>

    <section class="app-right-panel__section">
      <div class="app-right-panel__section-heading">
        <h2>{{ t('rightPanel.followed') }}</h2>
        <NuxtLink to="/followed-locations" class="app-right-panel__text-link">
          {{ followedLocations.length ? t('rightPanel.manage') : t('rightPanel.addArea') }}
        </NuxtLink>
      </div>
      <p v-if="!followedLocations.length" class="followed-locations__empty">
        {{ t('rightPanel.followedEmpty') }}
      </p>
      <ul v-else class="followed-locations">
        <li v-for="location in followedLocations" :key="location.name">
          <svg class="followed-locations__marker" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
            <circle cx="12" cy="10" r="2" />
          </svg>
          <span class="followed-locations__details">
            <strong>{{ location.name }}</strong>
            <small>{{ location.area }} · {{ location.distance }}</small>
          </span>
          <NuxtLink :to="location.to">{{ t('rightPanel.viewMap') }}</NuxtLink>
        </li>
      </ul>
    </section>

    <section v-if="showSafetyGuide" class="app-right-panel__section safety-guide">
      <div class="app-right-panel__section-heading">
        <h2>{{ t('rightPanel.guideTitle', { category: selectedIncident.category }) }}</h2>
        <button type="button" :aria-label="t('rightPanel.closeGuide')" @click="clearSelectedIncident">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m7 7 10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" />
          </svg>
        </button>
      </div>
      <p class="safety-guide__title">{{ selectedIncident.title }}</p>
      <ol>
        <li v-for="step in selectedIncident.safetySteps" :key="step">{{ step }}</li>
      </ol>
      <NuxtLink to="/safety-guide" class="safety-guide__link">{{ t('rightPanel.fullGuide') }}</NuxtLink>
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
const { t } = useLocale()

const quickActions = [
  { label: 'rightPanel.reportAction', description: 'rightPanel.reportActionHint', to: '/report-incident', tone: 'report', icon: 'M12 2a2 2 0 0 1 1.8 1.12l8 16A2 2 0 0 1 20 22H4a2 2 0 0 1-1.8-2.88l8-16A2 2 0 0 1 12 2Zm0 5.5a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-5a1 1 0 0 0-1-1Zm0 9a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z' },
  { label: 'rightPanel.helpAction', description: 'rightPanel.helpActionHint', to: '/request-help', tone: 'help', icon: 'M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A5.5 5.5 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.51L12 21.35Z' },
]

// TODO: ดึงจาก API พื้นที่ติดตามเมื่อ backend มี endpoint แล้ว
// รูปแบบ: { name, area, distance, to }
const followedLocations = []

const showSafetyGuide = computed(() => route.path === '/' && selectedIncident.value)
const isReportIncident = computed(() => route.path === '/report-incident')
</script>

<style scoped>
/* แผงขวา: ไม่ใช้การ์ดลอยซ้อนกัน แต่ละส่วนคั่นด้วยเส้นบางบนพื้นขาวพื้นเดียว */
.app-right-panel {
  display: grid;
  align-content: start;
  padding: 0.25rem 1.25rem 1.25rem;
  border-left: 1px solid var(--gs-line);
  background: var(--gs-surface);
}

.app-right-panel__section {
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--gs-line);
}

.app-right-panel h2 {
  margin: 0 0 0.75rem;
  color: var(--gs-ink);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.35;
}

.app-right-panel__actions {
  display: grid;
  gap: 0.5rem;
}

.app-right-panel__actions a {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 3.5rem;
  padding: 0.65rem 0.9rem;
  border-radius: var(--gs-radius-sm);
  color: #fff;
  text-decoration: none;
  transition: background-color 160ms ease;
}

.app-right-panel__actions a:focus-visible {
  outline: 3px solid var(--gs-ink);
  outline-offset: 2px;
}

.app-right-panel__actions svg {
  flex: 0 0 auto;
  width: 1.5rem;
  height: 1.5rem;
}

.action-card__text {
  display: grid;
  gap: 0.1rem;
}

.app-right-panel__actions strong {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.3;
}

.action-card__text span {
  color: rgb(255 255 255 / 88%);
  font-size: 0.8rem;
  line-height: 1.35;
}

.action-card--report {
  background: var(--gs-danger);
}

.action-card--report:hover {
  background: var(--gs-danger-hover);
}

.action-card--help {
  background: var(--gs-help);
}

.action-card--help:hover {
  background: var(--gs-help-hover);
}

.app-right-panel__section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.app-right-panel__text-link {
  color: var(--gs-action);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: var(--gs-line-strong);
  text-underline-offset: 0.2em;
}

.app-right-panel__text-link:hover {
  text-decoration-color: currentColor;
}

.followed-locations__empty {
  margin: 0;
  color: var(--gs-muted);
  font-size: 0.85rem;
  line-height: 1.55;
}

.followed-locations {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}

.followed-locations li {
  display: grid;
  grid-template-columns: 1.25rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0;
}

.followed-locations li + li {
  border-top: 1px solid var(--gs-line);
}

.followed-locations__marker {
  width: 1.15rem;
  height: 1.15rem;
  fill: none;
  stroke: var(--gs-muted);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.followed-locations__details {
  display: grid;
  min-width: 0;
  gap: 0.05rem;
}

.followed-locations__details strong {
  overflow: hidden;
  color: var(--gs-ink);
  font-size: 0.875rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.followed-locations__details small {
  overflow: hidden;
  color: var(--gs-muted);
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.followed-locations li > a {
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
  color: var(--gs-action);
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
}

.followed-locations li > a:hover {
  border-color: var(--gs-action);
}

.safety-guide__title {
  margin: 0 0 0.55rem;
  color: var(--gs-ink-2);
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.45;
}

.safety-guide button {
  display: grid;
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--gs-muted);
  cursor: pointer;
}

.safety-guide button svg {
  width: 1rem;
  height: 1rem;
}

.safety-guide button:hover {
  background: var(--gs-surface-sunken);
  color: var(--gs-ink);
}

.safety-guide ol {
  display: grid;
  gap: 0.4rem;
  margin: 0 0 0.8rem;
  padding-left: 1.2rem;
  color: var(--gs-ink-2);
  font-size: 0.85rem;
  line-height: 1.55;
}

.safety-guide__link {
  display: block;
  padding: 0.6rem;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-action);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
}

.safety-guide__link:hover {
  background: var(--gs-action-hover);
}
</style>
