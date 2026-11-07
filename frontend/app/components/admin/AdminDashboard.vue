<script setup>
import Card from '~/components/ui/card/Card.vue'
import CardContent from '~/components/ui/card/CardContent.vue'
import CardHeader from '~/components/ui/card/CardHeader.vue'
import CardTitle from '~/components/ui/card/CardTitle.vue'
import MapboxMap from '~/components/map/MapboxMap.vue'
import MapGroupPanel from '~/components/map/MapGroupPanel.vue'
// กราฟใช้ Unovis ซึ่งทำงานได้เฉพาะบนเบราว์เซอร์ (import ฝั่ง server ไม่ได้) จึงโหลดแบบ async และครอบด้วย <ClientOnly>
const IncidentTrendChart = defineAsyncComponent(() => import('~/components/admin/charts/IncidentTrendChart.vue'))
const IncidentTypeChart = defineAsyncComponent(() => import('~/components/admin/charts/IncidentTypeChart.vue'))

const notice = useState('adminNotice', () => '')
const { t, tm } = useLocale()

// ข้อมูลตัวอย่างสำหรับการออกแบบ: ตัวเลข สี และไอคอนอยู่ที่นี่
// ข้อความของแต่ละแถวอยู่ใน locales (adminDashboard.rows.*) เรียงตาม index เดียวกัน
const rows = computed(() => tm('adminDashboard.rows'))

const cardData = [
  ['128', '12%', 'red', '/icons/Warning-Error.svg', 'up'], ['56', '8%', 'blue', '/icons/Help.svg', 'up'],
  ['42', '20%', 'green', '/icons/Selected.svg', 'up'], ['18', '15%', 'yellow', '/icons/Alert.svg', 'down'],
  ['12,482', '5%', 'purple', '/icons/Users.svg', 'up'], ['8.3/10', '0.4', 'green', '/icons/Selected.svg', 'up'],
]
// [ชื่อ, ค่า, เปลี่ยนแปลง, สี, ไอคอน, ทิศทาง]
const cards = computed(() => cardData.map((card, index) => [rows.value.cards[index], ...card]))

// severity: high | medium, status: pending | verified
const incidentData = [
  ['/icons/Fire.svg', 'high', 'pending', 'red'],
  ['/icons/Flood.svg', 'medium', 'verified', 'blue'],
  ['/icons/Roadblock.svg', 'medium', 'pending', 'orange'],
  ['/icons/Landslide-mudslide.svg', 'high', 'verified', 'yellow'],
  ['/icons/Health.svg', 'high', 'pending', 'red'],
]
// [ชื่อ, พื้นที่, ประเภท, ไอคอน, ระดับ, สถานะ, เวลา, สี, รหัสระดับ, รหัสสถานะ]
const incidents = computed(() => incidentData.map(([icon, severity, status, color], index) => {
  const [title, area, category, time] = rows.value.incidents[index]
  return [title, area, category, icon, t(`adminDashboard.severity.${severity}`), t(`adminDashboard.status.${status}`), time, color, severity, status]
}))

const helpRequestData = [[4, '/icons/Building.svg'], [2, '/icons/Health.svg'], [3, '/icons/Water-source.svg'], [1, '/icons/Health.svg'], [2, '/icons/Car.svg']]
// [คำขอ, พื้นที่, จำนวน, สถานะ, เวลา, ไอคอน]
const helpRequests = computed(() => helpRequestData.map(([count, icon], index) => {
  const [title, area, status, time] = rows.value.helpRequests[index]
  return [title, area, count, status, time, icon]
}))

const typeData = [[38, 30, '/icons/Flood.svg'], [28, 22, '/icons/Fire.svg'], [18, 14, '/icons/Roadblock.svg'], [16, 13, '/icons/Landslide-mudslide.svg'], [14, 11, '/icons/Health.svg'], [14, 11, '/icons/Alert.svg']]
const typeColors = ['var(--gs-action)', 'var(--gs-danger)', '#d4920f', '#8a5a2b', 'var(--gs-help)', 'var(--gs-line-strong)']
const types = computed(() => typeData.map(([count, percent, icon], index) => ({
  label: rows.value.types[index], count, percent, icon, color: typeColors[index],
})))
const typesTotal = computed(() => types.value.reduce((sum, type) => sum + type.count, 0))

