<script setup>
import { computed, ref, watch } from 'vue'
import { formatRelativeTime } from '~/composables/useHomeDashboard'

// ข้อมูลมาจากหน้า pages/admin/users.vue (ดึงจาก GET /users ผ่าน useAdminUsers)
const props = defineProps({
  users: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  // key ของข้อความ error ในไฟล์ภาษา ('' = ไม่มี error)
  errorKey: { type: String, default: '' },
})

const emit = defineEmits(['retry'])

const { t, locale } = useLocale()
const activeFilter = ref('all')
const keyword = ref('')
const selectedUserId = ref(null)
const profileTab = ref('overview')
const actionNotice = ref('')
const currentPage = ref(1)

const PAGE_SIZE = 10
const DAY_MS = 24 * 60 * 60 * 1000

// ข้อความของตัวกรองอยู่ใน locales: usersTrust.filters.*
const filters = ['all', 'trusted', 'watchlist', 'risk']
const profileTabs = ['overview', 'reports', 'help', 'activity']

// ---- จัดรูปแบบข้อความ ----

const formatJoined = (isoDate) => {
  let dateLocale = 'th-TH'
  if (locale.value === 'en') {
    dateLocale = 'en-GB'
  }
  return new Intl.DateTimeFormat(dateLocale, { dateStyle: 'medium' }).format(new Date(isoDate))
}

// กิจกรรมล่าสุด = เวลาที่ส่งรายงานล่าสุด (ยังไม่มีข้อมูลการเข้าสู่ระบบในฐานข้อมูล)
const formatLastActivity = (user) => {
  if (!user.lastReportAt) {
    return t('usersTrust.noActivity')
  }
  return formatRelativeTime(user.lastReportAt, t)
}

// เพิ่มข้อความตามภาษาที่เลือกให้ผู้ใช้แต่ละคน
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

// ---- ตัวเลขสรุปด้านบน (คำนวณจากรายชื่อจริง) ----

const sharePercent = (count) => {
  if (users.value.length === 0) {
    return 0
  }
  return Math.round((count / users.value.length) * 100)
}

const countUsers = (check) => {
  let count = 0
  for (const user of users.value) {
    if (check(user)) {
      count = count + 1
    }
  }
  return count
}

const metrics = computed(() => {
  const now = Date.now()
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  let totalReports = 0
  for (const user of users.value) {
    totalReports = totalReports + user.reports
  }

  return {
    total: users.value.length,
    newLast7Days: countUsers((user) => now - new Date(user.createdAt).getTime() < 7 * DAY_MS),
    trusted: countUsers((user) => user.tone === 'trusted'),
    unverified: countUsers((user) => !user.emailVerified),
    risk: countUsers((user) => user.tone === 'risk'),
    newToday: countUsers((user) => new Date(user.createdAt) >= startOfToday),
    totalReports,
  }
})

// ---- ค้นหา กรอง และแบ่งหน้า ----

const matchesKeyword = (user, term) => {
  if (!term) {
    return true
  }
  const searchable = `${user.name} ${user.email} ${user.phone ?? ''}`.toLocaleLowerCase()
  return searchable.includes(term)
}

