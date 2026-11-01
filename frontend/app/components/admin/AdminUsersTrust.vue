<script setup>
import { computed, ref } from 'vue'
import { formatRelativeTime } from '~/composables/useHomeDashboard'

const { t, locale } = useLocale()
const activeFilter = ref('all')
const keyword = ref('')
const selectedUserId = ref('u001')
const profileTab = ref('overview')
const actionNotice = ref('')

// ข้อความของตัวกรองอยู่ใน locales: usersTrust.filters.*
const filters = ['all', 'trusted', 'watchlist', 'risk']

// ข้อมูลตัวอย่าง: ชื่อคนเป็นข้อมูลจึงไม่แปล ส่วนระดับ/พื้นที่/กิจกรรมแยกตามภาษา
// levelKey -> usersTrust.levels.*, lastActivityMin = กี่นาทีที่แล้ว, joined = วันที่ ISO
const sampleUsers = [
  { id: 'u001', name: 'พิมพ์ชนก วัฒนากุล', email: 'pimchanok@example.com', initials: 'พว', trust: 92, levelKey: 'veryTrusted', tone: 'trusted', reports: 48, verified: 45, suspicious: 1, lastActivityMin: 12, joined: '2025-01-12', location: { th: 'เชียงใหม่, ประเทศไทย', en: 'Chiang Mai, Thailand' }, breakdown: [['verifiedReports', '+30', 'positive'], ['communityConfirmations', '+18', 'positive'], ['helpedOthers', '+12', 'positive'], ['locationConsistency', '+20', 'positive'], ['inaccurateReports', '-3', 'negative'], ['unusualBehavior', '-2', 'negative']], activity: [[{ th: 'รายงานไฟป่าใกล้ดอยสุเทพ', en: 'Reported a wildfire near Doi Suthep' }, 12, '/icons/Fire.svg'], [{ th: 'ยืนยันต้นไม้ล้มกีดขวางถนน', en: 'Confirmed a fallen tree blocking a road' }, 1440, '/icons/Environment.svg'], [{ th: 'รายงานน้ำท่วมบริเวณช้างคลาน', en: 'Reported flooding around Chang Khlan' }, 2880, '/icons/Flood.svg']] },
  { id: 'u002', name: 'ณัฐวุฒิ ศรีคำ', email: 'nattawut@example.com', initials: 'ณศ', trust: 76, levelKey: 'trusted', tone: 'trusted', reports: 27, verified: 24, suspicious: 2, lastActivityMin: 60, joined: '2025-02-08', location: { th: 'สันทราย, เชียงใหม่', en: 'San Sai, Chiang Mai' } },
  { id: 'u003', name: 'กัญญารัตน์ อินต๊ะ', email: 'kanyarat@example.com', initials: 'กอ', trust: 68, levelKey: 'normal', tone: 'active', reports: 18, verified: 14, suspicious: 1, lastActivityMin: 120, joined: '2025-02-21', location: { th: 'แม่ริม, เชียงใหม่', en: 'Mae Rim, Chiang Mai' } },
  { id: 'u004', name: 'ธีรภัทร แซ่ลี', email: 'teerapat@example.com', initials: 'ทล', trust: 55, levelKey: 'normal', tone: 'active', reports: 12, verified: 9, suspicious: 3, lastActivityMin: 180, joined: '2025-03-05', location: { th: 'เมืองเชียงใหม่', en: 'Mueang Chiang Mai' } },
  { id: 'u005', name: 'ณิชาภา สายใจ', email: 'nichapa@example.com', initials: 'นส', trust: 46, levelKey: 'watchlist', tone: 'watchlist', reports: 15, verified: 7, suspicious: 5, lastActivityMin: 300, joined: '2025-03-18', location: { th: 'หางดง, เชียงใหม่', en: 'Hang Dong, Chiang Mai' } },
  { id: 'u006', name: 'จักรพงษ์ คำแปง', email: 'jakrapong@example.com', initials: 'จค', trust: 38, levelKey: 'watchlist', tone: 'watchlist', reports: 10, verified: 4, suspicious: 6, lastActivityMin: 480, joined: '2025-04-02', location: { th: 'สารภี, เชียงใหม่', en: 'Saraphi, Chiang Mai' } },
  { id: 'u007', name: 'อรทัย ชัยวงศ์', email: 'orathai@example.com', initials: 'อช', trust: 24, levelKey: 'risk', tone: 'risk', reports: 22, verified: 3, suspicious: 12, lastActivityMin: 600, joined: '2025-04-12', location: { th: 'ดอยสะเก็ด, เชียงใหม่', en: 'Doi Saket, Chiang Mai' } },
  { id: 'u008', name: 'วรวิทย์ พูนผล', email: 'worawit@example.com', initials: 'วพ', trust: 81, levelKey: 'trusted', tone: 'trusted', reports: 31, verified: 28, suspicious: 2, lastActivityMin: 720, joined: '2025-04-30', location: { th: 'เชียงดาว, เชียงใหม่', en: 'Chiang Dao, Chiang Mai' } },
  { id: 'u009', name: 'ชลธิชา เมืองแก้ว', email: 'chonthicha@example.com', initials: 'ชม', trust: 60, levelKey: 'normal', tone: 'active', reports: 14, verified: 11, suspicious: 3, lastActivityMin: 1440, joined: '2025-05-09', location: { th: 'สันกำแพง, เชียงใหม่', en: 'San Kamphaeng, Chiang Mai' } },
  { id: 'u010', name: 'ภาคภูมิ ดีงาม', email: 'phakphum@example.com', initials: 'ภด', trust: 19, levelKey: 'risk', tone: 'risk', reports: 9, verified: 1, suspicious: 8, lastActivityMin: 1440, joined: '2025-05-19', location: { th: 'แม่แตง, เชียงใหม่', en: 'Mae Taeng, Chiang Mai' } },
]

