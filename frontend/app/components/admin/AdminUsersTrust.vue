<script setup>
// ---------------------------------------------------------------------------
// หน้าจัดการผู้ใช้ของแอดมิน: รายชื่อจริงจาก GET /users (ส่งมาจาก pages/admin/users.vue)
// - ค้นหา กรอง เรียงคอลัมน์ และแบ่งหน้า เก็บไว้ใน URL (?q=&filter=&sort=&dir=&page=) รีเฟรชแล้วไม่หาย
// - ผู้ใช้ที่ยังไม่เคยรายงานแสดงว่า "ยังไม่มีคะแนน" แทนคะแนนเริ่มต้น 100
// ---------------------------------------------------------------------------
import { computed, ref, watch } from 'vue'
import { formatRelativeTime } from '~/composables/useHomeDashboard'

const props = defineProps({
  users: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  // key ของข้อความ error ในไฟล์ภาษา ('' = ไม่มี error)
  errorKey: { type: String, default: '' },
})

const emit = defineEmits(['retry'])

const { t, locale } = useLocale()
const route = useRoute()
const router = useRouter()

const PAGE_SIZE = 10
const DAY_MS = 24 * 60 * 60 * 1000

// ตัวกรอง: ทั้งหมด / ต้องติดตาม (เฝ้าระวัง + เสี่ยงสูง) / ยังไม่ยืนยันอีเมล
const filters = ['all', 'attention', 'unverified']

// คอลัมน์ที่เรียงได้ [key, ข้อความหัวตาราง]
const columns = [
  ['name', 'usersTrust.th.user'],
  ['trust', 'usersTrust.th.trust'],
  ['reports', 'usersTrust.th.reports'],
  ['verified', 'usersTrust.th.verified'],
  ['suspicious', 'usersTrust.th.suspicious'],
  ['lastActivity', 'usersTrust.th.lastActivity'],
]
// วันที่สมัครอยู่ในแผงรายละเอียดแล้ว ตารางจึงไม่มีคอลัมน์นี้ (ให้ชื่อและอีเมลมีที่พอ)

// ---- อ่านค่าเริ่มต้นจาก URL ----

const readQuery = (name, fallback) => {
  const value = route.query[name]
  if (typeof value === 'string' && value !== '') {
    return value
  }
  return fallback
}

const activeFilter = ref(readQuery('filter', 'all'))
const keyword = ref(readQuery('q', ''))
// ค่าเริ่มต้น: คนที่มีรายงานน่าสงสัยมากที่สุดขึ้นก่อน
const sortKey = ref(readQuery('sort', 'suspicious'))
const sortDirection = ref(readQuery('dir', 'desc'))
const currentPage = ref(Number(readQuery('page', '1')) || 1)
const selectedUserId = ref(null)

// เขียนสถานะลง URL (แทนที่ประวัติ ไม่เพิ่มหน้าใหม่ทุกครั้งที่พิมพ์)
watch([activeFilter, keyword, sortKey, sortDirection, currentPage], () => {
  const query = {}
  if (activeFilter.value !== 'all') {
    query.filter = activeFilter.value
  }
  if (keyword.value) {
    query.q = keyword.value
  }
  if (sortKey.value !== 'suspicious' || sortDirection.value !== 'desc') {
    query.sort = sortKey.value
    query.dir = sortDirection.value
  }
  if (currentPage.value > 1) {
    query.page = String(currentPage.value)
  }
  router.replace({ query })
})

// เปลี่ยนตัวกรองหรือคำค้นหาแล้วกลับไปหน้าแรก
watch([activeFilter, keyword], () => {
  currentPage.value = 1
})

// ---- จัดรูปแบบข้อความ ----

const formatJoined = (isoDate) => {
  let dateLocale = 'th-TH'
  if (locale.value === 'en') {
    dateLocale = 'en-GB'
  }
  return new Intl.DateTimeFormat(dateLocale, { dateStyle: 'medium' }).format(new Date(isoDate))
}