const serviceIcons = ['/icons/Map.svg', '/icons/Data.svg', '/icons/Notification.svg', '/icons/Folder.svg']
const services = computed(() => serviceIcons.map((icon, index) => [rows.value.services[index], icon]))

// แผนที่ใช้ Mapbox และข้อมูลจริงชุดเดียวกับหน้าแรกของผู้ใช้ (/incidents/map + /help-requests/map)
const {
  selectedIncident, selectedIncidentPreview, selectedIncidentDetail, publicMapItems, mapError, mapCenter,
  selectIncident, clearSelectedIncident, fetchPublicMapItems,
} = useHomeDashboard()
// เหตุในกลุ่มหมุดที่กดบนแผนที่ (ว่าง = ไม่แสดงกล่องรายการ)
const selectedGroupItems = ref([])
// จุดของหมุดที่กดล่าสุด ปิดการ์ดแล้วแผนที่จะยังอยู่ที่เดิม ไม่บินกลับไปหมุดแรก
const focusedCenter = ref(null)
const activeMapCenter = computed(() => focusedCenter.value || mapCenter.value)

watch(selectedIncident, (incident) => {
  if (incident) focusedCenter.value = [incident.lng, incident.lat]
})

const showGroupItems = (items) => {
  clearSelectedIncident()
  selectedGroupItems.value = items
}
const selectMapItem = (item) => {
  selectedGroupItems.value = []
  selectIncident(item)
}
const openReportDetail = ({ incidentId, reportId }) => navigateTo(`/incidents/${incidentId}/reports/${reportId}`)

onMounted(() => { void fetchPublicMapItems() })
// การเลือกหมุดเก็บใน useState ที่ใช้ร่วมกับหน้าแรก ล้างทิ้งตอนออกจากหน้า ไม่ให้ค้างไปเปิดที่หน้าอื่น
onBeforeUnmount(clearSelectedIncident)


// [ทั้งหมด, ยืนยันแล้ว, รอตรวจ, ไม่ผ่าน] ต่อวัน ชื่อวันอยู่ใน locales (adminDashboard.rows.chartDays)
const chartData = [[43, 29, 16, 7], [56, 31, 19, 8], [56, 39, 18, 8], [68, 37, 20, 8], [88, 53, 25, 9], [62, 29, 18, 7], [72, 35, 21, 8]]
const chart = computed(() => chartData.map(([total, verified, pending, rejected], index) => ({
  label: rows.value.chartDays[index], total, verified, pending, rejected,
})))
const chartConfig = computed(() => ({
  total: { label: t('adminDashboard.keyTotal'), color: 'var(--gs-action)' },
  verified: { label: t('status.verified'), color: 'var(--gs-verified)' },
  pending: { label: t('adminDashboard.keyPending'), color: '#d4920f' },
  rejected: { label: t('adminDashboard.keyRejected'), color: 'var(--gs-danger)' },
}))

const quickActions = ['reviewIncidents', 'manageHelp', 'trackUsers', 'manageEvents', 'editGuides']
const quickAction = (id) => {
  if (id === 'reviewIncidents') {
    navigateTo('/admin/incidents')
    return
  }
  notice.value = t('adminDashboard.inDevelopment', { label: t(`adminDashboard.actions.${id}`) })
}
</script>

