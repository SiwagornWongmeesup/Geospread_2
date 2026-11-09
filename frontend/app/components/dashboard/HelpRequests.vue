<template>
  <section class="help-requests" aria-labelledby="help-requests-heading">
    <header class="help-requests__header">
      <h2 id="help-requests-heading">{{ title || t('helpList.title') }}</h2>
      <NuxtLink v-if="!fullList" to="/help-requests">{{ t('common.viewAll') }}</NuxtLink>
    </header>

    <!-- หน้า /help-requests: เลือกดูตามสถานะ -->
    <div v-if="fullList" class="help-requests__filters" role="group" :aria-label="t('helpList.filterLabel')">
      <button
        v-for="filter in STATUS_FILTERS"
        :key="filter"
        type="button"
        class="help-requests__chip"
        :class="{ 'is-active': statusFilter === filter }"
        :aria-pressed="statusFilter === filter"
        @click="statusFilter = filter"
      >
        {{ t(`helpList.filters.${filter}`) }}
        <span>{{ countByStatus(filter) }}</span>
      </button>
    </div>

    <p v-if="!requests.length" class="help-requests__empty">
      {{ emptyText }}
    </p>

    <div v-else class="help-requests__list">
      <article v-for="request in requests" :key="request.id" class="help-request-card">
        <img class="help-request-card__icon" :src="request.iconUrl || '/icons/Life-saving.svg'" alt="" aria-hidden="true" />
        <div class="help-request-card__content">
          <h3>
            {{ request.title }}
            <span v-if="request.helpStatus === 'accepted'" class="help-request-card__status">{{ t('status.helpAccepted') }}</span>
          </h3>
          <p>{{ request.distanceFromUserLabel || request.areaLabel }} · {{ request.time }}</p>
          <!-- จำนวนคนแสดงทุกครั้ง (เดิมถ้ามีรายละเอียด จำนวนคนจะหายไป) -->
          <strong class="help-request-card__people">{{ t('help.peopleNeedHelp', { count: request.peopleCount }) }}</strong>
          <small v-if="request.description">{{ request.description }}</small>
          <!-- ดูรายละเอียดเต็ม (รูป, เสนอช่วย) หรือเปิดหมุดคำขอนี้บนแผนที่หน้าหลัก -->
          <div class="help-request-card__actions">
            <NuxtLink :to="`/help-requests/${request.helpRequestId}`" class="help-request-card__map help-request-card__detail">
              {{ t('common.viewDetails') }}
            </NuxtLink>
            <button type="button" class="help-request-card__map" @click="showOnMap(request)">{{ t('incidentsPage.showOnMap') }}</button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  // true = หน้า /help-requests: แสดงทุกรายการ + ปุ่มกรองสถานะ
  // false = การ์ดหน้าหลัก: แสดง 3 คำขอที่รอความช่วยเหลือใกล้ที่สุด
  fullList: {
    type: Boolean,
    default: false,
  },
})

const STATUS_FILTERS = ['pending', 'accepted']

const { t } = useLocale()
const { helpRequestCards, allHelpRequestCards, publicMapItems, isLoadingMap, fetchPublicMapItems, setPendingMapFocus } = useHomeDashboard()

const statusFilter = ref('pending')

const countByStatus = (status) => {
  return allHelpRequestCards.value.filter((request) => request.helpStatus === status).length
}

const requests = computed(() => {
  if (!props.fullList) {
    return helpRequestCards.value
  }
  return allHelpRequestCards.value.filter((request) => request.helpStatus === statusFilter.value)
})

const emptyText = computed(() => {
  if (props.fullList && statusFilter.value === 'accepted') {
    return t('helpList.emptyAccepted')
  }
  return t('helpList.empty')
})

// กดดูบนแผนที่: กลับหน้าหลักแล้วเปิดหมุดคำขอนี้
const showOnMap = (request) => {
  setPendingMapFocus({ itemId: request.id, lat: request.lat, lng: request.lng })
  navigateTo('/')
}