const filteredUsers = computed(() => {
  const term = keyword.value.trim().toLocaleLowerCase()
  return users.value.filter((user) => {
    const matchesFilter = activeFilter.value === 'all' || user.tone === activeFilter.value
    return matchesFilter && matchesKeyword(user, term)
  })
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

// เปลี่ยนตัวกรองหรือคำค้นหาแล้วกลับไปหน้าแรก
watch([activeFilter, keyword], () => {
  currentPage.value = 1
})

const goToPage = (page) => {
  if (page < 1 || page > pageCount.value) {
    return
  }
  currentPage.value = page
}

// ---- ผู้ใช้ที่เลือกดูรายละเอียด (ยังไม่เลือก = คนแรกในรายการ) ----

const selectedUser = computed(() => {
  const found = users.value.find((user) => user.id === selectedUserId.value)
  if (found) {
    return found
  }
  return users.value[0] ?? null
})

const selectUser = (id) => {
  selectedUserId.value = id
  actionNotice.value = ''
}

// ที่มาของคะแนน: ใช้จำนวนรายงานจริงของผู้ใช้ [ข้อความ, จำนวน, สี]
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

const trustLabel = (score) => {
  let key = 'review'
  if (score >= 75) {
    key = 'trusted'
  } else if (score >= 50) {
    key = 'building'
  } else if (score >= 30) {
    key = 'monitor'
  }
  return t(`usersTrust.trustLabel.${key}`)
}

// ปุ่มคำสั่ง (เฝ้าระวัง/จำกัด/ระงับ) ยังเป็นตัวอย่าง ยังไม่มี API
const runAction = (action) => {
  actionNotice.value = t('usersTrust.sampleAction', { action, name: selectedUser.value.name })
}

// ปุ่ม ⋯ ท้ายแถว: เลือกผู้ใช้คนนั้น แล้วแจ้งว่าคำสั่งยังเป็นตัวอย่าง
const openRowActions = (user) => {
  selectUser(user.id)
  runAction(t('usersTrust.openActions', { name: user.name }))
}
</script>

<template>
  <section class="users-trust" aria-labelledby="users-trust-title">
    <header class="users-trust__heading">
      <div>
        <h1 id="users-trust-title">{{ t('admin.menu.users') }}</h1>
        <p>{{ t('usersTrust.subtitle') }}</p>
      </div>
      <button type="button" class="users-trust__export"
        @click="actionNotice = t('usersTrust.exportNotice')">
        <img src="/icons/Download.svg" alt="">{{ t('usersTrust.export') }}
      </button>
    </header>

    <!-- รายชื่อและตัวเลขเป็นข้อมูลจริง เหลือแค่ปุ่มคำสั่งที่ยังเป็นตัวอย่าง -->
    <p class="users-trust__sample"><img src="/icons/Alert.svg" alt="">{{ t('usersTrust.actionsSample') }}</p>
    <p v-if="actionNotice" class="users-trust__notice" role="status">{{ actionNotice }}<button type="button"
        :aria-label="t('adminDashboard.closeNotice')" @click="actionNotice = ''">×</button></p>

    <!-- โหลดไม่สำเร็จ -->
    <div v-if="errorKey" class="users-trust__error" role="alert">
      <span>{{ t(errorKey) }}</span>
      <button type="button" @click="emit('retry')">{{ t('usersTrust.retry') }}</button>
    </div>

    <section class="users-trust__metrics" :aria-label="t('usersTrust.metricsLabel')" :aria-busy="isLoading">
      <article><img src="/icons/Users.svg" alt="">
        <div><strong>{{ metrics.total }}</strong><span>{{ t('usersTrust.metrics.total') }}</span><small class="up">{{ t('usersTrust.metrics.newLast7Days', { count: metrics.newLast7Days }) }}</small></div>
      </article>
      <article><img src="/icons/Selected.svg" alt="">
        <div><strong>{{ metrics.trusted }}</strong><span>{{ t('usersTrust.metrics.trusted') }}</span><small class="up">{{ t('usersTrust.metrics.shareOfAll', { value: sharePercent(metrics.trusted) }) }}</small></div>
      </article>
      <article><img src="/icons/Alert.svg" alt="">
        <div><strong>{{ metrics.unverified }}</strong><span>{{ t('usersTrust.metrics.unverified') }}</span><small class="warn">{{ t('usersTrust.metrics.shareOfAll', { value: sharePercent(metrics.unverified) }) }}</small></div>
      </article>
      <article><img src="/icons/Warning-Error.svg" alt="">
        <div><strong>{{ metrics.risk }}</strong><span>{{ t('usersTrust.metrics.risk') }}</span><small class="risk">{{ t('usersTrust.metrics.shareOfAll', { value: sharePercent(metrics.risk) }) }}</small></div>
      </article>
      <article><img src="/icons/Chart.svg" alt="">
        <div><strong>{{ metrics.newToday }}</strong><span>{{ t('usersTrust.metrics.newToday') }}</span><small class="up">{{ t('usersTrust.metrics.reportsTotal', { count: metrics.totalReports }) }}</small></div>
      </article>
    </section>

    <div class="users-trust__workspace">
      <section class="directory" aria-labelledby="directory-title">
        <header class="directory__tools">
          <h2 id="directory-title" class="sr-only">{{ t('usersTrust.directory') }}</h2>
          <div class="directory__filters" role="tablist" :aria-label="t('usersTrust.filterLabel')">
            <button v-for="filter in filters" :key="filter" type="button"
              :class="{ active: activeFilter === filter }" :aria-selected="activeFilter === filter" role="tab"
              @click="activeFilter = filter">
              {{ t(`usersTrust.filters.${filter}`) }}<span v-if="filter === 'all'"> ({{ users.length }})</span>
            </button>
          </div>
          <label class="directory__search"><img src="/icons/Search.svg" alt=""><span class="sr-only">{{ t('usersTrust.searchLabel') }}</span><input
              v-model="keyword" type="search" :placeholder="t('usersTrust.searchPlaceholder')"></label>
        </header>

        <div class="directory__table-wrap">
          <table :aria-busy="isLoading">
            <thead>
              <tr>
                <th scope="col">{{ t('usersTrust.th.user') }}</th>
                <th scope="col">{{ t('usersTrust.th.trust') }}</th>
                <th scope="col">{{ t('usersTrust.th.level') }}</th>
                <th scope="col">{{ t('usersTrust.th.reports') }}</th>
                <th scope="col">{{ t('usersTrust.th.verified') }}</th>
                <th scope="col">{{ t('usersTrust.th.suspicious') }}</th>
                <th scope="col">{{ t('usersTrust.th.lastActivity') }}</th>
                <th scope="col"><span class="sr-only">{{ t('usersTrust.th.actions') }}</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="8" class="directory__empty">{{ t('usersTrust.loading') }}</td>
              </tr>
              <template v-else>
                <tr v-for="user in pagedUsers" :key="user.id" :class="{ selected: selectedUser?.id === user.id }"
                  tabindex="0" @click="selectUser(user.id)" @keydown.enter="selectUser(user.id)">
                  <td>
                    <div class="user-cell"><span class="user-cell__avatar">{{ user.initials }}</span><span><b>{{ user.name
                          }}</b><small>{{ user.email }}</small></span></div>
                  </td>
                  <td>
                    <div class="trust-cell"><b>{{ user.trust }}</b><span><i :class="`tone-${user.tone}`"
                          :style="{ width: trustWidth(user.trust) }"></i></span></div>
                  </td>
                  <td><span :class="`level level--${user.tone}`">{{ user.level }}</span></td>
                  <td>{{ user.reports }}</td>
                  <td class="number-positive">{{ user.verified }}</td>
                  <td :class="{ 'number-risk': user.suspicious > 2 }">{{ user.suspicious }}</td>
                  <td>{{ user.lastActivity }}</td>
                  <td><button type="button" class="row-menu" :aria-label="t('usersTrust.rowActions', { name: user.name })"
                      @click.stop="openRowActions(user)"><i></i><i></i><i></i></button></td>
                </tr>
                <tr v-if="!filteredUsers.length && !errorKey">
                  <td colspan="8" class="directory__empty">{{ t('usersTrust.empty') }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <footer class="directory__footer"><span>{{ t('usersTrust.showing', { shown: pagedUsers.length, total: filteredUsers.length }) }}</span>
          <div :aria-label="t('usersTrust.pagination')">
            <button type="button" :disabled="currentPage === 1" :aria-label="t('usersTrust.previousPage')" @click="goToPage(currentPage - 1)">‹</button>
            <button v-for="page in pageCount" :key="page" type="button" :class="{ current: page === currentPage }"
              :aria-label="t('usersTrust.pageLabel', { page })" :aria-current="page === currentPage ? 'page' : undefined"
              @click="goToPage(page)">{{ page }}</button>
            <button type="button" :disabled="currentPage === pageCount" :aria-label="t('usersTrust.nextPage')" @click="goToPage(currentPage + 1)">›</button>
          </div>
        </footer>
      </section>

      <aside v-if="selectedUser" class="profile" aria-labelledby="profile-title">
        <header class="profile__header">
          <span class="profile__avatar">{{ selectedUser.initials }}</span>
          <div>
            <h2 id="profile-title">{{ selectedUser.name }}</h2>
            <p>{{ selectedUser.email }}</p><span :class="`level level--${selectedUser.tone}`">{{ selectedUser.level
              }}</span>
          </div>
        </header>
        <dl class="profile__facts">
          <div>
            <dt>{{ t('usersTrust.joined') }}</dt>
            <dd>{{ selectedUser.joined }}</dd>
          </div>
          <div>
            <dt>{{ t('usersTrust.role') }}</dt>
            <dd>{{ roleLabel(selectedUser.role) }}</dd>
          </div>
          <div>
            <dt>{{ t('usersTrust.emailStatus') }}</dt>
            <dd :class="{ 'number-positive': selectedUser.emailVerified }">
              {{ selectedUser.emailVerified ? t('usersTrust.emailVerified') : t('usersTrust.emailUnverified') }}
            </dd>
          </div>
          <div>
            <dt>{{ t('usersTrust.phone') }}</dt>
            <dd>{{ selectedUser.phone || t('usersTrust.notSet') }}</dd>
          </div>
        </dl>
        <nav class="profile__tabs" :aria-label="t('usersTrust.profileLabel')"><button
            v-for="tab in profileTabs"
            :key="tab" type="button" :class="{ active: profileTab === tab }" @click="profileTab = tab">{{
            t(`usersTrust.tabs.${tab}`) }}</button></nav>

        <template v-if="profileTab === 'overview'">
          <section class="profile__score">
            <h3>{{ t('usersTrust.th.trust') }}</h3>
            <p><strong>{{ selectedUser.trust }}</strong><span>/ 100</span></p>
            <div><i :class="`tone-${selectedUser.tone}`" :style="{ width: trustWidth(selectedUser.trust) }"></i></div>
            <b>{{ trustLabel(selectedUser.trust)
              }}</b><small>{{ t('usersTrust.scoreHint') }}</small>
          </section>
          <section class="profile__breakdown">
            <h3>{{ t('usersTrust.scoreSources') }}</h3>
            <ul>
              <li
                v-for="item in selectedBreakdown"
                :key="item[0]"><span>{{ item[0] }}</span><b :class="item[2]">{{ item[1] }}</b></li>
            </ul>
          </section>
          <section class="profile__activity">
            <header>
              <h3>{{ t('usersTrust.th.lastActivity') }}</h3>
            </header>
            <ul v-if="selectedUser.lastReportAt">
              <li><img src="/icons/Report.svg" alt=""><span>{{ t('usersTrust.lastReport') }}<small>{{ selectedUser.lastActivity }}</small></span></li>
            </ul>
            <p v-else class="profile__placeholder">{{ t('usersTrust.noReports') }}</p>
          </section>
        </template>
        <p v-else class="profile__placeholder">{{ t('usersTrust.tabPlaceholder', { tab: t(`usersTrust.tabs.${profileTab}`) }) }}</p>
        <footer class="profile__actions"><button type="button"
            @click="runAction(t('usersTrust.actions.watchlistAdd'))">{{ t('usersTrust.actions.watchlist') }}</button><button type="button"
            @click="runAction(t('usersTrust.actions.restrict'))">{{ t('usersTrust.actions.restrict') }}</button><button type="button"
            @click="runAction(t('usersTrust.actions.suspend'))">{{ t('usersTrust.actions.suspend') }}</button></footer>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.users-trust__error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 16px;
  padding: 12px 14px;
  border: 1px solid #efc2c0;
  border-radius: 8px;
  background: #fbeceb;
  color: #a51f24;
  font-weight: 700;
}

.users-trust__error button {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid #a51f24;
  border-radius: 6px;
  background: #fff;
  color: #a51f24;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.users-trust {
  color: #14235f
}

.users-trust__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1rem
}

.users-trust__heading h1 {
  margin: 0;
  font-size: clamp(1.65rem, 2.4vw, 2.35rem);
  letter-spacing: -.035em;
  line-height: 1.1
}

.users-trust__heading p {
  margin: .4rem 0 0;
  color: #52659a
}

.users-trust__export {
  display: inline-flex;
  align-items: center;
  gap: .55rem;
  min-height: 2.8rem;
  padding: 0 1rem;
  border: 0;
  border-radius: .55rem;
  background: #4267ed;
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 .5rem 1.25rem rgba(50, 92, 210, .2)
}

.users-trust__export img {
  width: 1.1rem;
  filter: brightness(0) invert(1)
}

.users-trust__sample,
.users-trust__notice {
  display: flex;
  align-items: center;
  gap: .45rem;
  margin: 0 0 1rem;
  padding: .7rem .85rem;
  border: 1px solid #f3dfaa;
  border-radius: .5rem;
  background: #fff9e8;
  color: #7d5a04;
  font-size: .86rem
}

.users-trust__sample img {
  width: 1rem
}

.users-trust__notice {
  border-color: #cbd8fd;
  background: #f3f6ff;
  color: #254ea7
}

.users-trust__notice button {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 1.2rem;
  cursor: pointer
}

.users-trust__metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: .65rem;
  margin-bottom: 1rem
}