// กิจกรรมล่าสุด = เวลาที่ส่งรายงานล่าสุด (ฐานข้อมูลยังไม่มีเวลาเข้าสู่ระบบ)
const formatLastActivity = (user) => {
  if (!user.lastReportAt) {
    return t('usersTrust.noActivity')
  }
  return formatRelativeTime(user.lastReportAt, t)
}

const users = computed(() => {
  return props.users.map((user) => {
    return {
      ...user,
      level: t(`usersTrust.levels.${user.levelKey}`),
      lastActivity: formatLastActivity(user),
      joined: formatJoined(user.createdAt),
    }
  })
})

// ---- ตัวเลขสรุป (นับจากรายชื่อจริง) ----

const countUsers = (check) => {
  let count = 0
  for (const user of users.value) {
    if (check(user)) {
      count = count + 1
    }
  }
  return count
}

const needsAttention = (user) => user.tone === 'watchlist' || user.tone === 'risk'

const metrics = computed(() => {
  const now = Date.now()
  return {
    total: users.value.length,
    newLast7Days: countUsers((user) => now - new Date(user.createdAt).getTime() < 7 * DAY_MS),
    scored: countUsers((user) => user.isScored),
    attention: countUsers(needsAttention),
    unverified: countUsers((user) => !user.emailVerified),
  }
})

// ---- กรอง ค้นหา เรียง แบ่งหน้า ----

const matchesFilter = (user) => {
  if (activeFilter.value === 'attention') {
    return needsAttention(user)
  }
  if (activeFilter.value === 'unverified') {
    return !user.emailVerified
  }
  return true
}

const matchesKeyword = (user, term) => {
  if (!term) {
    return true
  }
  const searchable = `${user.name} ${user.email} ${user.phone ?? ''}`.toLocaleLowerCase()
  return searchable.includes(term)
}

// ค่าที่ใช้เรียงของแต่ละคอลัมน์ (ผู้ใช้ที่ยังไม่มีคะแนนถือว่าคะแนน -1 จะได้ไปอยู่ท้าย/หน้าแยกจากคนมีคะแนน)
const sortValue = (user, key) => {
  if (key === 'name') {
    return user.name.toLocaleLowerCase()
  }
  if (key === 'trust') {
    if (!user.isScored) {
      return -1
    }
    return user.trust
  }
  if (key === 'lastActivity') {
    if (!user.lastReportAt) {
      return 0
    }
    return new Date(user.lastReportAt).getTime()
  }
  if (key === 'joined') {
    return new Date(user.createdAt).getTime()
  }
  return user[key]
}

const compareUsers = (first, second) => {
  const firstValue = sortValue(first, sortKey.value)
  const secondValue = sortValue(second, sortKey.value)
  let result = 0
  if (firstValue < secondValue) {
    result = -1
  } else if (firstValue > secondValue) {
    result = 1
  }
  if (sortDirection.value === 'desc') {
    result = -result
  }
  return result
}

const filteredUsers = computed(() => {
  const term = keyword.value.trim().toLocaleLowerCase()
  const matched = users.value.filter((user) => matchesFilter(user) && matchesKeyword(user, term))
  return [...matched].sort(compareUsers)
})

const pageCount = computed(() => {
  const pages = Math.ceil(filteredUsers.value.length / PAGE_SIZE)
  if (pages < 1) {
    return 1
  }
  return pages
})

const pagedUsers = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredUsers.value.slice(start, start + PAGE_SIZE)
})

const goToPage = (page) => {
  if (page < 1 || page > pageCount.value) {
    return
  }
  currentPage.value = page
}

// กดหัวคอลัมน์: คอลัมน์เดิมสลับทิศทาง คอลัมน์ใหม่เริ่มจากมากไปน้อย (ชื่อเริ่มจาก ก-ฮ)
const sortBy = (key) => {
  if (sortKey.value === key) {
    if (sortDirection.value === 'asc') {
      sortDirection.value = 'desc'
    } else {
      sortDirection.value = 'asc'
    }
    return
  }
  sortKey.value = key
  if (key === 'name') {
    sortDirection.value = 'asc'
  } else {
    sortDirection.value = 'desc'
  }
}

