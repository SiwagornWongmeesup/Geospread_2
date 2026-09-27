<script setup>
definePageMeta({
  layout: false,
  middleware: ['admin'],
})

const {
  queue,
  incidentTypes,
  isLoading,
  activeAction,
  error,
  notice,
  totalPending,
  load,
  reviewCandidate,
  reviewCandidateGroup,
  createFromPendingReport,
  rejectPendingReport,
} = useAdminReview()

const groupTypeSelections = ref({})
const pendingTypeSelections = ref({})
const expandedGroups = ref({})
const { getUser, logout } = useAuth()

const userDisplayName = computed(() => {
  const user = getUser()?.user ?? getUser()
  return user?.name || user?.email || 'ผู้ดูแลระบบ'
})

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : 'ไม่ระบุเวลา'

const coordinates = (lat, lng) => [lat, lng].every(Number.isFinite)
  ? `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`
  : 'ไม่ระบุตำแหน่ง'

const isSaving = (key) => activeAction.value === key
const groupSelection = (group) => groupTypeSelections.value[group.candidate_group_id] ?? ''
const pendingSelection = (report) => pendingTypeSelections.value[report.report_id] ?? ''

const submitGroup = (group) => {
  const typeId = groupSelection(group)
  if (!typeId) {
    error.value = 'กรุณาเลือกประเภทเหตุการณ์ก่อนยืนยันกลุ่มรายงาน'
    return
  }
  void reviewCandidateGroup({ candidateGroupId: group.candidate_group_id, action: 'accept', typeId })
}

const submitPending = (report) => {
  const typeId = pendingSelection(report)
  if (!typeId) {
    error.value = 'กรุณาเลือกประเภทเหตุการณ์ก่อนยืนยันรายงาน'
    return
  }
  void createFromPendingReport({ reportId: report.report_id, typeId })
}

const toggleGroup = (groupId) => {
  expandedGroups.value[groupId] = !expandedGroups.value[groupId]
}

onMounted(load)
</script>

