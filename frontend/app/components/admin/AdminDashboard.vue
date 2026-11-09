<script setup>
// ---------------------------------------------------------------------------
// แดชบอร์ดผู้ดูแลระบบ: แสดงเฉพาะข้อมูลจริง
// - ตัวเลขสรุป กราฟ และรายการล่าสุด มาจาก GET /incidents/admin/overview (ส่งมาจาก pages/admin/index.vue)
// - แผนที่ใช้ Mapbox และข้อมูลชุดเดียวกับหน้าแรกของผู้ใช้ (useHomeDashboard)
// ลำดับบนหน้า: งานที่ต้องทำก่อน (รายงานรอตรวจ) → แผนที่ + กราฟ → รายการล่าสุด
// ---------------------------------------------------------------------------
import StatusBadge from '~/components/common/StatusBadge.vue'
import MapboxMap from '~/components/map/MapboxMap.vue'
import MapGroupPanel from '~/components/map/MapGroupPanel.vue'
import { formatRelativeTime } from '~/composables/useHomeDashboard'
import { getIncidentIconUrl } from '~/composables/useIncidentIcon'
import { getHelpRequestIcon, getHelpRequestLabel } from '~/composables/useHelpRequestIcon'

// กราฟใช้ Unovis ซึ่งทำงานได้เฉพาะบนเบราว์เซอร์ จึงโหลดแบบ async และครอบด้วย <ClientOnly>
const IncidentTrendChart = defineAsyncComponent(() => import('~/components/admin/charts/IncidentTrendChart.vue'))
const IncidentTypeChart = defineAsyncComponent(() => import('~/components/admin/charts/IncidentTypeChart.vue'))

const props = defineProps({
  overview: { type: Object, default: null },
  isLoading: { type: Boolean, default: false },
  // key ของข้อความ error ในไฟล์ภาษา ('' = ไม่มี error)
  errorKey: { type: String, default: '' },
})

const emit = defineEmits(['retry'])

const { t, locale } = useLocale()

// ---- ตัวเลขสรุป ----

const summary = computed(() => props.overview?.summary ?? null)

const oldestPendingText = computed(() => {
  if (!summary.value?.oldest_pending_at) {
    return ''
  }
  const time = formatRelativeTime(summary.value.oldest_pending_at, t)
  return t('adminDashboard.queueOldest', { time })
})

// ---- กราฟรายงานรายวัน ----

const formatDayLabel = (isoDay, isLastDay) => {
  if (isLastDay) {
    return t('adminDashboard.today')
  }
  let dateLocale = 'th-TH'
  if (locale.value === 'en') {
    dateLocale = 'en-GB'
  }
  // วันที่จาก API เป็น YYYY-MM-DD ใส่เวลาเที่ยงวันกันวันเลื่อนตามเขตเวลา
  const date = new Date(`${isoDay}T12:00:00`)
  return new Intl.DateTimeFormat(dateLocale, { day: 'numeric', month: 'short' }).format(date)
}

const trendRows = computed(() => {
  const days = props.overview?.daily_reports ?? []
  return days.map((day, index) => {
    const isLastDay = index === days.length - 1
    return {
      label: formatDayLabel(day.day, isLastDay),
      verified: day.verified,
      pending: day.pending,
      rejected: day.rejected,
    }
  })
})

// สีของสถานะ: ยืนยัน = เขียว, รอตรวจ = อำพัน, ไม่ผ่าน = เทา (สีแดงสงวนไว้ให้อันตราย)
const trendConfig = computed(() => ({
  verified: { label: t('adminDashboard.keyVerified'), color: 'var(--gs-verified)' },
  pending: { label: t('adminDashboard.keyPending'), color: 'var(--gs-pending-mark)' },
  rejected: { label: t('adminDashboard.keyRejected'), color: 'var(--gs-line-strong)' },
}))

// ---- กราฟประเภทเหตุการณ์ ----

const typeColors = ['var(--gs-action)', 'var(--gs-help)', 'var(--gs-pending-mark)', 'var(--gs-verified)', '#7a6a99', 'var(--gs-line-strong)']

const typeRows = computed(() => {
  const types = props.overview?.reports_by_type ?? []

  let total = 0
  for (const type of types) {
    total = total + type.total
  }

  return types.map((type, index) => {
    let label = type.type_name
    if (!label) {
      label = t('adminDashboard.unknownType')
    }
    let percent = 0
    if (total > 0) {
      percent = Math.round((type.total / total) * 100)
    }
    return {
      label,
      count: type.total,
      percent,
      icon: getIncidentIconUrl({ typeCode: type.type_code }),
      color: typeColors[index % typeColors.length],
    }
  })
})