<template>
  <section class="admin-content">
        <section class="intro">
          <div>
            <h1>{{ t('adminDashboard.greeting') }}</h1>
            <p>{{ t('adminDashboard.subtitle') }}</p>
          </div><em>{{ t('adminDashboard.quote') }}</em>
        </section>

        <p class="sample-banner"><img src="/icons/Alert.svg" alt="">{{ t('adminDashboard.sampleBanner') }}</p>

        <section class="summary" :aria-label="t('adminDashboard.summaryLabel')">
          <article v-for="card in cards" :key="card[0]" :class="`card card--${card[3]}`"><span class="card-icon"><img
                :src="card[4]" alt=""></span>
            <div><strong>{{ card[1] }}</strong><span>{{ card[0] }}</span><small :class="`trend-${card[5]}`">{{ card[5]
              === 'up' ? '↑' : '↓' }} {{ card[2] }}<i>{{ t('adminDashboard.fromLastWeek') }}</i></small></div>
          </article>
        </section>

        <p v-if="notice" class="notice" role="status">{{ notice }}<button type="button" :aria-label="t('adminDashboard.closeNotice')"
            @click="notice = ''">×</button></p>

        <section class="dashboard-mode">
          <section class="main-grid">
            <article class="panel map-panel">
              <header>
                <h2><img src="/icons/Map.svg" alt="">{{ t('adminDashboard.mapTitle') }}</h2><button type="button"
                  @click="quickAction('reviewIncidents')">{{ t('common.viewAll') }}</button>
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
            </article>

            <div class="side-stack">
              <Card>
                <CardHeader class="flex-row items-center justify-between space-y-0 px-4 py-3">
                  <CardTitle class="flex items-center gap-2 text-sm">
                    <img src="/icons/Chart.svg" alt="" class="h-5 w-5">{{ t('adminDashboard.statsTitle') }}
                  </CardTitle>
                  <span class="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">{{ t('adminDashboard.last7Days') }}</span>
                </CardHeader>
                <CardContent class="px-4 pb-4" role="group" :aria-label="t('adminDashboard.chartLabel')">
                  <ClientOnly>
                    <IncidentTrendChart :data="chart" :config="chartConfig" :height="170" />
                    <template #fallback><div class="h-[200px] rounded-md bg-muted" /></template>
                  </ClientOnly>
                </CardContent>
              </Card>
              <Card>
                <CardHeader class="px-4 py-3">
                  <CardTitle class="text-sm">{{ t('adminDashboard.typesTitle') }}</CardTitle>
                </CardHeader>
                <CardContent class="px-4 pb-4" role="group" :aria-label="t('adminDashboard.donutLabel', { count: typesTotal })">
                  <ClientOnly>
                    <IncidentTypeChart :data="types" :central-label="String(typesTotal)" :central-sub-label="t('adminDashboard.keyTotal')" />
                    <template #fallback><div class="h-[140px] rounded-md bg-muted" /></template>
                  </ClientOnly>
                </CardContent>
              </Card>
            </div>

            <aside class="right-rail">
              <article class="panel system">
                <h2><i />{{ t('adminDashboard.systemTitle') }}</h2>
                <ul>
                  <li v-for="service in services" :key="service[0]"><img :src="service[1]" alt=""><span>{{ service[0]
                  }}</span><b>{{ t('adminDashboard.online') }}</b></li>
                </ul>
              </article>
              <article class="panel quick">
                <h2><img src="/icons/Help.svg" alt="">{{ t('adminDashboard.quickTitle') }}</h2><button
                  v-for="action in quickActions"
                  :key="action" type="button" @click="quickAction(action)">{{ t(`adminDashboard.actions.${action}`) }}</button>
              </article>
            </aside>
          </section>

          <section class="tables">
            <article class="panel data">
              <header>
                <h2><img src="/icons/Report.svg" alt="">{{ t('adminDashboard.latestIncidents') }}</h2><button type="button"
                  @click="quickAction('allIncidents')">{{ t('common.viewAll') }}</button>
              </header>
              <div>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{{ t('adminDashboard.th.incident') }}</th>
                      <th>{{ t('adminDashboard.th.area') }}</th>
                      <th>{{ t('adminDashboard.th.type') }}</th>
                      <th>{{ t('adminDashboard.th.severity') }}</th>
                      <th>{{ t('adminDashboard.th.status') }}</th>
                      <th>{{ t('adminDashboard.th.time') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(incident, index) in incidents" :key="incident[0]">
                      <td>{{ index + 1 }}</td>
                      <td>{{ incident[0] }}</td>
                      <td>{{ incident[1] }}</td>
                      <td><img :src="incident[3]" alt="">{{ incident[2] }}</td>
                      <td><b class="severity" :class="incident[8] === 'high' ? 'high' : 'medium'">{{ incident[4] }}</b>
                      </td>
                      <td><b class="status" :class="{ verified: incident[9] === 'verified' }">{{ incident[5] }}</b>
                      </td>
                      <td>{{ incident[6] }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>
            <article class="panel data">
              <header>
                <h2><img src="/icons/Help.svg" alt="">{{ t('adminDashboard.latestHelp') }}</h2><button type="button"
                  @click="quickAction('allHelp')">{{ t('common.viewAll') }}</button>
              </header>
              <div>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{{ t('adminDashboard.th.request') }}</th>
                      <th>{{ t('adminDashboard.th.area') }}</th>
                      <th>{{ t('adminDashboard.th.count') }}</th>
                      <th>{{ t('adminDashboard.th.status') }}</th>
                      <th>{{ t('adminDashboard.th.time') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(request, index) in helpRequests" :key="request[0]">
                      <td>{{ index + 1 }}</td>
                      <td><img :src="request[5]" alt="">{{ request[0] }}</td>
                      <td>{{ request[1] }}</td>
                      <td>{{ request[2] }}</td>
                      <td><b class="status open">{{ request[3] }}</b></td>
                      <td>{{ request[4] }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>
            <article class="panel community">
              <header>
                <h2><img src="/icons/Users.svg" alt="">{{ t('adminDashboard.communityTitle') }}</h2><button type="button"
                  @click="quickAction('community')">{{ t('adminDashboard.details') }}</button>
              </header>
              <section>
                <div><img src="/icons/Users.svg" alt=""><strong>12,482</strong><span>{{ t('adminDashboard.communityUsers') }}</span></div>
                <div><img src="/icons/Selected.svg" alt=""><strong>8,320</strong><span>{{ t('adminDashboard.communityTrusted') }}</span></div>
                <div><img src="/icons/Users.svg" alt=""><strong>1,420</strong><span>{{ t('adminDashboard.communityWatching') }}</span></div>
                <div><img src="/icons/Warning-Error.svg" alt=""><strong>320</strong><span>{{ t('adminDashboard.communityRisk') }}</span></div>
              </section>
            </article>
          </section>
        </section>
  </section>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box
}

:global(body) {
  margin: 0;
  background: #f5f9ff;
  color: #102968;
  font-family: var(--bs-font-sans-serif)
}

:global(button),
:global(input) {
  font: inherit
}

.admin-dashboard {
  display: grid;
  min-height: 100vh;
  grid-template-columns: 14.2rem minmax(0, 1fr);
  background: #f7fbff
}

.sidebar {
  position: sticky;
  top: 0;
  display: flex;
  height: 100vh;
  flex-direction: column;
  padding: 1rem .85rem;
  border-right: 1px solid #dce8f5;
  background: #fff;
  overflow-y: auto
}

.brand {
  display: flex;
  align-items: center;
  gap: .55rem;
  margin: 0 0 1.25rem;
  padding: .1rem .25rem;
  color: #102968;
  text-decoration: none
}

.brand img {
  width: 3.05rem;
  height: 3.05rem;
  object-fit: contain
}

.brand span {
  display: grid;
  font-size: 1.36rem;
  font-weight: 850;
  letter-spacing: -.06em;
  line-height: 1
}

.brand small {
  margin-top: .28rem;
  color: #587096;
  font-size: .54rem;
  font-weight: 600;
  letter-spacing: -.01em
}

.admin-label {
  display: flex;
  align-items: center;
  gap: .6rem;
  margin: 0 0 .65rem;
  padding: .7rem;
  border-radius: .5rem;
  background: #e8f2ff;
  color: #176bd0;
  font-size: .78rem;
  font-weight: 800
}

.admin-label img {
  width: 1.15rem;
  height: 1.15rem
}

.sidebar nav {
  display: grid;
  gap: .2rem
}

.sidebar nav button {
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  gap: .8rem;
  min-height: 2.55rem;
  padding: 0 .72rem;
  border: 0;
  border-radius: .5rem;
  background: transparent;
  color: #18347b;
  font-size: .84rem;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  transition: .18s
}

.sidebar nav button img {
  width: 18px;
  height: 18px;
  opacity: .78
}

.sidebar nav button:hover {
  background: #eef6ff;
  color: #086ce4
}

.sidebar nav button.active {
  background: #1479ef;
  color: #fff;
  box-shadow: 0 8px 18px rgb(20 121 239 / 22%)
}

.sidebar nav button.active img {
  filter: brightness(0) invert(1);
  opacity: 1
}

.sidebar nav b {
  display: grid;
  min-width: 1.28rem;
  height: 1.28rem;
  place-items: center;
  margin-left: auto;
  border-radius: 999px;
  background: #e91f28;
  color: #fff;
  font-size: .66rem
}

.workspace {
  min-width: 0
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  min-height: 4rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: .65rem 1.2rem;
  border-bottom: 1px solid #ddeaf8;
  background: rgb(255 255 255 / 94%);
  backdrop-filter: blur(12px)
}

.search {
  display: flex;
  width: min(100%, 47rem);
  align-items: center;
  gap: .75rem;
  min-height: 2.55rem;
  padding: 0 .85rem;
  border-radius: .48rem;
  background: #f1f6fe;
  color: #163581
}

.search img {
  width: 1.25rem;
  height: 1.25rem
}

.search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #102968;
  font-size: .86rem
}

.search input::placeholder {
  color: #647aa5
}

.top-actions,
.location,
.account {
  display: flex;
  align-items: center
}

.top-actions {
  gap: .75rem
}

.location {
  gap: .46rem;
  min-height: 2.55rem;
  padding: 0 .7rem;
  border: 0;
  border-radius: .48rem;
  background: #f1f6fe;
  color: #183277;
  font-size: .78rem;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer
}

.location img {
  width: 1.15rem;
  height: 1.15rem
}

.location span {
  font-size: 1rem
}

.bell {
  position: relative;
  display: grid;
  width: 2.45rem;
  height: 2.45rem;
  place-items: center;
  border: 0;
  background: transparent;
  cursor: pointer
}

.bell img {
  width: 1.4rem;
  height: 1.4rem
}

.bell b {
  position: absolute;
  top: .1rem;
  right: .05rem;
  display: grid;
  width: 1.1rem;
  height: 1.1rem;
  place-items: center;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #ec1520;
  color: #fff;
  font-size: .57rem
}

.account {
  gap: .55rem
}

.avatar {
  display: grid;
  width: 2.45rem;
  height: 2.45rem;
  place-items: center;
  border-radius: 50%;
  background: #dce7f7;
  color: #35527d;
  font-size: 1rem;
  font-weight: 800
}

.account strong {
  max-width: 7rem;
  overflow: hidden;
  color: #12296b;
  font-size: .8rem;
  text-overflow: ellipsis;
  white-space: nowrap
}

.account button {
  padding: .36rem .5rem;
  border: 0;
  border-radius: .38rem;
  background: transparent;
  color: #526e99;
  font-size: .7rem;
  font-weight: 750;
  cursor: pointer
}

.account button:hover {
  background: #fff2f2;
  color: #ce2430
}

.content {
  width: min(100% - 2.4rem, 100rem);
  margin: 0 auto;
  padding: 1rem 0 2rem
}

.intro {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin: .1rem 0 .85rem
}

.intro h1 {
  margin: 0 0 .2rem;
  color: #0d1e67;
  font-size: clamp(1.55rem, 2.7vw, 2.2rem);
  letter-spacing: -.05em;
  line-height: 1.1
}

.intro p {
  margin: 0;
  color: #5b70a3;
  font-size: .84rem
}

.intro em {
  max-width: 15rem;
  color: #4f6098;
  font-size: .77rem;
  text-align: right
}

.summary {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: .48rem
}

.card {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: .6rem;
  min-height: 6.9rem;
  padding: .8rem .68rem;
  border: 1px solid #dceafa;
  border-radius: .58rem;
  background: #fff;
  box-shadow: 0 7px 16px rgb(28 78 138 / 4%)
}

.card-icon {
  display: grid;
  flex: 0 0 auto;
  width: 2.85rem;
  height: 2.85rem;
  place-items: center;
  border-radius: 50%
}

.card-icon img {
  width: 1.6rem;
  height: 1.6rem
}

.card strong,
.card span,
.card small {
  display: block
}

.card strong {
  color: #0c1968;
  font-size: 1.4rem;
  line-height: 1;
  letter-spacing: -.05em
}

.card>div>span {
  margin-top: .25rem;
  color: #4e6295;
  font-size: .68rem;
  line-height: 1.1
}

.card small {
  margin-top: .5rem;
  font-size: .67rem;
  font-weight: 800;
  white-space: nowrap
}

.card small i {
  display: block;
  margin: .15rem 0 0 .6rem;
  color: #6074a3;
  font-size: .62rem;
  font-style: normal;
  font-weight: 600
}

.card--red .card-icon {
  background: #ffe5e8
}

.card--blue .card-icon {
  background: #e2efff
}

.card--green .card-icon {
  background: #def8e7
}

.card--yellow .card-icon {
  background: #fff5d9
}

.card--purple .card-icon {
  background: #eee6ff
}

.trend-up {
  color: #0aa456
}

.trend-down {
  color: #e42a37
}

.notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: .75rem 0 0;
  padding: .68rem .85rem;
  border: 1px solid #b9d9ff;
  border-radius: .5rem;
  background: #eef7ff;
  color: #1760ad;
  font-size: .78rem;
  font-weight: 700
}

.notice button {
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 1.15rem;
  cursor: pointer
}

.main-grid {
  display: grid;
  grid-template-columns: minmax(30rem, 1.45fr) minmax(21rem, .93fr) minmax(13.5rem, .52fr);
  gap: .55rem;
  margin-top: .75rem
}

.panel {
  overflow: hidden;
  border: 1px solid #dceafa;
  border-radius: .58rem;
  background: #fff;
  box-shadow: 0 8px 20px rgb(24 73 132 / 4%)
}

.panel header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  min-height: 2.85rem;
  padding: .65rem .8rem;
  border-bottom: 1px solid #e4eef9
}

.panel h2 {
  display: flex;
  align-items: center;
  gap: .48rem;
  margin: 0;
  color: #12236e;
  font-size: .91rem;
  letter-spacing: -.02em
}

.panel h2>img,
.panel header h2>img {
  width: 1.25rem;
  height: 1.25rem
}

.panel header button {
  border: 0;
  background: transparent;
  color: #066be6;
  font-size: .72rem;
  font-weight: 800;
  cursor: pointer
}

.map {
  position: relative;
  height: 23.1rem;
  overflow: hidden;
  background: var(--gs-surface-sunken)
}

.map__canvas {
  position: absolute;
  inset: 0
}

.map__status {
  position: absolute;
  top: .75rem;
  left: 50%;
  z-index: 2;
  margin: 0;
  padding: .45rem .75rem;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface);
  color: var(--gs-danger);
  font-size: .78rem;
  font-weight: 700;
  transform: translateX(-50%)
}

.side-stack {
  display: grid;
  gap: .55rem;
  min-width: 0
}


.right-rail {
  display: grid;
  align-content: start;
  gap: .55rem
}

.system,
.quick {
  padding: .72rem
}

.system h2,
.quick h2 {
  margin-bottom: .65rem
}

.system h2>i {
  width: .8rem;
  height: .8rem;
  border-radius: 50%;
  background: #11ad5c;
  box-shadow: 0 0 0 3px #e0f8e9
}

.system ul {
  display: grid;
  gap: .32rem;
  margin: 0;
  padding: 0;
  list-style: none
}

.system li {
  display: flex;
  align-items: center;
  gap: .46rem;
  min-height: 1.8rem;
  padding: .28rem .35rem;
  border: 1px solid #edf2fa;
  border-radius: .35rem;
  color: #294674;
  font-size: .62rem
}

.system li img {
  width: .9rem;
  height: .9rem
}

.system li b {
  margin-left: auto;
  padding: .18rem .34rem;
  border-radius: .25rem;
  background: #ddf8e8;
  color: #119754;
  font-size: .55rem
}

.quick {
  display: grid;
  gap: .4rem
}

.quick h2 {
  margin-bottom: .2rem
}

.quick button {
  min-height: 2rem;
  padding: .35rem .5rem;
  border: 0;
  border-radius: .35rem;
  background: #eaf3ff;
  color: #0d55bc;
  font-size: .65rem;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
  transition: .16s
}

.quick button:first-of-type {
  background: #1479ef;
  color: #fff
}

.quick button:hover {
  background: #d5e8ff;
  transform: translateX(.12rem)
}

.quick button:first-of-type:hover {
  background: #0f68d1
}

.tables {
  display: grid;
  grid-template-columns: minmax(0, 1.04fr) minmax(0, .88fr) minmax(12rem, .42fr);
  gap: .55rem;
  margin-top: .55rem
}

.data {
  min-width: 0
}

.data>div {
  overflow-x: auto
}

.data table {
  width: 100%;
  min-width: 33rem;
  border-collapse: collapse;
  color: #37517f;
  font-size: .59rem
}

.data th {
  padding: .45rem .5rem;
  background: #f6f9fe;
  color: #59709b;
  font-size: .55rem;
  font-weight: 800;
  text-align: left;
  white-space: nowrap
}

.data td {
  padding: .43rem .5rem;
  border-top: 1px solid #edf2fa;
  white-space: nowrap
}

.data td:nth-child(2) {
  color: #1b3474;
  font-weight: 700
}

.data td img {
  width: .85rem;
  height: .85rem;
  margin-right: .18rem;
  vertical-align: middle
}

.severity,
.status {
  display: inline-block;
  padding: .15rem .32rem;
  border-radius: .23rem;
  font-size: .53rem;
  font-weight: 800
}

.high {
  background: #ffe1e4;
  color: #e02232
}

.medium {
  background: #fff0cf;
  color: #b87508
}

.status {
  background: #fff1d3;
  color: #b57605
}

.status.verified {
  background: #daf7e5;
  color: #108a4c
}

.status.open {
  background: #dcebff;
  color: #0964cf
}

.community {
  min-width: 0
}

.community>section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .45rem;
  padding: .6rem
}