.users-trust__metrics article {
  display: flex;
  gap: .7rem;
  align-items: flex-start;
  padding: 1rem .85rem;
  border: 1px solid #e1e8f6;
  border-radius: .65rem;
  background: #fff;
  box-shadow: 0 .45rem 1.25rem rgba(37, 68, 130, .06)
}

.users-trust__metrics img {
  width: 2rem;
  height: 2rem;
  padding: .4rem;
  border-radius: .55rem;
  background: #f1f5ff
}

.users-trust__metrics strong,
.users-trust__metrics span,
.users-trust__metrics small {
  display: block
}

.users-trust__metrics strong {
  font-size: 1.1rem;
  line-height: 1
}

.users-trust__metrics span {
  margin-top: .2rem;
  color: #53679f;
  font-size: .76rem
}

.users-trust__metrics small {
  margin-top: .45rem;
  font-size: .72rem
}

.up,
.positive {
  color: #24975c
}

.warn {
  color: #cf8010
}

.risk,
.negative {
  color: #dc3d40
}

.users-trust__workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(19rem, .8fr);
  gap: 1rem;
  align-items: start
}

.directory,
.profile {
  border: 1px solid #e1e8f6;
  border-radius: .7rem;
  background: #fff;
  box-shadow: 0 .5rem 1.4rem rgba(37, 68, 130, .06)
}