const typesTotal = computed(() => {
  let total = 0
  for (const type of typeRows.value) {
    total = total + type.count
  }
  return total
})

// ---- รายการล่าสุด ----

// สถานะรายงาน → tone ของ StatusBadge
const reportTone = (status) => {
  if (status === 'verified') {
    return 'verified'
  }
  if (status === 'rejected') {
    return 'rejected'
  }
  return 'pending'
}

const reportStatusLabel = (status) => {
  if (status === 'verified') {
    return t('status.verified')
  }
  if (status === 'rejected') {
    return t('status.rejected')
  }
  return t('status.pending')
}

const latestReports = computed(() => {
  const reports = props.overview?.latest_reports ?? []
  return reports.map((report) => {
    let typeName = report.type_name
    if (!typeName) {
      typeName = t('adminDashboard.unknownType')
    }
    return {
      id: report.report_id,
      description: report.description,
      typeName,
      icon: getIncidentIconUrl({ typeCode: report.type_code }),
      tone: reportTone(report.report_status),
      statusLabel: reportStatusLabel(report.report_status),
      isSuspicious: report.is_suspicious,
      time: formatRelativeTime(report.created_at, t),
    }
  })
})

const latestHelpRequests = computed(() => {
  const requests = props.overview?.latest_help_requests ?? []
  return requests.map((request) => {
    let title = getHelpRequestLabel(request.help_type, t)
    if (request.help_type === 'other' && request.custom_help_type) {
      title = request.custom_help_type
    }
    return {
      id: request.help_request_id,
      title,
      description: request.description,
      icon: getHelpRequestIcon(request.help_type),
      people: request.people_count,
      status: request.request_status,
      statusLabel: t(`adminDashboard.helpStatus.${request.request_status}`),
      time: formatRelativeTime(request.created_at, t),
    }
  })
})

// ---- แผนที่ (ข้อมูลจริงชุดเดียวกับหน้าแรกของผู้ใช้) ----

const {
  selectedIncident, selectedIncidentPreview, selectedIncidentDetail, publicMapItems, mapError, mapCenter,
  selectIncident, clearSelectedIncident, fetchPublicMapItems,
} = useHomeDashboard()

// เหตุในกลุ่มหมุดที่กดบนแผนที่ (ว่าง = ไม่แสดงกล่องรายการ)
const selectedGroupItems = ref([])
// จุดของหมุดที่กดล่าสุด ปิดการ์ดแล้วแผนที่จะยังอยู่ที่เดิม ไม่บินกลับไปหมุดแรก
const focusedCenter = ref(null)

const activeMapCenter = computed(() => {
  if (focusedCenter.value) {
    return focusedCenter.value
  }
  return mapCenter.value
})

watch(selectedIncident, (incident) => {
  if (incident) {
    focusedCenter.value = [incident.lng, incident.lat]
  }
})

const showGroupItems = (items) => {
  clearSelectedIncident()
  selectedGroupItems.value = items
}

const selectMapItem = (item) => {
  selectedGroupItems.value = []
  selectIncident(item)
}

const openReportDetail = ({ incidentId, reportId }) => {
  navigateTo(`/incidents/${incidentId}/reports/${reportId}`)
}

onMounted(() => {
  fetchPublicMapItems()
})

// การเลือกหมุดเก็บใน useState ที่ใช้ร่วมกับหน้าแรก ล้างทิ้งตอนออกจากหน้า ไม่ให้ค้างไปเปิดที่หน้าอื่น
onBeforeUnmount(clearSelectedIncident)
</script>