.community>section>div {
  display: grid;
  grid-template-columns: 1.7rem 1fr;
  column-gap: .38rem;
  align-items: center;
  min-height: 4rem;
  padding: .45rem;
  border: 1px solid #e6eef8;
  border-radius: .4rem
}

.community>section img {
  grid-row: span 2;
  width: 1.4rem;
  height: 1.4rem
}

.community strong {
  color: #14286c;
  font-size: .84rem
}

.community span {
  color: #6278a1;
  font-size: .53rem;
  line-height: 1.1
}

button:focus-visible,
input:focus-visible {
  outline: 3px solid rgb(20 121 239 / 30%);
  outline-offset: 2px
}

@media(max-width:88rem) {
  .summary {
    grid-template-columns: repeat(3, minmax(0, 1fr))
  }

  .main-grid {
    grid-template-columns: minmax(30rem, 1.3fr) minmax(21rem, .9fr)
  }

  .right-rail {
    grid-column: span 2;
    grid-template-columns: 1fr 1fr
  }

  .tables {
    grid-template-columns: 1fr 1fr
  }

  .community {
    grid-column: span 2
  }

  .community>section {
    grid-template-columns: repeat(4, minmax(0, 1fr))
  }
}

@media(max-width:68rem) {
  .admin-dashboard {
    grid-template-columns: 4.4rem minmax(0, 1fr)
  }

  .sidebar {
    padding: .85rem .55rem
  }

  .brand {
    justify-content: center
  }

  .brand span,
  .admin-label {
    display: none
  }

  .sidebar nav button {
    justify-content: center;
    padding: 0
  }

  .sidebar nav button span {
    display: none
  }

  .sidebar nav b {
    position: absolute;
    margin: -1.35rem 0 0 1.2rem
  }

  .main-grid {
    grid-template-columns: 1fr
  }

  .right-rail {
    grid-column: auto
  }

  .map {
    height: 22rem
  }

  .tables {
    grid-template-columns: 1fr
  }

  .community {
    grid-column: auto
  }

  .community>section {
    grid-template-columns: repeat(2, minmax(0, 1fr))
  }

  .account strong {
    display: none
  }
}