.directory {
  overflow: hidden
}

.directory__tools {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .75rem;
  border-bottom: 1px solid #e7edf8
}

.directory__filters {
  display: flex;
  gap: .35rem;
  flex: 1
}

.directory__filters button,
.profile__tabs button {
  border: 0;
  border-radius: .45rem;
  background: #f2f5fb;
  color: #29427f;
  font: inherit;
  font-size: .77rem;
  cursor: pointer
}

.directory__filters button {
  padding: .58rem .66rem
}

.directory__filters button.active {
  background: #4267ed;
  color: #fff;
  box-shadow: 0 .25rem .75rem rgba(66, 103, 237, .22)
}

.directory__search {
  display: flex;
  align-items: center;
  gap: .4rem;
  min-width: 12.5rem;
  padding: 0 .6rem;
  border: 1px solid #dce6f7;
  border-radius: .45rem;
  background: #fff
}

.directory__search img {
  width: .95rem
}

.directory__search input {
  width: 100%;
  min-height: 2.1rem;
  border: 0;
  outline: 0;
  color: #14235f;
  font: inherit;
  font-size: .75rem
}

.directory__table-wrap {
  overflow-x: auto
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 49rem;
  font-size: .76rem
}

th {
  text-align: left;
  padding: .75rem .8rem;
  color: #3e5188;
  font-size: .68rem;
  font-weight: 700;
  white-space: nowrap;
  background: #f9fbff
}