<template>
  <div class="dashboard">
    <!-- โหลดไม่สำเร็จ / ไม่มีสิทธิ์ -->
    <div v-if="errorKey" class="dashboard__error" role="alert">
      <span>{{ t(errorKey) }}</span>
      <button type="button" class="button" @click="emit('retry')">{{ t('adminDashboard.retry') }}</button>
    </div>

    <!-- งานที่ต้องทำก่อน: รายงานรอตรวจ + ตัวเลขสถานการณ์ตอนนี้ -->
    <section class="queue" :class="{ 'queue--clear': summary && summary.pending_reports === 0 }" aria-labelledby="queue-title" :aria-busy="isLoading">
      <div class="queue__main">
        <template v-if="summary">
          <h2 id="queue-title" v-if="summary.pending_reports > 0">{{ t('adminDashboard.queueTitle', { count: summary.pending_reports }) }}</h2>
          <h2 id="queue-title" v-else>{{ t('adminDashboard.queueEmpty') }}</h2>
          <p v-if="summary.pending_reports > 0">{{ oldestPendingText }}</p>
          <p v-else>{{ t('adminDashboard.queueEmptyHint') }}</p>
        </template>
        <template v-else>
          <h2 id="queue-title">{{ t('adminDashboard.loading') }}</h2>
          <p class="skeleton-line" aria-hidden="true"></p>
        </template>
      </div>
      <NuxtLink to="/admin/incidents" class="button button--primary">{{ t('adminDashboard.queueAction') }}</NuxtLink>

      <dl class="ledger" :aria-label="t('adminDashboard.summaryLabel')">
        <div>
          <dt>{{ t('adminDashboard.stats.activeIncidents') }}</dt>
          <dd>{{ summary ? summary.active_incidents : '–' }}</dd>
        </div>
        <div>
          <dt>{{ t('adminDashboard.stats.openHelp') }}</dt>
          <dd>{{ summary ? summary.open_help_requests : '–' }}</dd>
        </div>
        <div>
          <dt>{{ t('adminDashboard.stats.users') }}</dt>
          <dd>
            {{ summary ? summary.total_users : '–' }}
            <small v-if="summary">{{ t('adminDashboard.stats.newUsers', { count: summary.new_users_7d }) }}</small>
          </dd>
        </div>
      </dl>
    </section>

    <div class="dashboard__grid">
      <!-- แผนที่ -->
      <section class="panel panel--map" aria-labelledby="map-title">
        <header class="panel__head">
          <h2 id="map-title">{{ t('adminDashboard.mapTitle') }}</h2>
          <NuxtLink to="/admin/incidents" class="panel__link">{{ t('adminDashboard.viewAll') }}</NuxtLink>
        </header>
        <div class="map" :aria-label="t('adminDashboard.mapLabel')">
          <MapboxMap
            :center="activeMapCenter"
            :zoom="11"
            :map-items="publicMapItems"
            :selected-item-id="selectedIncident?.id"
            :selected-item="selectedIncidentPreview"
            :selected-incident-detail="selectedIncidentDetail"
            :popup-padding="{ top: 300, right: 24, bottom: 24, left: 24 }"
            class="map__canvas"
            @select-item="selectMapItem"
            @select-group="showGroupItems"
            @close-popup="clearSelectedIncident"
            @open-report="openReportDetail"
          />
          <MapGroupPanel
            v-if="selectedGroupItems.length"
            :items="selectedGroupItems"
            :selected-item-id="selectedIncident?.id"
            @select="selectIncident"
            @close="selectedGroupItems = []"
          />
          <p v-if="mapError" class="map__status" role="status">{{ mapError }}</p>
        </div>
      </section>

      <div class="dashboard__charts">
        <!-- กราฟรายงานรายวัน -->
        <section class="panel" aria-labelledby="trend-title">
          <header class="panel__head">
            <h2 id="trend-title">{{ t('adminDashboard.trendTitle', { days: overview?.trend_days ?? 7 }) }}</h2>
          </header>
          <div class="panel__body">
            <ClientOnly>
              <IncidentTrendChart v-if="trendRows.length" :data="trendRows" :config="trendConfig" :height="180" aria-hidden="true" />
              <template #fallback><div class="skeleton-block" style="height: 210px"></div></template>
            </ClientOnly>
            <div v-if="!trendRows.length" class="skeleton-block" style="height: 210px"></div>
            <!-- ตารางข้อมูลเดียวกับกราฟ ให้ screen reader อ่านได้ -->
            <table class="sr-only">
              <caption>{{ t('adminDashboard.trendLabel') }}</caption>
              <thead>
                <tr>
                  <th scope="col">{{ t('adminDashboard.day') }}</th>
                  <th scope="col">{{ t('adminDashboard.keyVerified') }}</th>
                  <th scope="col">{{ t('adminDashboard.keyPending') }}</th>
                  <th scope="col">{{ t('adminDashboard.keyRejected') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in trendRows" :key="row.label">
                  <th scope="row">{{ row.label }}</th>
                  <td>{{ row.verified }}</td>
                  <td>{{ row.pending }}</td>
                  <td>{{ row.rejected }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- สัดส่วนประเภทที่ถูกรายงาน -->
        <section class="panel" aria-labelledby="types-title">
          <header class="panel__head">
            <h2 id="types-title">{{ t('adminDashboard.typesTitle', { days: overview?.type_days ?? 30 }) }}</h2>
          </header>
          <div class="panel__body">
            <p v-if="overview && !typeRows.length" class="empty">{{ t('adminDashboard.typesEmpty') }}</p>
            <ClientOnly v-else-if="typeRows.length">
              <IncidentTypeChart :data="typeRows" :central-label="String(typesTotal)" :central-sub-label="t('adminDashboard.typesTotal')" />
              <template #fallback><div class="skeleton-block" style="height: 150px"></div></template>
            </ClientOnly>
            <div v-else class="skeleton-block" style="height: 150px"></div>
          </div>
        </section>
      </div>
    </div>

    <div class="dashboard__lists">
      <!-- รายงานล่าสุด -->
      <section class="panel" aria-labelledby="reports-title">
        <header class="panel__head">
          <h2 id="reports-title">{{ t('adminDashboard.latestReports') }}</h2>
          <NuxtLink to="/admin/incidents" class="panel__link">{{ t('adminDashboard.viewAll') }}</NuxtLink>
        </header>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th scope="col">{{ t('adminDashboard.th.report') }}</th>
                <th scope="col">{{ t('adminDashboard.th.status') }}</th>
                <th scope="col" class="table__time">{{ t('adminDashboard.th.time') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="report in latestReports" :key="report.id">
                <td>
                  <div class="item">
                    <img :src="report.icon" alt="" class="item__icon">
                    <span class="item__text">
                      <strong>{{ report.typeName }}</strong>
                      <span>{{ report.description }}</span>
                    </span>
                  </div>
                </td>
                <td>
                  <div class="badges">
                    <StatusBadge :tone="report.tone" :label="report.statusLabel" />
                    <span v-if="report.isSuspicious" class="flag">{{ t('adminDashboard.suspicious') }}</span>
                  </div>
                </td>
                <td class="table__time">{{ report.time }}</td>
              </tr>
              <tr v-if="overview && !latestReports.length">
                <td colspan="3" class="empty">{{ t('adminDashboard.reportsEmpty') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- คำขอความช่วยเหลือล่าสุด -->
      <section class="panel" aria-labelledby="help-title">
        <header class="panel__head">
          <h2 id="help-title">{{ t('adminDashboard.latestHelp') }}</h2>
        </header>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th scope="col">{{ t('adminDashboard.th.request') }}</th>
                <th scope="col">{{ t('adminDashboard.th.people') }}</th>
                <th scope="col">{{ t('adminDashboard.th.status') }}</th>
                <th scope="col" class="table__time">{{ t('adminDashboard.th.time') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in latestHelpRequests" :key="request.id">
                <td>
                  <div class="item">
                    <img :src="request.icon" alt="" class="item__icon">
                    <span class="item__text">
                      <strong>{{ request.title }}</strong>
                      <span>{{ request.description }}</span>
                    </span>
                  </div>
                </td>
                <td class="table__number">{{ request.people }}</td>
                <td><span class="help-status" :class="`help-status--${request.status}`">{{ request.statusLabel }}</span></td>
                <td class="table__time">{{ request.time }}</td>
              </tr>
              <tr v-if="overview && !latestHelpRequests.length">
                <td colspan="4" class="empty">{{ t('adminDashboard.helpEmpty') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  /* สีอำพันที่อ่านได้บนพื้นขาว ใช้กับแท่งกราฟ "รอตรวจ" */
  --gs-pending-mark: #c2841a;
  display: grid;
  gap: 16px;
  color: var(--gs-ink);
}

.dashboard__error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #efc2c0;
  border-radius: var(--gs-radius);
  background: var(--gs-danger-tint);
  color: var(--gs-danger-hover);
  font-size: 15px;
  font-weight: 700;
}

/* ---- งานที่ต้องทำก่อน ---- */
.queue {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px 24px;
  padding: 20px 24px;
  border: 1px solid #ecd9b0;
  border-radius: var(--gs-radius);
  background: var(--gs-pending-tint);
}

.queue--clear {
  border-color: var(--gs-line);
  background: var(--gs-surface);
}

.queue__main {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.queue h2 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 22px;
  font-weight: 800;
  line-height: 1.35;
}

.queue p {
  margin: 0;
  color: var(--gs-ink-2);
  font-size: 15px;
  line-height: 1.5;
}

/* ตัวเลขสถานการณ์: แถวเดียวคั่นด้วยเส้น ไม่ใช่การ์ดแยก */
.ledger {
  display: flex;
  flex-wrap: wrap;
  grid-column: 1 / -1;
  gap: 12px 0;
  margin: 0;
  padding-top: 16px;
  border-top: 1px solid rgb(138 81 0 / 18%);
}

.queue--clear .ledger {
  border-top-color: var(--gs-line);
}

.ledger > div {
  display: grid;
  gap: 2px;
  min-width: 160px;
  padding: 0 24px;
  border-left: 1px solid rgb(138 81 0 / 18%);
}

.queue--clear .ledger > div {
  border-left-color: var(--gs-line);
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
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 10px;
  margin: 0;
  color: var(--gs-ink);
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.ledger small {
  color: var(--gs-ink-2);
  font-size: 14px;
  font-weight: 600;
}

/* ---- ปุ่มและลิงก์ ---- */
.button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  padding: 0 18px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface);
  color: var(--gs-action);
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
}

.button:hover {
  background: var(--gs-action-tint);
}

.button--primary {
  border-color: var(--gs-action);
  background: var(--gs-action);
  color: #fff;
}

.button--primary:hover {
  background: var(--gs-action-hover);
}

.button:focus-visible,
.panel__link:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

/* ---- แผงข้อมูล ---- */
.dashboard__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 1fr);
  gap: 16px;
}

.dashboard__charts,
.dashboard__lists {
  display: grid;
  gap: 16px;
  min-width: 0;
}

.dashboard__lists {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
}

.panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
}

.panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 56px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--gs-line);
}

.panel__head h2 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 17px;
  font-weight: 800;
  line-height: 1.4;
}

.panel__link {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  padding: 0 4px;
  border-radius: var(--gs-radius-sm);
  color: var(--gs-action);
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.panel__link:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.panel__body {
  padding: 16px 20px;
}

/* ---- แผนที่ ---- */
.panel--map {
  min-height: 520px;
}

.map {
  position: relative;
  flex: 1;
  min-height: 460px;
  background: var(--gs-surface-sunken);
}

.map__canvas {
  position: absolute;
  inset: 0;
}

.map__status {
  position: absolute;
  top: 12px;
  left: 50%;
  z-index: 2;
  margin: 0;
  padding: 8px 12px;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface);
  color: var(--gs-danger);
  font-size: 14px;
  font-weight: 700;
  transform: translateX(-50%);
}

/* ---- ตาราง ---- */
.table-wrap {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table th {
  padding: 10px 20px;
  border-bottom: 1px solid var(--gs-line);
  color: var(--gs-ink-2);
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  white-space: nowrap;
}

.table td {
  padding: 12px 20px;
  border-bottom: 1px solid var(--gs-line);
  color: var(--gs-ink);
  vertical-align: middle;
}

.table tbody tr:last-child td {
  border-bottom: 0;
}

.table__time {
  color: var(--gs-ink-2);
  white-space: nowrap;
}

.table__number {
  font-variant-numeric: tabular-nums;
}

.item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.item__icon {
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  object-fit: contain;
}

.item__text {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.item__text strong {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
}

.item__text span {
  display: -webkit-box;
  overflow: hidden;
  color: var(--gs-ink-2);
  font-size: 14px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.flag {
  padding: 2px 8px;
  border: 1px solid #efc2c0;
  border-radius: var(--gs-radius-sm);
  color: var(--gs-danger-hover);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.help-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface-sunken);
  color: var(--gs-ink-2);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.help-status--pending {
  background: var(--gs-help-tint);
  color: var(--gs-help-hover);
}

.help-status--accepted,
.help-status--in_progress {
  background: var(--gs-action-tint);
  color: var(--gs-action);
}

.empty {
  margin: 0;
  padding: 20px;
  color: var(--gs-ink-2);
  font-size: 14px;
  text-align: center;
}

/* ---- ระหว่างโหลด ---- */
.skeleton-line,
.skeleton-block {
  border-radius: var(--gs-radius-sm);
  background: linear-gradient(90deg, var(--gs-surface-sunken), var(--gs-line), var(--gs-surface-sunken));
  background-size: 200% 100%;
  animation: skeleton 1.4s ease-in-out infinite;
}

.skeleton-line {
  width: 240px;
  height: 18px;
}

@keyframes skeleton {
  from { background-position: 100% 0; }
  to { background-position: -100% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-line,
  .skeleton-block {
    animation: none;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---- จอแคบ ---- */
@media (max-width: 1180px) {
  .dashboard__grid,
  .dashboard__lists {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 640px) {
  .queue {
    grid-template-columns: minmax(0, 1fr);
    padding: 16px;
  }

  .queue h2 {
    font-size: 19px;
  }

  .queue .button {
    width: 100%;
  }

  .ledger > div {
    min-width: 0;
    flex: 1 1 100%;
    padding: 8px 0 0;
    border-left: 0;
  }

  .panel__head,
  .panel__body {
    padding-right: 16px;
    padding-left: 16px;
  }

  .panel--map {
    min-height: 380px;
  }

  .map {
    min-height: 320px;
  }

  .table th,
  .table td {
    padding-right: 16px;
    padding-left: 16px;
  }
}
</style>