@media(max-width:47rem) {
  .admin-dashboard {
    display: block
  }

  .sidebar {
    position: static;
    width: auto;
    height: auto;
    flex-direction: row;
    align-items: center;
    padding: .45rem .65rem;
    overflow-x: auto;
    overflow-y: hidden
  }

  .brand {
    margin: 0 .55rem 0 0
  }

  .brand img {
    width: 2.35rem;
    height: 2.35rem
  }

  .sidebar nav {
    display: flex;
    gap: .25rem
  }

  .sidebar nav button {
    flex: 0 0 2.3rem;
    min-height: 2.3rem
  }

  .topbar {
    position: static;
    padding: .55rem .75rem
  }

  .location,
  .account button {
    display: none
  }

  .top-actions {
    gap: .25rem
  }

  .content {
    width: min(100% - 1rem, 100rem);
    padding-top: .7rem
  }

  .intro {
    align-items: start;
    flex-direction: column
  }

  .intro em {
    text-align: left
  }

  .summary {
    grid-template-columns: repeat(2, minmax(0, 1fr))
  }

  .card {
    min-height: 5.7rem
  }

  .card strong {
    font-size: 1.18rem
  }

  .card-icon {
    width: 2.25rem;
    height: 2.25rem
  }

  .card-icon img {
    width: 1.3rem;
    height: 1.3rem
  }

  .card small i {
    display: none
  }

  .right-rail {
    grid-template-columns: 1fr
  }




  .search {
    min-width: 0
  }

  .search input {
    font-size: .72rem
  }

}