td {
  padding: .58rem .8rem;
  border-top: 1px solid #edf1f8;
  color: #455a91;
  white-space: nowrap
}

tbody tr {
  cursor: pointer;
  transition: background .18s ease
}

tbody tr:hover,
tbody tr.selected {
  background: #f5f8ff
}

tbody tr:focus-visible {
  outline: 2px solid #4267ed;
  outline-offset: -2px
}

.user-cell {
  display: flex;
  align-items: center;
  gap: .5rem
}

.user-cell__avatar,
.profile__avatar {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #e8eefc;
  color: #3658b4;
  font-weight: 800
}

.user-cell__avatar {
  width: 2rem;
  height: 2rem;
  font-size: .62rem
}

.user-cell b,
.user-cell small {
  display: block
}

.user-cell b {
  color: #172966
}

.user-cell small {
  margin-top: .16rem;
  color: #7182af;
  font-size: .65rem
}

.trust-cell {
  display: grid;
  grid-template-columns: 1.5rem 1fr;
  align-items: center;
  gap: .35rem
}

.trust-cell b {
  color: #1c3070
}

.trust-cell span,
.profile__score>div {
  display: block;
  height: .5rem;
  overflow: hidden;
  border-radius: 10rem;
  background: #e9eef9
}

.trust-cell i,
.profile__score i {
  display: block;
  height: 100%;
  border-radius: inherit
}

