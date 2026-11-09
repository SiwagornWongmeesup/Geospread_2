<template>
  <!-- การรายงานของฉัน: จำนวนรายงานจริงจาก GET /users/me แยกตามสถานะ -->
  <section class="activity-card" :aria-labelledby="titleId">
    <div class="activity-card__head">
      <h2 :id="titleId">{{ t('profilePage.activityTitle') }}</h2>
      <NuxtLink to="/incidents" class="activity-card__link">{{ t('profilePage.viewAllIncidents') }}</NuxtLink>
    </div>

    <!-- ยังไม่เคยรายงาน: ชวนแจ้งเหตุแทนการแสดงเลข 0 ทุกช่อง -->
    <div v-if="reports.total === 0" class="activity-empty">
      <strong>{{ t('profilePage.activityEmpty') }}</strong>
      <p>{{ t('profilePage.activityEmptyHint') }}</p>
      <NuxtLink to="/report-incident" class="activity-empty__action">{{ t('profilePage.reportNow') }}</NuxtLink>
    </div>

    <dl v-else class="activity-stats">
      <div v-for="stat in stats" :key="stat.key" :class="`activity-stats__item--${stat.key}`">
        <dt>{{ t(`profilePage.activityStats.${stat.key}`) }}</dt>
        <dd>{{ stat.value }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup>
const props = defineProps({
  // { total, verified, pending, rejected } จาก useProfile
  reports: { type: Object, required: true },
})

const { t } = useLocale()
const titleId = useId()

// แปลงจำนวนรายงานเป็นรายการตามลำดับที่ต้องการแสดง
const stats = computed(() => {
  return [
    { key: 'reports', value: props.reports.total },
    { key: 'verified', value: props.reports.verified },
    { key: 'pending', value: props.reports.pending },
    { key: 'rejected', value: props.reports.rejected },
  ]
})
</script>

<style scoped>
.activity-card {
  /* ตัวเลขจัดตามความกว้างของการ์ดเอง ไม่ใช่ความกว้างจอ */
  container-type: inline-size;
  display: grid;
  align-content: start;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
}

.activity-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.activity-card h2 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 18px;
  font-weight: 800;
}

.activity-card__link {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  color: var(--gs-action);
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.activity-card__link:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* ตัวเลข 4 ค่าในแถวเดียว คั่นด้วยเส้น */
.activity-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  row-gap: 16px;
  margin: 0;
}

/* การ์ดกว้างพอ: 4 ค่าในแถวเดียว */
@container (min-width: 560px) {
  .activity-stats {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  /* ระบุชื่อการ์ดนำหน้าให้ชนะกฎแบบ 2 คอลัมน์ที่อยู่ท้ายไฟล์ */
  .activity-card .activity-stats > div:nth-child(3) {
    padding-left: 16px;
    border-left: 1px solid var(--gs-line);
  }
}

.activity-stats > div {
  display: grid;
  gap: 2px;
  padding: 0 16px;
  border-left: 1px solid var(--gs-line);
}

.activity-stats > div:first-child {
  padding-left: 0;
  border-left: 0;
}

.activity-stats dt {
  color: var(--gs-ink-2);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.activity-stats dd {
  margin: 0;
  color: var(--gs-ink);
  font-size: 26px;
  font-weight: 800;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.activity-stats .activity-stats__item--verified dd {
  color: var(--gs-verified);
}

.activity-stats .activity-stats__item--pending dd {
  color: var(--gs-pending);
}

.activity-empty {
  display: grid;
  justify-items: start;
  gap: 6px;
}

.activity-empty strong {
  color: var(--gs-ink);
  font-size: 16px;
}

.activity-empty p {
  margin: 0 0 6px;
  color: var(--gs-ink-2);
  font-size: 14px;
  line-height: 1.5;
}

.activity-empty__action {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  padding: 0 16px;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-danger);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
}

.activity-empty__action:hover {
  background: var(--gs-danger-hover);
}

.activity-card__link:focus-visible,
.activity-empty__action:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

/* แบบ 2 คอลัมน์: ช่องที่ 3 ขึ้นแถวใหม่ ไม่ต้องมีเส้นคั่นซ้าย */
.activity-stats > div:nth-child(3) {
  padding-left: 0;
  border-left: 0;
}
</style>