.sidebar nav button:disabled {
  cursor: not-allowed;
  opacity: .46
}

.sidebar nav button:disabled:hover {
  background: transparent;
  color: #18347b
}

.sample-banner {
  display: flex;
  align-items: center;
  gap: .45rem;
  margin: .55rem 0;
  padding: .45rem .65rem;
  border: 1px solid #f0dc9f;
  border-radius: .42rem;
  background: #fff9e7;
  color: #86641a;
  font-size: .66rem;
  font-weight: 700
}

.sample-banner img {
  width: .85rem;
  height: .85rem
}

.admin-dashboard--sidebar-collapsed {
  grid-template-columns: 4.65rem minmax(0, 1fr)
}

.sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .35rem;
  margin: 0 0 1.25rem
}

.sidebar-head .brand {
  margin: 0
}

.sidebar-toggle {
  display: grid;
  width: 2.1rem;
  height: 2.1rem;
  flex: 0 0 auto;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: .5rem;
  background: transparent;
  cursor: pointer
}

.sidebar-toggle:hover {
  background: #eef6ff
}

.sidebar-toggle img {
  width: 1.1rem;
  height: 1.1rem;
  transition: transform .18s ease
}

.menu-group {
  display: grid;
  gap: .2rem
}

.menu-group+h2 {
  margin-top: .2rem
}