.tone-trusted {
  background: #51bf69
}

.tone-active {
  background: #4d76ed
}

.tone-watchlist {
  background: #eba538
}

.tone-risk {
  background: #e65252
}

.level {
  display: inline-block;
  padding: .32rem .48rem;
  border-radius: .35rem;
  font-size: .68rem;
  font-weight: 700
}

.level--trusted {
  background: #e9f9ec;
  color: #2a9653
}

.level--active {
  background: #edf3ff;
  color: #4169d5
}

.level--watchlist {
  background: #fff6dc;
  color: #ad6d08
}

.level--risk {
  background: #fff0f0;
  color: #db4141
}

.number-positive {
  color: #219759
}

.number-risk {
  color: #dd3b40
}

.row-menu {
  display: inline-flex;
  gap: .16rem;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.9rem;
  border: 1px solid #dfe7f5;
  border-radius: .4rem;
  background: #fff;
  cursor: pointer
}

.row-menu i {
  width: .16rem;
  height: .16rem;
  border-radius: 50%;
  background: #223875
}

.directory__empty {
  text-align: center;
  padding: 2rem
}

.directory__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: .75rem .9rem;
  color: #52669b;
  font-size: .75rem
}

.directory__footer div {
  display: flex;
  gap: .25rem
}

.directory__footer button {
  width: 1.85rem;
  height: 1.85rem;
  border: 1px solid #dce5f5;
  border-radius: .35rem;
  background: #fff;
  color: #213a7d;
  cursor: pointer
}

.directory__footer button.current {
  border-color: #4267ed;
  background: #4267ed;
  color: #fff
}

.directory__footer button:disabled {
  opacity: .45;
  cursor: not-allowed
}

.profile {
  overflow: hidden
}

.profile__header {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: 1rem
}

.profile__avatar {
  width: 4rem;
  height: 4rem;
  background: #e3e9f6;
  font-size: 1rem
}

.profile__header h2 {
  margin: 0;
  color: #132562;
  font-size: 1rem
}

.profile__header p {
  margin: .18rem 0 .45rem;
  color: #6679aa;
  font-size: .72rem
}

.profile__facts {
  display: grid;
  gap: .5rem;
  margin: 0;
  padding: 0 1rem 1rem;
  color: #52669b;
  font-size: .72rem
}

.profile__facts div {
  display: flex;
  justify-content: space-between;
  gap: .75rem
}

.profile__facts dt {
  color: #7182ae
}

.profile__facts dd {
  margin: 0;
  text-align: right;
  color: #3c5189
}

.profile__tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid #e9eef8;
  border-bottom: 1px solid #e9eef8
}

.profile__tabs button {
  padding: .72rem .2rem;
  border-radius: 0;
  background: #fff;
  font-size: .67rem
}

.profile__tabs button.active {
  color: #4267ed;
  box-shadow: inset 0 -2px #4267ed
}

.profile__score,
.profile__breakdown,
.profile__activity {
  padding: .9rem 1rem;
  border-bottom: 1px solid #e9eef8
}