const ariaSort = (key) => {
  if (sortKey.value !== key) {
    return 'none'
  }
  if (sortDirection.value === 'asc') {
    return 'ascending'
  }
  return 'descending'
}

// ---- ผู้ใช้ที่เลือกดูรายละเอียด (ยังไม่เลือก = คนแรกของรายการที่แสดง) ----

const selectedUser = computed(() => {
  const found = users.value.find((user) => user.id === selectedUserId.value)
  if (found) {
    return found
  }
  return pagedUsers.value[0] ?? null
})

const selectUser = (id) => {
  selectedUserId.value = id
}

// ข้อความประกาศให้ screen reader รู้ว่ากำลังดูใคร
const viewingAnnouncement = computed(() => {
  if (!selectedUserId.value || !selectedUser.value) {
    return ''
  }
  return t('usersTrust.viewing', { name: selectedUser.value.name })
})

// จำนวนรายงานจริงของผู้ใช้ [ข้อความ, จำนวน, สี]
const selectedBreakdown = computed(() => {
  const user = selectedUser.value
  if (!user) {
    return []
  }
  return [
    [t('usersTrust.breakdown.totalReports'), user.reports, 'neutral'],
    [t('usersTrust.breakdown.verifiedReports'), user.verified, 'positive'],
    [t('usersTrust.breakdown.rejectedReports'), user.rejected, 'negative'],
    [t('usersTrust.breakdown.suspiciousReports'), user.suspicious, 'negative'],
  ]
})

const roleLabel = (role) => {
  if (role === 'admin') {
    return t('usersTrust.roles.admin')
  }
  return t('usersTrust.roles.user')
}

const emailLabel = (user) => {
  if (user.emailVerified) {
    return t('usersTrust.emailVerified')
  }
  return t('usersTrust.emailUnverified')
}

const trustText = (user) => {
  if (!user.isScored) {
    return '–'
  }
  return String(user.trust)
}

// แถบคะแนน: กว้างอย่างน้อย 4% ให้ยังเห็นสีแม้คะแนนต่ำมาก
const trustWidth = (score) => {
  let width = score
  if (width < 4) {
    width = 4
  }
  if (width > 100) {
    width = 100
  }
  return `${width}%`
}
</script>