const defaultBreakdown = [['verifiedReports', '+18', 'positive'], ['locationConsistency', '+12', 'positive'], ['inaccurateReports', '-1', 'negative']]
const minutesAgo = (minutes) => formatRelativeTime(new Date(Date.now() - minutes * 60_000), t)
const formatJoined = (isoDate) => new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'th-TH', { dateStyle: 'medium' }).format(new Date(isoDate))
const pick = (text) => text[locale.value] ?? text.th

// แปลงข้อมูลตัวอย่างเป็นข้อความตามภาษาที่เลือก (รูปแบบเดิมที่ template ใช้)
const users = computed(() => sampleUsers.map((user) => ({
  ...user,
  level: t(`usersTrust.levels.${user.levelKey}`),
  lastActivity: minutesAgo(user.lastActivityMin),
  joined: formatJoined(user.joined),
  location: pick(user.location),
  breakdown: (user.breakdown ?? defaultBreakdown).map(([key, value, tone]) => [t(`usersTrust.breakdown.${key}`), value, tone]),
  activity: user.activity
    ? user.activity.map(([text, minutes, icon]) => [pick(text), minutesAgo(minutes), icon])
    : [[t('usersTrust.defaultActivity.report'), minutesAgo(user.lastActivityMin), '/icons/Report.svg'], [t('usersTrust.defaultActivity.confirm'), minutesAgo(2880), '/icons/Selected.svg']],
})))