.profile h3 {
  margin: 0;
  color: #1c3070;
  font-size: .86rem
}

.profile__score p {
  display: flex;
  align-items: baseline;
  gap: .25rem;
  margin: .45rem 0
}

.profile__score strong {
  color: #329658;
  font-size: 2rem;
  line-height: 1
}

.profile__score p span {
  color: #52669b
}

.profile__score>b {
  display: block;
  margin-top: .5rem;
  color: #2f9657;
  font-size: .8rem
}

.profile__score small {
  display: block;
  margin-top: .28rem;
  color: #576a9d;
  font-size: .7rem;
  line-height: 1.35
}

.profile__breakdown ul,
.profile__activity ul {
  margin: .6rem 0 0;
  padding: 0;
  list-style: none
}

.profile__breakdown li {
  display: flex;
  justify-content: space-between;
  gap: .5rem;
  padding: .36rem 0;
  border-bottom: 1px solid #f0f3fa;
  color: #53679a;
  font-size: .72rem
}

.profile__breakdown li:last-child {
  border-bottom: 0
}

.profile__activity header {
  display: flex;
  align-items: center;
  justify-content: space-between
}

.profile__activity header button {
  border: 0;
  background: transparent;
  color: #4267ed;
  font: inherit;
  font-size: .72rem;
  cursor: pointer
}

.profile__activity li {
  display: flex;
  gap: .45rem;
  align-items: flex-start;
  padding: .42rem 0;
  color: #2a407d;
  font-size: .72rem
}

.profile__activity li img {
  width: 1.25rem;
  height: 1.25rem;
  padding: .18rem;
  border-radius: 50%;
  background: #edf2ff
}

.profile__activity li span,
.profile__activity li small {
  display: block
}

.profile__activity li small {
  margin-top: .12rem;
  color: #7182ad;
  font-size: .65rem
}

.profile__placeholder {
  min-height: 11rem;
  margin: 0;
  padding: 1rem;
  color: #6578a9;
  font-size: .78rem;
  line-height: 1.5
}

.profile__actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .4rem;
  padding: 1rem
}

.profile__actions button {
  min-height: 2.2rem;
  border: 1px solid #efbe4d;
  border-radius: .4rem;
  background: #fffdf5;
  color: #9c650a;
  font: inherit;
  font-size: .68rem;
  font-weight: 700;
  cursor: pointer
}

.profile__actions button:nth-child(2) {
  border-color: #eb873b;
  background: #ee7a34;
  color: #fff
}

.profile__actions button:nth-child(3) {
  border-color: #dc4040;
  background: #dc4040;
  color: #fff
}

.users-trust button:focus-visible,
.users-trust input:focus-visible {
  outline: 2px solid #4267ed;
  outline-offset: 2px
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0
}

@media (max-width:78rem) {
  .users-trust__metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr))
  }

  .users-trust__workspace {
    grid-template-columns: 1fr
  }

  .profile {
    display: grid;
    grid-template-columns: 1fr 1fr
  }

  .profile__header,
  .profile__facts,
  .profile__tabs,
  .profile__actions {
    grid-column: 1/-1
  }

  .profile__score,
  .profile__breakdown,
  .profile__activity {
    border-bottom: 0
  }

  .profile__activity {
    border-left: 1px solid #e9eef8
  }
}

@media (max-width:46rem) {
  .users-trust__heading {
    align-items: stretch;
    flex-direction: column
  }

  .users-trust__export {
    justify-content: center
  }

  .users-trust__metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr))
  }

  .directory__tools {
    align-items: stretch;
    flex-direction: column
  }

  .directory__filters {
    overflow-x: auto;
    padding-bottom: .15rem
  }

  .directory__filters button {
    white-space: nowrap
  }

  .directory__search {
    min-width: 0
  }

  .profile {
    display: block
  }

  .profile__activity {
    border-top: 1px solid #e9eef8;
    border-left: 0
  }
}

@media (max-width:30rem) {
  .users-trust__metrics {
    grid-template-columns: 1fr
  }

  .directory__footer {
    align-items: flex-start;
    gap: .5rem;
    flex-direction: column
  }
}
</style>
