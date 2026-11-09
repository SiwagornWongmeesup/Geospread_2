<template>
  <!-- ความช่วยเหลือของฉัน: คำขอที่ฉันส่ง + คำขอที่ฉันเสนอช่วย (ทุกสถานะ)
       ข้อมูลจาก GET /help-requests/mine ใช้กลับไปหาคำขอได้เสมอ แม้หายจากแผนที่แล้ว -->
  <section class="help-card" :aria-labelledby="titleId">
    <div class="help-card__head">
      <h2 :id="titleId">{{ t('profileHelp.title') }}</h2>
      <div class="help-card__tabs" role="tablist" :aria-label="t('profileHelp.title')">
        <button
          v-for="tab in TABS"
          :id="`${titleId}-${tab}`"
          :key="tab"
          type="button"
          role="tab"
          class="help-card__tab"
          :class="{ 'is-active': activeTab === tab }"
          :aria-selected="activeTab === tab"
          @click="activeTab = tab"
        >
          {{ t(`profileHelp.tabs.${tab}`) }}
          <span>{{ countOf(tab) }}</span>
        </button>
      </div>
    </div>

    <p v-if="isLoading" class="help-card__state" aria-live="polite">{{ t('profileHelp.loading') }}</p>

    <div v-else-if="loadError" class="help-card__state" role="alert">
      <p>{{ t('profileHelp.loadFailed') }}</p>
      <button type="button" class="help-card__retry" @click="loadMyHelp">{{ t('helpDetail.retry') }}</button>
    </div>

    <!-- ยังไม่มีรายการในแท็บนี้: ชวนไปทำสิ่งที่เกี่ยวข้อง -->
    <div v-else-if="!activeRows.length" class="help-card__empty">
      <p>{{ t(`profileHelp.empty.${activeTab}`) }}</p>
      <NuxtLink v-if="activeTab === 'requested'" to="/request-help">{{ t('profileHelp.requestNow') }}</NuxtLink>
      <NuxtLink v-else to="/help-requests">{{ t('profileHelp.browseRequests') }}</NuxtLink>
    </div>

    <ul v-else class="help-card__list" role="tabpanel" :aria-labelledby="`${titleId}-${activeTab}`">
      <li v-for="row in activeRows" :key="`${activeTab}-${row.help_request_id}`">
        <NuxtLink :to="`/help-requests/${row.help_request_id}`" class="help-row">
          <span class="help-row__icon" aria-hidden="true"><img :src="getHelpRequestIcon(row.help_type)" alt=""></span>
          <span class="help-row__main">
            <strong>{{ rowTitle(row) }}</strong>
            <small>{{ rowSubline(row) }}</small>
          </span>
          <span class="help-row__status" :class="`help-row__status--${rowTone(row)}`">{{ rowStatus(row) }}</span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { getHelpRequestIcon, getHelpRequestLabel } from '~/composables/useHelpRequestIcon'
import { formatRelativeTime } from '~/composables/useHomeDashboard'

const TABS = ['requested', 'offered']

const { t } = useLocale()
const { getToken } = useAuth()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:5000'
const titleId = useId()

const activeTab = ref('requested')
const myHelp = ref({ requested: [], offered: [] })
const isLoading = ref(true)
const loadError = ref(false)