.menu-group+.menu-group {
  margin-top: .8rem;
  padding-top: .75rem;
  border-top: 1px solid #edf2f8
}

.menu-group h2 {
  margin: 0 0 .2rem;
  padding: 0 .72rem;
  color: #7288aa;
  font-size: .62rem;
  font-weight: 800;
  letter-spacing: .04em
}

.sidebar--collapsed {
  align-items: stretch;
  padding-right: .55rem;
  padding-left: .55rem
}

.sidebar--collapsed .sidebar-head {
  justify-content: center
}

.sidebar--collapsed .brand img {
  width: 2.4rem;
  height: 2.4rem
}

/* Removed absolute positioning for collapsed toggle to match user sidebar */

.sidebar--collapsed .sidebar-toggle img {
  transform: rotate(180deg)
}

.sidebar--collapsed nav {
  gap: .85rem
}

.sidebar--collapsed .menu-group {
  justify-items: center
}

.sidebar--collapsed .menu-group+.menu-group {
  width: 100%;
  margin-top: 0;
  padding-top: .7rem
}

.sidebar--collapsed nav button {
  justify-content: center;
  width: 2.65rem;
  padding: 0
}

.sidebar--collapsed nav b {
  position: absolute;
  top: .08rem;
  right: .05rem;
  margin: 0
}


.sidebar-label {
  color: #334e80;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  padding-left: 0.25rem;
}

.sidebar-account {
  display: grid;
  gap: 0.25rem;
  margin-top: auto;
  padding-top: 0.85rem;
  border-top: 1px solid #dfe8f3;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.65rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 0.7rem;
  color: #183c75;
  font-size: 0.875rem;
  font-weight: 650;
  line-height: 1.2;
  text-decoration: none;
  background: transparent;
  cursor: pointer;
  transition: all 160ms ease;
  width: 100%;
}

.sidebar-link:hover {
  background: #edf5ff;
  color: #0876eb;
}

.sidebar-link img, .sidebar-link svg {
  width: 18px;
  height: 18px;
  object-fit: contain;
  flex: 0 0 auto;
}

.sidebar--collapsed .sidebar-account {
  justify-items: center;
}

.sidebar--collapsed .sidebar-link {
  justify-content: center;
  width: 2.65rem;
  padding: 0.5rem;
}
</style>