const selectedUser = computed(() => users.value.find((user) => user.id === selectedUserId.value) ?? users.value[0])
const filteredUsers = computed(() => {
  const term = keyword.value.trim().toLocaleLowerCase()
  return users.value.filter((user) => {
    const matchesFilter = activeFilter.value === 'all' || user.tone === activeFilter.value
    const raw = sampleUsers.find((item) => item.id === user.id)
    const searchable = `${user.name} ${user.email} ${raw.location.th} ${raw.location.en}`.toLocaleLowerCase()
    return matchesFilter && (!term || searchable.includes(term))
  })
})
const trustWidth = (score) => `${Math.max(4, Math.min(score, 100))}%`
const trustLabel = (score) => t(`usersTrust.trustLabel.${score >= 75 ? 'trusted' : score >= 50 ? 'building' : score >= 30 ? 'monitor' : 'review'}`)
const selectUser = (id) => { selectedUserId.value = id; actionNotice.value = '' }
const runAction = (action) => { actionNotice.value = t('usersTrust.sampleAction', { action, name: selectedUser.value.name }) }
const profileTabs = ['overview', 'reports', 'help', 'activity']
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

    <p class="users-trust__sample" role="status"><img src="/icons/Alert.svg"
        alt="">{{ t('usersTrust.sampleBanner') }}</p>
    <p v-if="actionNotice" class="users-trust__notice" role="status">{{ actionNotice }}<button type="button"
        :aria-label="t('adminDashboard.closeNotice')" @click="actionNotice = ''">×</button></p>

    <section class="users-trust__metrics" :aria-label="t('usersTrust.metricsLabel')">
      <article><img src="/icons/Users.svg" alt="">
        <div><strong>12,482</strong><span>{{ t('usersTrust.metrics.total') }}</span><small class="up">↑ 5% {{ t('usersTrust.metrics.fromLastMonth') }}</small></div>
      </article>
      <article><img src="/icons/Selected.svg" alt="">
        <div><strong>8,320</strong><span>{{ t('usersTrust.metrics.trusted') }}</span><small class="up">{{ t('usersTrust.metrics.shareOfAll', { value: 67 }) }}</small></div>
      </article>
      <article><img src="/icons/Alert.svg" alt="">
        <div><strong>1,942</strong><span>{{ t('status.pending') }}</span><small class="warn">{{ t('usersTrust.metrics.shareOfAll', { value: 16 }) }}</small></div>
      </article>
      <article><img src="/icons/Warning-Error.svg" alt="">
        <div><strong>320</strong><span>{{ t('usersTrust.metrics.risk') }}</span><small class="risk">{{ t('usersTrust.metrics.shareOfAll', { value: 3 }) }}</small></div>
      </article>
      <article><img src="/icons/Chart.svg" alt="">
        <div><strong>+12</strong><span>{{ t('usersTrust.metrics.newToday') }}</span><small class="up">{{ t('usersTrust.metrics.vsYesterday') }}</small></div>
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
          <table>
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
              <tr v-for="user in filteredUsers" :key="user.id" :class="{ selected: selectedUser.id === user.id }"
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
                    @click.stop="runAction(t('usersTrust.openActions', { name: user.name }))"><i></i><i></i><i></i></button></td>
              </tr>
              <tr v-if="!filteredUsers.length">
                <td colspan="8" class="directory__empty">{{ t('usersTrust.empty') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer class="directory__footer"><span>{{ t('usersTrust.showing', { shown: filteredUsers.length, total: users.length }) }}</span>
          <div :aria-label="t('usersTrust.pagination')"><button type="button" disabled>‹</button><button type="button"
              class="current">1</button><button type="button">2</button><button type="button">3</button><button
              type="button">›</button></div>
        </footer>
      </section>

      <aside class="profile" aria-labelledby="profile-title">
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
            <dt>{{ t('usersTrust.mainArea') }}</dt>
            <dd>{{ selectedUser.location }}</dd>
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
                v-for="item in selectedUser.breakdown"
                :key="item[0]"><span>{{ item[0] }}</span><b :class="item[2]">{{ item[1] }}</b></li>
            </ul>
          </section>
          <section class="profile__activity">
            <header>
              <h3>{{ t('usersTrust.th.lastActivity') }}</h3><button type="button" @click="profileTab = 'activity'">{{ t('common.viewAll') }}</button>
            </header>
            <ul>
              <li
                v-for="item in selectedUser.activity"
                :key="item[0]"><img :src="item[2]" alt=""><span>{{ item[0] }}<small>{{ item[1] }}</small></span></li>
            </ul>
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