const loadMyHelp = async () => {
  isLoading.value = true
  loadError.value = false
  try {
    const response = await $fetch(`${apiBase}/help-requests/mine`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    myHelp.value = response.data
  } catch (error) {
    console.error('โหลดความช่วยเหลือของฉันไม่สำเร็จ', error)
    loadError.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(loadMyHelp)

const activeRows = computed(() => myHelp.value[activeTab.value] ?? [])
const countOf = (tab) => (myHelp.value[tab] ?? []).length

const rowTitle = (row) => {
  if (row.help_type === 'other' && row.custom_help_type) {
    return row.custom_help_type
  }
  return getHelpRequestLabel(row.help_type, t)
}

// บรรทัดรอง: จำนวนคน + เวลา
const rowSubline = (row) => {
  let time = row.created_at
  if (row.offered_at) {
    time = row.offered_at
  }
  return `${t('help.peopleNeedHelp', { count: row.people_count })} · ${formatRelativeTime(time, t)}`
}

// สถานะของคำขอ: รอความช่วยเหลือแต่หมดเวลาแล้ว ถือว่าหมดเวลา
const requestStatusKey = (row) => {
  if (row.request_status === 'pending' && row.is_expired) {
    return 'expired'
  }
  return row.request_status
}

// แท็บ "คำขอของฉัน": แสดงสถานะคำขอ / แท็บ "ที่ฉันเสนอช่วย": แสดงสถานะข้อเสนอของฉัน
const rowStatus = (row) => {
  if (activeTab.value === 'requested') {
    return t(`helpDetail.status.${requestStatusKey(row)}`)
  }
  return t(`profileHelp.offerStatus.${myOfferKey(row)}`)
}

// ข้อเสนอที่ได้รับเลือก แยกต่อว่ากำลังไปช่วย หรือช่วยสำเร็จแล้ว
const myOfferKey = (row) => {
  if (row.offer_status === 'accepted' && row.request_status === 'resolved') {
    return 'helped'
  }
  if (row.offer_status === 'accepted' && row.request_status === 'cancelled') {
    return 'cancelled'
  }
  return row.offer_status
}

// โทนสีของป้ายสถานะ: active = ต้องทำอะไรต่อ, done = สำเร็จ, waiting = รอ, muted = จบแล้ว
const TONE_BY_KEY = {
  pending: 'waiting',
  accepted: 'active',
  in_progress: 'active',
  resolved: 'done',
  helped: 'done',
  cancelled: 'muted',
  expired: 'muted',
  declined: 'muted',
  withdrawn: 'muted',
  released: 'muted',
}

const rowTone = (row) => {
  let key = myOfferKey(row)
  if (activeTab.value === 'requested') {
    key = requestStatusKey(row)
  }
  return TONE_BY_KEY[key] ?? 'muted'
}
</script>

<style scoped>
.help-card {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 20px;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
}

.help-card__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.help-card h2 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 18px;
  font-weight: 700;
}

/* แท็บแบบปุ่มแบ่งส่วน */
.help-card__tabs {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface-sunken);
}

.help-card__tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 12px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--gs-muted);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.help-card__tab span {
  font-variant-numeric: tabular-nums;
}

.help-card__tab.is-active {
  background: var(--gs-surface);
  color: var(--gs-ink);
  box-shadow: 0 1px 3px rgb(23 32 46 / 12%);
}

.help-card__tab:focus-visible,
.help-card__retry:focus-visible,
.help-row:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

.help-card__state,
.help-card__empty {
  display: grid;
  justify-items: start;
  gap: 8px;
  margin: 0;
  color: var(--gs-muted);
  font-size: 14px;
}

.help-card__state p,
.help-card__empty p {
  margin: 0;
}

.help-card__empty a {
  color: var(--gs-action);
  font-weight: 700;
  text-underline-offset: 3px;
}

.help-card__retry {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface);
  color: var(--gs-ink);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.help-card__list {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}

.help-card__list li + li {
  border-top: 1px solid var(--gs-line);
}

/* แถวคำขอ: ไอคอน | ชื่อ + รายละเอียด | สถานะ */
.help-row {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 10px 6px;
  border-radius: var(--gs-radius-sm);
  color: inherit;
  text-decoration: none;
}

.help-row:hover {
  background: var(--gs-surface-sunken);
}

.help-row__icon {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 50%;
  background: var(--gs-help-tint);
}

.help-row__icon img {
  width: 22px;
  height: 22px;
}

.help-row__main {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.help-row__main strong {
  overflow: hidden;
  color: var(--gs-ink);
  font-size: 15px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.help-row__main small {
  color: var(--gs-muted);
  font-size: 13px;
}

.help-row__status {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.help-row__status--waiting { background: var(--gs-pending-tint); color: var(--gs-pending); }
.help-row__status--active { background: var(--gs-help-tint); color: var(--gs-help); }
.help-row__status--done { background: #e3f1e8; color: var(--gs-verified); }
.help-row__status--muted { background: var(--gs-surface-sunken); color: var(--gs-muted); }
</style>
