<script setup>
// หน้ารายงานวิเคราะห์ของแอดมิน (หน้าตัวอย่าง: ข้อมูลจำลองจาก data/adminMockData.js)
import AdminMockNotice from '~/components/admin/mock/AdminMockNotice.vue'
import AdminPanel from '~/components/admin/mock/AdminPanel.vue'
import { mockAnalytics, mockDailyReports } from '~/data/adminMockData'

// กราฟใช้ Unovis ซึ่งทำงานได้เฉพาะบนเบราว์เซอร์ จึงโหลดแบบ async และครอบด้วย <ClientOnly>
const IncidentTrendChart = defineAsyncComponent(() => import('~/components/admin/charts/IncidentTrendChart.vue'))

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const { t, tm, locale } = useLocale()

// ป้ายวันที่ของ 14 วันล่าสุด (วันสุดท้าย = วันนี้)
const dayLabel = (daysAgo) => {
  if (daysAgo === 0) {
    return t('adminDashboard.today')
  }
  let dateLocale = 'th-TH'
  if (locale.value === 'en') {
    dateLocale = 'en-GB'
  }
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return new Intl.DateTimeFormat(dateLocale, { day: 'numeric', month: 'short' }).format(date)
}

const trendRows = computed(() => {
  return mockDailyReports.map(([verified, pending, rejected], index) => {
    const daysAgo = mockDailyReports.length - 1 - index
    return { label: dayLabel(daysAgo), verified, pending, rejected }
  })
})

const trendConfig = computed(() => ({
  verified: { label: t('adminDashboard.keyVerified'), color: 'var(--gs-verified)' },
  pending: { label: t('adminDashboard.keyPending'), color: '#c2841a' },
  rejected: { label: t('adminDashboard.keyRejected'), color: 'var(--gs-line-strong)' },
}))

const totalReports = computed(() => {
  let total = 0
  for (const row of trendRows.value) {
    total = total + row.verified + row.pending + row.rejected
  }
  return total
})

// พื้นที่ที่มีรายงานมากที่สุด พร้อมความยาวแถบเทียบกับพื้นที่อันดับ 1
const areas = computed(() => {
  const names = tm('adminMock.analytics.areas')
  const highest = mockAnalytics.areaReports[0]
  return mockAnalytics.areaReports.map((count, index) => {
    return { name: names[index], count, width: Math.round((count / highest) * 100) }
  })
})
</script>

<template>
  <div class="mock-page">
    <p class="mock-page__intro">{{ t('adminMock.analytics.intro') }}</p>
    <AdminMockNotice />

    <dl class="ledger">
      <div>
        <dt>{{ t('adminMock.analytics.reports') }}</dt>
        <dd>{{ totalReports }}</dd>
      </div>
      <div>
        <dt>{{ t('adminMock.analytics.verifiedRate') }}</dt>
        <dd>{{ mockAnalytics.verifiedRate }}%</dd>
      </div>
      <div>
        <dt>{{ t('adminMock.analytics.reviewTime') }}</dt>
        <dd>{{ t('adminMock.analytics.reviewTimeValue', { hours: mockAnalytics.reviewHours }) }}</dd>
      </div>
      <div>
        <dt>{{ t('adminMock.analytics.helpResolved') }}</dt>
        <dd>{{ mockAnalytics.helpResolved }}</dd>
      </div>
    </dl>

    <div class="analytics-grid">
      <AdminPanel :title="t('adminMock.analytics.trendTitle')">
        <ClientOnly>
          <IncidentTrendChart :data="trendRows" :config="trendConfig" :height="240" />
          <template #fallback><div class="skeleton" style="height: 280px"></div></template>
        </ClientOnly>
      </AdminPanel>

      <AdminPanel :title="t('adminMock.analytics.areasTitle')">
        <ol class="areas">
          <li v-for="area in areas" :key="area.name">
            <span class="areas__name">{{ area.name }}</span>
            <span class="areas__count">{{ area.count }}</span>
            <span class="areas__bar" aria-hidden="true"><span :style="{ width: `${area.width}%` }"></span></span>
          </li>
        </ol>
      </AdminPanel>
    </div>
  </div>
</template>

<style scoped>
.mock-page {
  display: grid;
  gap: 16px;
  color: var(--gs-ink);
}

.mock-page__intro {
  margin: 0;
  color: var(--gs-ink-2);
  font-size: 15px;
}

.ledger {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 0;
  margin: 0;
  padding: 16px 24px;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
}

.ledger > div {
  display: grid;
  gap: 2px;
  min-width: 160px;
  padding: 0 24px;
  border-left: 1px solid var(--gs-line);
}

.ledger > div:first-child {
  padding-left: 0;
  border-left: 0;
}

.ledger dt {
  color: var(--gs-ink-2);
  font-size: 14px;
  font-weight: 600;
}

.ledger dd {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.analytics-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(300px, 1fr);
  align-items: start;
  gap: 16px;
}

.areas {
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.areas li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px 12px;
  font-size: 14px;
}

.areas__name {
  font-weight: 700;
}

.areas__count {
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.areas__bar {
  display: block;
  grid-column: 1 / -1;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--gs-surface-sunken);
}

.areas__bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--gs-action);
}

.skeleton {
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface-sunken);
}

@media (max-width: 1100px) {
  .analytics-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 640px) {
  .ledger {
    padding: 16px;
  }

  .ledger > div {
    flex: 1 1 45%;
    min-width: 0;
    padding: 0;
    border-left: 0;
  }
}
</style>