<template>
  <section class="users" aria-labelledby="users-directory-title">
    <p class="users__intro">{{ t('usersTrust.subtitle') }}</p>

    <!-- โหลดไม่สำเร็จ / ไม่มีสิทธิ์ -->
    <div v-if="errorKey" class="users__error" role="alert">
      <span>{{ t(errorKey) }}</span>
      <button type="button" class="button" @click="emit('retry')">{{ t('usersTrust.retry') }}</button>
    </div>

    <!-- ตัวเลขสรุป: แถวเดียวคั่นด้วยเส้น -->
    <dl class="ledger" :aria-label="t('usersTrust.metricsLabel')" :aria-busy="isLoading">
      <div>
        <dt>{{ t('usersTrust.metrics.total') }}</dt>
        <dd>{{ metrics.total }} <small>{{ t('usersTrust.metrics.newLast7Days', { count: metrics.newLast7Days }) }}</small></dd>
      </div>
      <div>
        <dt>{{ t('usersTrust.metrics.scored') }}</dt>
        <dd>{{ metrics.scored }}</dd>
      </div>
      <div>
        <dt>{{ t('usersTrust.metrics.attention') }}</dt>
        <dd :class="{ 'ledger__alert': metrics.attention > 0 }">{{ metrics.attention }}</dd>
      </div>
      <div>
        <dt>{{ t('usersTrust.metrics.unverified') }}</dt>
        <dd>{{ metrics.unverified }}</dd>
      </div>
    </dl>

    <div class="users__workspace">
      <section class="directory" aria-labelledby="users-directory-title">
        <h2 id="users-directory-title" class="sr-only">{{ t('usersTrust.directory') }}</h2>

        <header class="directory__tools">
          <div class="directory__filters" role="group" :aria-label="t('usersTrust.filterLabel')">
            <button
              v-for="filter in filters"
              :key="filter"
              type="button"
              class="chip"
              :aria-pressed="activeFilter === filter"
              @click="activeFilter = filter"
            >
              {{ t(`usersTrust.filters.${filter}`) }}
            </button>
          </div>
          <label class="directory__search">
            <span class="sr-only">{{ t('usersTrust.searchLabel') }}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></svg>
            <input v-model.trim="keyword" type="search" :placeholder="t('usersTrust.searchPlaceholder')">
          </label>
        </header>

        <div class="table-wrap">
          <table class="table" :aria-busy="isLoading">
            <thead>
              <tr>
                <th v-for="[key, label] in columns" :key="key" scope="col" :aria-sort="ariaSort(key)">
                  <button type="button" class="sort" @click="sortBy(key)">
                    {{ t(label) }}
                    <svg viewBox="0 0 12 12" aria-hidden="true" :class="{ 'sort__icon--active': sortKey === key, 'sort__icon--asc': sortKey === key && sortDirection === 'asc' }">
                      <path d="m3 4.5 3-3 3 3M3 7.5l3 3 3-3" />
                    </svg>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td :colspan="columns.length" class="empty">{{ t('usersTrust.loading') }}</td>
              </tr>
              <template v-else>
                <tr v-for="user in pagedUsers" :key="user.id" :class="{ 'is-selected': selectedUser?.id === user.id }">
                  <td>
                    <button
                      type="button"
                      class="user-cell"
                      :aria-label="t('usersTrust.viewDetails', { name: user.name })"
                      :aria-pressed="selectedUser?.id === user.id"
                      @click="selectUser(user.id)"
                    >
                      <span class="avatar" aria-hidden="true">{{ user.initials }}</span>
                      <span class="user-cell__text">
                        <strong>{{ user.name }}</strong>
                        <span>{{ user.email }}</span>
                      </span>
                    </button>
                  </td>
                  <td>
                    <div class="trust">
                      <span class="trust__value">{{ trustText(user) }}</span>
                      <span class="level" :class="`level--${user.tone}`">{{ user.level }}</span>
                    </div>
                  </td>
                  <td class="number">{{ user.reports }}</td>
                  <td class="number">{{ user.verified }}</td>
                  <td class="number" :class="{ 'number--alert': user.suspicious > 0 }">{{ user.suspicious }}</td>
                  <td class="muted">{{ user.lastActivity }}</td>
                </tr>
                <tr v-if="!filteredUsers.length && !errorKey">
                  <td :colspan="columns.length" class="empty">{{ t('usersTrust.empty') }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <footer class="directory__footer">
          <span>{{ t('usersTrust.showing', { shown: pagedUsers.length, total: filteredUsers.length }) }}</span>
          <nav class="pager" :aria-label="t('usersTrust.pagination')">
            <button type="button" class="button" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
              {{ t('usersTrust.previousPage') }}
            </button>
            <span aria-live="polite">{{ t('usersTrust.pageOf', { page: currentPage, total: pageCount }) }}</span>
            <button type="button" class="button" :disabled="currentPage === pageCount" @click="goToPage(currentPage + 1)">
              {{ t('usersTrust.nextPage') }}
            </button>
          </nav>
        </footer>
      </section>

      <!-- รายละเอียดผู้ใช้ที่เลือก -->
      <aside v-if="selectedUser" class="detail" aria-labelledby="user-detail-title">
        <p class="sr-only" aria-live="polite">{{ viewingAnnouncement }}</p>
        <header class="detail__head">
          <span class="avatar avatar--large" aria-hidden="true">{{ selectedUser.initials }}</span>
          <div>
            <h2 id="user-detail-title">{{ selectedUser.name }}</h2>
            <p>{{ selectedUser.email }}</p>
          </div>
        </header>

        <dl class="facts">
          <div>
            <dt>{{ t('usersTrust.role') }}</dt>
            <dd>{{ roleLabel(selectedUser.role) }}</dd>
          </div>
          <div>
            <dt>{{ t('usersTrust.emailStatus') }}</dt>
            <dd :class="{ 'facts__ok': selectedUser.emailVerified }">{{ emailLabel(selectedUser) }}</dd>
          </div>
          <div>
            <dt>{{ t('usersTrust.phone') }}</dt>
            <dd>{{ selectedUser.phone || t('usersTrust.notSet') }}</dd>
          </div>
          <div>
            <dt>{{ t('usersTrust.joined') }}</dt>
            <dd>{{ selectedUser.joined }}</dd>
          </div>
        </dl>

        <section class="detail__section" aria-labelledby="user-score-title">
          <h3 id="user-score-title">{{ t('usersTrust.th.trust') }}</h3>
          <template v-if="selectedUser.isScored">
            <p class="score"><strong>{{ selectedUser.trust }}</strong> / 100 <span class="level" :class="`level--${selectedUser.tone}`">{{ selectedUser.level }}</span></p>
            <div class="meter" aria-hidden="true"><span :class="`meter--${selectedUser.tone}`" :style="{ width: trustWidth(selectedUser.trust) }"></span></div>
          </template>
          <p v-else class="muted">{{ t('usersTrust.noScoreHint') }}</p>
        </section>

        <section class="detail__section" aria-labelledby="user-reports-title">
          <h3 id="user-reports-title">{{ t('usersTrust.scoreSources') }}</h3>
          <ul class="breakdown">
            <li v-for="item in selectedBreakdown" :key="item[0]">
              <span>{{ item[0] }}</span>
              <b :class="`breakdown--${item[2]}`">{{ item[1] }}</b>
            </li>
          </ul>
          <p class="muted">
            {{ t('usersTrust.lastReport') }}: {{ selectedUser.lastActivity }}
          </p>
        </section>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.users {
  display: grid;
  gap: 16px;
  color: var(--gs-ink);
}

.users__intro {
  margin: 0;
  color: var(--gs-ink-2);
  font-size: 15px;
}

.users__error {
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

/* ---- ตัวเลขสรุป ---- */
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
  min-width: 150px;
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
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 10px;
  margin: 0;
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

.ledger .ledger__alert {
  color: var(--gs-danger);
}

/* ---- พื้นที่ทำงาน: ตาราง + รายละเอียด ---- */
.users__workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  align-items: start;
  gap: 16px;
}

.directory,
.detail {
  min-width: 0;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
}

.directory__tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--gs-line);
}