// หน้า /help-requests ใช้คอมโพเนนต์นี้เดี่ยวๆ จึงต้องโหลดข้อมูลเองถ้ายังไม่มี
onMounted(() => {
  if (!publicMapItems.value.length && !isLoadingMap.value) void fetchPublicMapItems()
})
</script>

<style scoped>
.help-requests {
  padding: 1.1rem 1.25rem 1.25rem;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
}

.help-requests__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.help-requests h2 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 1.05rem;
  font-weight: 700;
}

.help-requests__header a {
  color: var(--gs-action);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: var(--gs-line-strong);
  text-underline-offset: 0.2em;
}

.help-requests__header a:hover {
  text-decoration-color: currentColor;
}

.help-requests__empty {
  margin: 0.5rem 0 0;
  color: var(--gs-muted);
  font-size: 0.875rem;
}

.help-requests__list {
  display: grid;
}

/* ปุ่มกรองสถานะ (หน้า /help-requests) */
.help-requests__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 4px 0 8px;
}

.help-requests__chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid var(--gs-line-strong);
  border-radius: 999px;
  background: var(--gs-surface);
  color: var(--gs-ink-2);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.help-requests__chip span {
  color: var(--gs-muted);
  font-variant-numeric: tabular-nums;
}

.help-requests__chip:hover {
  background: var(--gs-surface-sunken);
}

.help-requests__chip.is-active {
  border-color: var(--gs-help);
  background: var(--gs-help);
  color: #ffffff;
}

.help-requests__chip.is-active span {
  color: rgb(255 255 255 / 80%);
}

.help-requests__chip:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

/* ป้าย "มีผู้ช่วยแล้ว" ต่อท้ายชื่อคำขอ */
.help-request-card__status {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 8px;
  border-radius: 999px;
  background: #e3efe9;
  color: #2f5d4f;
  font-size: 12px;
  font-weight: 700;
  vertical-align: 2px;
}

.help-request-card {
  display: grid;
  grid-template-columns: 2.25rem minmax(0, 1fr);
  gap: 0.75rem;
  padding: 0.85rem 0;
}

.help-request-card + .help-request-card {
  border-top: 1px solid var(--gs-line);
}

.help-request-card__icon {
  width: 2.25rem;
  height: 2.25rem;
  padding: 0.45rem;
  box-sizing: border-box;
  border-radius: 50%;
  background: var(--gs-help-tint);
}

.help-request-card__content {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr) auto;
  column-gap: 0.75rem;
  align-items: start;
}

.help-request-card h3 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.4;
}

.help-request-card p {
  grid-column: 1;
  margin: 0.15rem 0 0.25rem;
  color: var(--gs-muted);
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}

/* จำนวนคนที่ต้องการความช่วยเหลือ: ตัวหนา สีส้มของคำขอ จะได้เห็นชัด */
.help-request-card__people {
  grid-column: 1;
  margin-bottom: 0.15rem;
  color: var(--gs-help);
  font-size: 0.85rem;
  font-weight: 700;
}

.help-request-card small {
  margin-top: 0.15rem;
  display: -webkit-box;
  grid-column: 1;
  overflow: hidden;
  color: var(--gs-ink-2);
  font-size: 0.85rem;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

/* ปุ่มด้านขวาของการ์ด: ดูรายละเอียด (ปุ่มหลัก) และดูบนแผนที่ */
.help-request-card__actions {
  display: flex;
  flex-direction: column;
  grid-column: 2;
  grid-row: 1 / span 4;
  align-self: center;
  gap: 6px;
}

.help-request-card__map {
  padding: 0.45rem 0.75rem;
  text-align: center;
  border: 1px solid var(--gs-help);
  border-radius: var(--gs-radius-sm);
  color: var(--gs-help);
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  background: transparent;
  font-family: inherit;
  cursor: pointer;
}

.help-request-card__map:hover {
  background: var(--gs-help-tint);
}

.help-request-card__detail {
  background: var(--gs-help);
  color: #ffffff;
}

.help-request-card__detail:hover {
  background: var(--gs-help-hover);
}

.help-request-card__map:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}
</style>