<template>
  <main class="admin-shell">
    <header class="admin-header">
      <NuxtLink to="/" class="admin-brand" aria-label="กลับสู่ GeoSpread">
        <img src="/logo.png" alt="" />
        <span>GeoSpread</span>
      </NuxtLink>

      <div class="admin-header__tools">
        <span class="admin-role">ผู้ดูแลระบบ</span>
        <span class="admin-user">{{ userDisplayName }}</span>
        <button type="button" class="text-button" @click="logout">ออกจากระบบ</button>
      </div>
    </header>

    <section class="admin-page" aria-labelledby="admin-title">
      <header class="admin-page__intro">
        <div>
          <h1 id="admin-title">ตรวจสอบรายงาน</h1>
          <p>ตัดสินใจจากรายละเอียด จุดเกิดเหตุ และประเภทที่ระบบหรือผู้แจ้งระบุ</p>
        </div>
        <div class="queue-total" :aria-label="`คิวรอตรวจสอบ ${totalPending} รายการ`">
          <strong>{{ totalPending }}</strong>
          <span>รายการรอตรวจสอบ</span>
        </div>
      </header>

      <section v-if="error" class="feedback feedback--error" role="alert">
        <span>{{ error }}</span>
        <button type="button" @click="load">ลองใหม่</button>
      </section>
      <p v-if="notice" class="feedback feedback--success" role="status">{{ notice }}</p>

      <section v-if="isLoading" class="loading-state" aria-live="polite">
        <span class="loading-state__spinner" aria-hidden="true" />
        กำลังโหลดคิวตรวจสอบ…
      </section>

      <template v-else>
        <section v-if="!totalPending" class="empty-state">
          <div class="empty-state__mark" aria-hidden="true">✓</div>
          <h2>คิวว่างแล้ว</h2>
          <p>ไม่มีรายงานที่ต้องตรวจสอบในขณะนี้</p>
          <button type="button" class="secondary-button" @click="load">รีเฟรชคิว</button>
        </section>

        <section v-if="queue.report_candidates.length" class="review-section" aria-labelledby="candidate-title">
          <div class="review-section__heading">
            <div>
              <h2 id="candidate-title">รายงานที่อาจซ้ำกับเหตุการณ์เดิม</h2>
              <p>ยืนยันเมื่อตรงกับเหตุการณ์เป้าหมาย หรือปฏิเสธเพื่อไม่รวมรายงานนี้</p>
            </div>
            <span>{{ queue.report_candidates.length }}</span>
          </div>

          <article v-for="item in queue.report_candidates" :key="item.candidate_id" class="review-card">
            <div class="review-card__main">
              <span class="record-id">รายงาน #{{ item.report_id }}</span>
              <p class="report-description">{{ item.description }}</p>
              <dl class="details-grid">
                <div><dt>เหตุการณ์เป้าหมาย</dt><dd>{{ item.target_title || `#${item.target_incident_id}` }}</dd></div>
                <div><dt>ประเภทเป้าหมาย</dt><dd>{{ item.target_type_name || 'ยังไม่ระบุ' }}</dd></div>
                <div><dt>ระยะห่าง</dt><dd>{{ Math.round(item.distance_m) }} เมตร</dd></div>
                <div><dt>ต่างเวลา</dt><dd>{{ Math.round(item.time_difference_minutes) }} นาที</dd></div>
                <div><dt>พิกัดรายงาน</dt><dd>{{ coordinates(item.report_lat, item.report_lng) }}</dd></div>
                <div><dt>ส่งเมื่อ</dt><dd>{{ formatDate(item.report_created_at) }}</dd></div>
              </dl>
            </div>
            <div class="review-card__actions">
              <button type="button" class="secondary-button" :disabled="isSaving(`candidate-${item.candidate_id}-reject`)" @click="reviewCandidate({ candidateId: item.candidate_id, action: 'reject' })">
                {{ isSaving(`candidate-${item.candidate_id}-reject`) ? 'กำลังบันทึก…' : 'ไม่รวมรายงาน' }}
              </button>
              <button type="button" class="primary-button" :disabled="isSaving(`candidate-${item.candidate_id}-accept`)" @click="reviewCandidate({ candidateId: item.candidate_id, action: 'accept' })">
                {{ isSaving(`candidate-${item.candidate_id}-accept`) ? 'กำลังบันทึก…' : 'ยืนยันการรวม' }}
              </button>
            </div>
          </article>
        </section>

        <section v-if="queue.candidate_groups.length" class="review-section" aria-labelledby="group-title">
          <div class="review-section__heading">
            <div>
              <h2 id="group-title">กลุ่มรายงานที่อาจเป็นเหตุการณ์เดียวกัน</h2>
              <p>เลือกประเภทที่ถูกต้องเพื่อให้ระบบสร้างหรือรวมเหตุการณ์อย่างเหมาะสม</p>
            </div>
            <span>{{ queue.candidate_groups.length }}</span>
          </div>

          <article v-for="group in queue.candidate_groups" :key="group.candidate_group_id" class="review-card review-card--group">
            <div class="review-card__main">
              <span class="record-id">กลุ่ม #{{ group.candidate_group_id }} · {{ group.reports.length }} รายงาน</span>
              <p class="report-description">{{ group.reports[0]?.description || 'ไม่มีรายละเอียด' }}</p>
              <p class="supporting-copy">เริ่มสร้างกลุ่มเมื่อ {{ formatDate(group.created_at) }}</p>
              <button type="button" class="link-button" :aria-expanded="Boolean(expandedGroups[group.candidate_group_id])" @click="toggleGroup(group.candidate_group_id)">
                {{ expandedGroups[group.candidate_group_id] ? 'ซ่อนรายละเอียดรายงาน' : `ดูรายงานทั้งหมด (${group.reports.length})` }}
              </button>
              <ul v-if="expandedGroups[group.candidate_group_id]" class="member-list">
                <li v-for="report in group.reports" :key="report.report_id">
                  <strong>รายงาน #{{ report.report_id }}</strong><span>{{ report.description }}</span><small>{{ coordinates(report.lat, report.lng) }} · {{ formatDate(report.created_at) }}</small>
                </li>
              </ul>
            </div>
            <div class="review-card__actions review-card__actions--stacked">
              <label class="select-field">
                <span>ประเภทเหตุการณ์</span>
                <select v-model="groupTypeSelections[group.candidate_group_id]">
                  <option value="">เลือกประเภท</option>
                  <option v-for="type in incidentTypes" :key="type.type_id" :value="String(type.type_id)">{{ type.type_name }}</option>
                </select>
              </label>
              <div class="button-row">
                <button type="button" class="secondary-button" :disabled="isSaving(`group-${group.candidate_group_id}-reject`)" @click="reviewCandidateGroup({ candidateGroupId: group.candidate_group_id, action: 'reject' })">
                  ปฏิเสธกลุ่ม
                </button>
                <button type="button" class="primary-button" :disabled="isSaving(`group-${group.candidate_group_id}-accept`)" @click="submitGroup(group)">
                  {{ isSaving(`group-${group.candidate_group_id}-accept`) ? 'กำลังบันทึก…' : 'ยืนยันกลุ่ม' }}
                </button>
              </div>
            </div>
          </article>
        </section>

        <section v-if="queue.pending_reports.length" class="review-section" aria-labelledby="pending-title">
          <div class="review-section__heading">
            <div>
              <h2 id="pending-title">รายงานที่รอระบุประเภท</h2>
              <p>ยืนยันประเภทเพื่อสร้างเหตุการณ์ใหม่ หรือให้ระบบตรวจการรวมกับเหตุการณ์ที่มีอยู่</p>
            </div>
            <span>{{ queue.pending_reports.length }}</span>
          </div>

          <article v-for="report in queue.pending_reports" :key="report.report_id" class="review-card">
            <div class="review-card__main">
              <span class="record-id">รายงาน #{{ report.report_id }}</span>
              <p class="report-description">{{ report.description }}</p>
              <dl class="details-grid details-grid--compact">
                <div><dt>พิกัด</dt><dd>{{ coordinates(report.lat, report.lng) }}</dd></div>
                <div><dt>ส่งเมื่อ</dt><dd>{{ formatDate(report.created_at) }}</dd></div>
              </dl>
            </div>
            <div class="review-card__actions review-card__actions--stacked">
              <label class="select-field">
                <span>ประเภทเหตุการณ์</span>
                <select v-model="pendingTypeSelections[report.report_id]">
                  <option value="">เลือกประเภท</option>
                  <option v-for="type in incidentTypes" :key="type.type_id" :value="String(type.type_id)">{{ type.type_name }}</option>
                </select>
              </label>
              <div class="button-row">
                <button type="button" class="secondary-button secondary-button--danger" :disabled="isSaving(`pending-${report.report_id}-reject`)" @click="rejectPendingReport({ reportId: report.report_id })">ปฏิเสธรายงาน</button>
                <button type="button" class="primary-button" :disabled="isSaving(`pending-${report.report_id}-confirm`)" @click="submitPending(report)">
                  {{ isSaving(`pending-${report.report_id}-confirm`) ? 'กำลังบันทึก…' : 'ยืนยันประเภท' }}
                </button>
              </div>
            </div>
          </article>
        </section>
      </template>
    </section>
  </main>