.directory__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid var(--gs-line-strong);
  border-radius: 999px;
  background: var(--gs-surface);
  color: var(--gs-ink-2);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.chip:hover {
  background: var(--gs-surface-sunken);
}

.chip[aria-pressed='true'] {
  border-color: var(--gs-action);
  background: var(--gs-action);
  color: #fff;
}

.directory__search {
  display: flex;
  flex: 0 1 300px;
  min-width: 200px;
  min-height: 40px;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface);
}

.directory__search:focus-within {
  border-color: var(--gs-action);
  box-shadow: var(--gs-focus);
}

.directory__search svg {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  fill: none;
  stroke: var(--gs-ink-2);
  stroke-linecap: round;
  stroke-width: 2;
}

.directory__search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--gs-ink);
  font: inherit;
  font-size: 15px;
}

.directory__search input::placeholder {
  color: var(--gs-muted);
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
  padding: 0 4px;
  border-bottom: 1px solid var(--gs-line);
  text-align: left;
  white-space: nowrap;
}

.sort {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  border: 0;
  border-radius: var(--gs-radius-sm);
  background: transparent;
  color: var(--gs-ink-2);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.sort:hover {
  color: var(--gs-ink);
}

.sort svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: var(--gs-line-strong);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.sort .sort__icon--active {
  stroke: var(--gs-action);
}

.sort .sort__icon--asc {
  transform: scaleY(-1);
}

.table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--gs-line);
  vertical-align: middle;
}

.table tbody tr:last-child td {
  border-bottom: 0;
}

.table tr.is-selected td {
  background: var(--gs-action-tint);
}

