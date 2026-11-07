<template>
  <!-- กิจกรรมของฉัน: ตัวเลขสรุปการรายงาน + รายงานล่าสุด (ข้อมูลจำลอง) -->
  <section class="activity-card" :aria-labelledby="titleId">
    <h2 :id="titleId">{{ t('profilePage.activityTitle') }}</h2>

    <!-- ตัวเลขสรุป -->
    <dl class="activity-stats">
      <div v-for="stat in stats" :key="stat.key" class="activity-stats__item" :class="`activity-stats__item--${stat.key}`">
        <dt>{{ t(`profilePage.activityStats.${stat.key}`) }}</dt>
        <dd>{{ stat.value }}</dd>
      </div>
    </dl>

    <!-- รายงานล่าสุด -->
    <div class="activity-recent">
      <div class="activity-recent__head">
        <h3>{{ t('profilePage.recentReportsTitle') }}</h3>
        <NuxtLink to="/incidents">{{ t('profilePage.viewAllIncidents') }}</NuxtLink>
      </div>
      <ul>
        <li v-for="report in recentReports" :key="report.id" class="activity-report">
          <span class="activity-report__icon" aria-hidden="true"><img :src="report.icon" alt="" /></span>
          <span class="activity-report__text">
            <strong>{{ report.title }}</strong>
            <span>{{ report.area }} · {{ report.time }}</span>
          </span>
          <StatusBadge :tone="report.status" :label="t(`profilePage.reportStatus.${report.status}`)" />
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import StatusBadge from '~/components/common/StatusBadge.vue'
import { mockActivity } from '~/composables/useProfile'

const { t, tm } = useLocale()
const titleId = useId()

// แปลงตัวเลขสรุปเป็นรายการ เรียงตามลำดับที่ต้องการแสดง
const statKeys = ['reports', 'verified', 'pending', 'helped']
const stats = statKeys.map((key) => {
  return { key, value: mockActivity.stats[key] }
})

// รวมข้อมูลรายงาน (สถานะ ไอคอน) กับข้อความตามภาษาที่เลือก
const recentReports = computed(() => {
  const texts = tm('profilePage.mockReports')
  return mockActivity.recentReports.map((report) => {
    const text = texts[report.index]
    return { ...report, title: text.title, area: text.area, time: text.time }
  })
})
</script>

<style scoped>
.activity-card {
  display: grid;
  align-content: start;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
}

.activity-card h2 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 17px;
  font-weight: 800;
}

/* ตัวเลขสรุป 4 ช่อง */
.activity-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
}

.activity-stats__item {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface-sunken);
}

.activity-stats dt {
  color: var(--gs-muted);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
}

.activity-stats dd {
  margin: 0;
  color: var(--gs-ink);
  font-size: 24px;
  font-weight: 800;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.activity-stats__item--verified dd {
  color: var(--gs-verified);
}

.activity-stats__item--pending dd {
  color: var(--gs-pending);
}

.activity-stats__item--helped dd {
  color: var(--gs-help);
}

/* รายงานล่าสุด */
.activity-recent {
  display: grid;
  gap: 8px;
}

.activity-recent__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.activity-recent__head h3 {
  margin: 0;
  color: var(--gs-ink-2);
  font-size: 15px;
  font-weight: 750;
}

.activity-recent__head a {
  color: var(--gs-action);
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.activity-recent__head a:hover {
  text-decoration: underline;
}

.activity-recent ul {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}

.activity-report {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid var(--gs-line);
}

.activity-report__icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 50%;
  background: var(--gs-surface-sunken);
}

.activity-report__icon img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.activity-report__text {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.activity-report__text strong {
  overflow: hidden;
  color: var(--gs-ink);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-report__text span {
  overflow: hidden;
  color: var(--gs-muted);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 560px) {
  .activity-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