</template>

<style scoped>
:global(*) { box-sizing: border-box; }
:global(body) { background: #f4f7fb; color: #17335c; }

.admin-shell { min-height: 100vh; background: #f4f7fb; }
.admin-header { display: flex; min-height: 4.5rem; align-items: center; justify-content: space-between; gap: 1rem; padding: .75rem clamp(1.25rem, 4vw, 4rem); border-bottom: 1px solid #dfe8f2; background: #fff; }
.admin-brand { display: inline-flex; align-items: center; gap: .55rem; color: #102968; font-size: 1.2rem; font-weight: 800; text-decoration: none; }
.admin-brand img { width: 2.2rem; height: 2.2rem; object-fit: contain; }
.admin-header__tools { display: flex; align-items: center; gap: .75rem; font-size: .82rem; }
.admin-role { padding: .35rem .6rem; border-radius: 999px; background: #e9f2ff; color: #1267bd; font-weight: 800; }
.admin-user { color: #526a87; }
.text-button, .link-button { padding: .25rem; border: 0; background: transparent; color: #176ec9; font: inherit; font-weight: 750; cursor: pointer; text-decoration: underline; text-underline-offset: .18em; }
.admin-page { width: min(100% - 2.5rem, 76rem); margin: 0 auto; padding: clamp(1.75rem, 4vw, 3.5rem) 0 4rem; }
.admin-page__intro { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; margin-bottom: 2rem; }
h1, h2, p { margin-top: 0; }
h1 { margin-bottom: .55rem; color: #102968; font-size: clamp(1.75rem, 3vw, 2.45rem); line-height: 1.12; letter-spacing: -.035em; }
.admin-page__intro p, .review-section__heading p, .supporting-copy { margin-bottom: 0; color: #637a95; line-height: 1.55; }
.queue-total { display: grid; flex: 0 0 auto; min-width: 9.5rem; gap: .12rem; padding: .8rem 1rem; border: 1px solid #cfe0f5; border-radius: .75rem; background: #fff; text-align: right; }
.queue-total strong { color: #116bd0; font-size: 1.55rem; line-height: 1; font-variant-numeric: tabular-nums; }
.queue-total span { color: #5c7491; font-size: .75rem; font-weight: 700; }
.feedback { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 0 0 1.25rem; padding: .85rem 1rem; border-radius: .7rem; font-size: .9rem; font-weight: 650; }
.feedback--error { border: 1px solid #f0c8cb; background: #fff3f3; color: #aa2631; }
.feedback--error button { border: 0; background: transparent; color: inherit; font: inherit; font-weight: 800; cursor: pointer; text-decoration: underline; }
.feedback--success { border: 1px solid #bee5ce; background: #f1fbf5; color: #187142; }
.loading-state, .empty-state { display: grid; min-height: 18rem; place-content: center; justify-items: center; gap: .9rem; border: 1px solid #dce7f2; border-radius: .9rem; background: #fff; color: #5c7491; text-align: center; }
.loading-state__spinner { width: 1.7rem; height: 1.7rem; border: 3px solid #d8e8f8; border-top-color: #1479ef; border-radius: 50%; animation: spin .75s linear infinite; }
.empty-state__mark { display: grid; width: 3rem; height: 3rem; place-items: center; border-radius: 50%; background: #e6f7ed; color: #1b8a4a; font-size: 1.5rem; font-weight: 800; }
.empty-state h2 { margin: 0; color: #16345f; font-size: 1.25rem; }.empty-state p { margin: -.45rem 0 .25rem; }
.review-section { margin-top: 2.25rem; }.review-section__heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: .9rem; }.review-section__heading h2 { margin-bottom: .28rem; color: #173a68; font-size: 1.1rem; }.review-section__heading span { display: grid; min-width: 1.7rem; height: 1.7rem; place-items: center; border-radius: 999px; background: #e8f2ff; color: #0f69c6; font-size: .78rem; font-weight: 800; }
.review-card { display: grid; grid-template-columns: minmax(0, 1fr) minmax(15.5rem, 18rem); gap: 1.5rem; align-items: center; padding: 1.25rem; border: 1px solid #dbe6f1; border-radius: .8rem; background: #fff; }.review-card + .review-card { margin-top: .75rem; }
.record-id { color: #1d72cf; font-size: .78rem; font-weight: 800; }.report-description { margin: .5rem 0 .9rem; color: #19365e; font-size: 1rem; font-weight: 680; line-height: 1.5; }.details-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .7rem 1rem; margin: 0; }.details-grid div { min-width: 0; }.details-grid dt { margin-bottom: .16rem; color: #788ea7; font-size: .72rem; font-weight: 700; }.details-grid dd { overflow: hidden; margin: 0; color: #3c5677; font-size: .8rem; font-variant-numeric: tabular-nums; text-overflow: ellipsis; white-space: nowrap; }.details-grid--compact { grid-template-columns: repeat(2, minmax(0, 1fr)); }.supporting-copy { font-size: .81rem; }
.review-card__actions { display: flex; justify-content: flex-end; gap: .6rem; }.review-card__actions--stacked { display: grid; justify-content: stretch; }.button-row { display: flex; justify-content: flex-end; gap: .6rem; }.primary-button, .secondary-button { min-height: 2.55rem; padding: 0 .9rem; border: 1px solid; border-radius: .6rem; font: inherit; font-size: .84rem; font-weight: 800; cursor: pointer; transition: background-color .16s ease, border-color .16s ease, color .16s ease, box-shadow .16s ease; }.primary-button { border-color: #1479ef; background: #1479ef; color: #fff; box-shadow: 0 4px 10px rgb(20 121 239 / 18%); }.primary-button:hover:not(:disabled) { border-color: #0865c8; background: #0865c8; }.secondary-button { border-color: #cbd9e8; background: #fff; color: #345675; }.secondary-button:hover:not(:disabled) { border-color: #9abfe7; background: #f2f8ff; color: #126bc7; }.secondary-button--danger:hover:not(:disabled) { border-color: #eca9ae; background: #fff5f5; color: #ba2732; }button:disabled { cursor: not-allowed; opacity: .6; }.select-field { display: grid; gap: .34rem; color: #58708d; font-size: .74rem; font-weight: 750; }.select-field select { width: 100%; min-height: 2.5rem; padding: 0 .65rem; border: 1px solid #c9d9e9; border-radius: .55rem; background: #fff; color: #183b68; font: inherit; }.select-field select:focus, button:focus-visible, a:focus-visible { outline: 3px solid rgb(20 121 239 / 25%); outline-offset: 2px; }
.member-list { display: grid; gap: .55rem; margin: .85rem 0 0; padding: 0; list-style: none; }.member-list li { display: grid; gap: .15rem; padding: .7rem .8rem; border-radius: .55rem; background: #f6f9fc; color: #3d5878; font-size: .82rem; }.member-list strong { color: #234a78; }.member-list small { color: #748aa3; font-size: .72rem; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 48rem) { .admin-header__tools { gap: .45rem; }.admin-role, .admin-user { display: none; }.admin-page__intro { align-items: flex-start; flex-direction: column; gap: 1rem; }.queue-total { text-align: left; }.review-card { grid-template-columns: 1fr; gap: 1.1rem; }.review-card__actions { justify-content: stretch; }.review-card__actions > .primary-button, .review-card__actions > .secondary-button { flex: 1; }.details-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.button-row { justify-content: stretch; }.button-row button { flex: 1; } }
@media (max-width: 30rem) { .admin-page { width: min(100% - 1.5rem, 76rem); }.admin-header { padding-right: .75rem; padding-left: .75rem; }.admin-brand span { font-size: 1rem; }.details-grid, .details-grid--compact { grid-template-columns: 1fr; }.review-card__actions, .button-row { flex-direction: column; }.review-card__actions > .primary-button, .review-card__actions > .secondary-button { width: 100%; } }
</style>