.user-cell {
  display: flex;
  width: 100%;
  min-width: 240px;
  min-height: 44px;
  align-items: center;
  gap: 10px;
  padding: 4px;
  border: 0;
  border-radius: var(--gs-radius-sm);
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.user-cell:hover strong {
  color: var(--gs-action);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.user-cell__text {
  display: grid;
  min-width: 0;
}

.user-cell__text strong {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
}

.user-cell__text span {
  overflow: hidden;
  color: var(--gs-ink-2);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.avatar {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: var(--gs-action-tint);
  color: var(--gs-action);
  font-size: 14px;
  font-weight: 800;
}

.avatar--large {
  width: 52px;
  height: 52px;
  font-size: 18px;
}

.trust {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.trust__value {
  min-width: 28px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

/* ระดับ: ใช้ข้อความ + สี ไม่ใช้สีอย่างเดียว */
.level {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--gs-radius-sm);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.level--trusted {
  background: #e3f1e8;
  color: var(--gs-verified);
}

.level--active {
  background: var(--gs-action-tint);
  color: var(--gs-action);
}

.level--watchlist {
  background: var(--gs-pending-tint);
  color: var(--gs-pending);
}

.level--risk {
  background: var(--gs-danger-tint);
  color: var(--gs-danger-hover);
}

.level--unscored {
  background: var(--gs-surface-sunken);
  color: var(--gs-ink-2);
  box-shadow: inset 0 0 0 1px var(--gs-line);
}

.number {
  font-variant-numeric: tabular-nums;
}

.number--alert {
  color: var(--gs-danger-hover);
  font-weight: 800;
}

.muted {
  color: var(--gs-ink-2);
}

.table .muted {
  white-space: nowrap;
}

.empty {
  padding: 24px 16px;
  color: var(--gs-ink-2);
  text-align: center;
}

.directory__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid var(--gs-line);
  color: var(--gs-ink-2);
  font-size: 14px;
}

.pager {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ---- ปุ่ม ---- */
.button {
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface);
  color: var(--gs-action);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.button:hover:not(:disabled) {
  background: var(--gs-action-tint);
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.button:focus-visible,
.chip:focus-visible,
.sort:focus-visible,
.user-cell:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

/* ---- รายละเอียด ---- */
.detail {
  position: sticky;
  top: 0;
  display: grid;
  gap: 16px;
  padding: 20px;
}

.detail__head {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.detail__head > div {
  min-width: 0;
}

.detail__head h2 {
  margin: 0;
  overflow: hidden;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail__head p {
  margin: 0;
  overflow: hidden;
  color: var(--gs-ink-2);
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.facts {
  display: grid;
  margin: 0;
}

.facts > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-top: 1px solid var(--gs-line);
  font-size: 14px;
}

.facts dt {
  color: var(--gs-ink-2);
}

.facts dd {
  margin: 0;
  font-weight: 700;
  text-align: right;
}

.facts .facts__ok {
  color: var(--gs-verified);
}

.detail__section {
  display: grid;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--gs-line);
}

.detail__section h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
}

.detail__section .muted {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.score {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 8px;
  margin: 0;
  color: var(--gs-ink-2);
  font-size: 14px;
}

.score strong {
  color: var(--gs-ink);
  font-size: 28px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.meter {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--gs-surface-sunken);
}

.meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--gs-action);
}

.meter .meter--trusted {
  background: var(--gs-verified);
}

.meter .meter--watchlist {
  background: var(--gs-pending);
}

.meter .meter--risk {
  background: var(--gs-danger);
}

.breakdown {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}

.breakdown li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  font-size: 14px;
}

.breakdown b {
  font-variant-numeric: tabular-nums;
}

.breakdown .breakdown--positive {
  color: var(--gs-verified);
}

.breakdown .breakdown--negative {
  color: var(--gs-danger-hover);
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
  .users__workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .detail {
    position: static;
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

  .directory__search {
    flex: 1 1 100%;
  }

  .directory__footer {
    justify-content: center;
  }
}
</style>
