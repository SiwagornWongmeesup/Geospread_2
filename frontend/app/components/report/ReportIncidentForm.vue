<template>
  <form class="report-incident-form" @submit.prevent="submitReport">
    <header class="report-incident-form__intro">
      <h1>แจ้งเหตุการณ์</h1>
      <p>แจ้งสิ่งที่คุณพบเพื่อให้คนในพื้นที่รับรู้และช่วยเหลือได้เร็วขึ้น</p>
    </header>

    <label class="report-incident-form__section report-incident-form__details">
      <span>เกิดอะไรขึ้น? <b aria-hidden="true">*</b></span>
      <textarea v-model="details" rows="4" maxlength="500" required placeholder="พิมพ์สิ่งที่เกิดขึ้น เช่น น้ำท่วมหน้าตลาด, มีควันผิดปกติ, ถนนทรุด..." />
      <em>{{ details.length }}/500</em>
    </label>

    <section class="report-incident-form__section incident-suggestions" aria-labelledby="suggested-types-heading">
      <header class="incident-suggestions__heading">
        <div>
          <h2 id="suggested-types-heading">ประเภทเหตุการณ์ <span>(ไม่บังคับ)</span></h2>
          <p>{{ suggestionNote }}</p>
        </div>
        <button ref="moreTypesButton" type="button" class="more-types-button" @click="openTypePicker">
          ดูเพิ่มเติม
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
        </button>
      </header>

      <div v-if="visibleIncidentTypes.length" class="suggested-type-grid" role="group" aria-label="ประเภทเหตุการณ์ที่เลือกได้อย่างรวดเร็ว">
        <button v-for="incidentType in visibleIncidentTypes" :key="incidentType.id" type="button" class="suggested-type" :class="{ 'suggested-type--selected': userSelectedTypeId === incidentType.id }" :aria-pressed="userSelectedTypeId === incidentType.id" @click="selectIncidentType(incidentType)">
          <span class="suggested-type__icon" :style="{ backgroundColor: iconColor(incidentType) }" aria-hidden="true">
            <img :src="incidentType.iconUrl || '/Alert.svg'" alt="">
          </span>
          <span>{{ incidentType.label }}</span>
          <svg v-if="userSelectedTypeId === incidentType.id" class="suggested-type__check" viewBox="0 0 24 24" aria-label="เลือกแล้ว"><path d="m7.5 12.5 3 3 6-7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.3" /></svg>
        </button>
      </div>
    </section>

    <section class="report-incident-form__section report-incident-form__upload" aria-labelledby="upload-heading">
      <h2 id="upload-heading">แนบรูปภาพหรือวิดีโอ <span>(ไม่บังคับ)</span></h2>
      <p>สื่อประกอบช่วยให้ชุมชนและเจ้าหน้าที่เข้าใจสถานการณ์ได้ดีขึ้น</p>
      <input ref="fileInput" type="file" multiple accept="image/jpeg,image/png,video/mp4" class="sr-only" :disabled="isSubmitting" @change="selectFiles">
      <button type="button" class="upload-zone" :disabled="isSubmitting" @click="fileInput?.click()">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v12h16V6H4Zm3 10 3.2-4.1 2.4 2.9 1.7-2.1L18 16H7Zm3-5.5A1.5 1.5 0 1 0 10 7.5a1.5 1.5 0 0 0 0 3Z" fill="currentColor" /></svg>
        <span><strong>{{ selectedMediaLabel }}</strong><small>{{ selectedFiles.length ? 'ไฟล์จะถูกอัปโหลดเมื่อส่งรายงาน' : 'รองรับ JPG, PNG และ MP4 สูงสุด 5 ไฟล์ ไฟล์ละไม่เกิน 20 MB' }}</small></span>
      </button>
    </section>

    <div v-if="feedback" class="report-incident-form__feedback" role="status">
      <span>{{ feedback }}</span>
      <button v-if="needsLogin" type="button" class="feedback-login" @click="goToLogin">เข้าสู่ระบบ</button>
    </div>
    <footer class="report-incident-form__actions">
      <button type="button" class="button button--secondary" :disabled="isSubmitting" @click="saveMockDraft">บันทึกร่าง</button>
      <button v-if="isLoggedIn" type="submit" class="button button--primary" :disabled="isSubmitting">{{ isSubmitting ? 'กำลังส่งรายงาน…' : 'ส่งรายงาน' }}</button>
      <button v-else type="button" class="button button--primary" @click="showLoginPrompt">เข้าสู่ระบบเพื่อส่งรายงาน</button>
    </footer>
  </form>

  <Teleport to="body">
    <div v-if="isTypePickerOpen" class="incident-type-modal-backdrop" @click.self="closeTypePicker">
      <section class="incident-type-modal" role="dialog" aria-modal="true" aria-labelledby="type-picker-title" @keydown.esc="closeTypePicker">
        <header class="incident-type-modal__header">
          <div>
            <h2 id="type-picker-title">หมวดหมู่และประเภทเหตุการณ์</h2>
            <p>เลือกเฉพาะเมื่อ Type ตรงกับสิ่งที่พบ ไม่เลือกก็ส่งรายงานได้ตามปกติ</p>
          </div>
          <button type="button" class="modal-close-button" aria-label="ปิดหน้าต่างเลือกประเภทเหตุการณ์" @click="closeTypePicker">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" /></svg>
          </button>
        </header>

        <label class="type-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m20 20-4.2-4.2m1.2-4.8a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" /></svg>
          <input ref="typePickerSearch" v-model="typeSearch" type="search" placeholder="ค้นหาประเภทเหตุการณ์">
        </label>
        <p class="type-search__hint">เช่น น้ำท่วม, อุบัติเหตุทางถนน, เพลิงไหม้, PM2.5</p>

        <div v-if="filteredTypeGroups.length" class="type-picker-groups">
          <section v-for="group in filteredTypeGroups" :key="group.id" class="type-picker-group" :aria-labelledby="`type-group-${group.id}`">
            <header class="type-picker-group__heading">
              <span class="type-picker-group__icon" :style="{ backgroundColor: groupColor(group.id) }" aria-hidden="true">
                <img :src="group.iconUrl || '/Alert.svg'" alt="">
              </span>
              <h3 :id="`type-group-${group.id}`">{{ group.label }}</h3>
              <span class="type-picker-group__count">{{ group.types.length }} ประเภท</span>
            </header>
            <div class="type-picker-grid">
              <button v-for="incidentType in group.types" :key="incidentType.id" type="button" class="type-picker-option" :class="{ 'type-picker-option--selected': userSelectedTypeId === incidentType.id }" :aria-pressed="userSelectedTypeId === incidentType.id" @click="selectIncidentType(incidentType, true)">
                <span class="type-picker-option__icon" :style="{ backgroundColor: iconColor(incidentType) }" aria-hidden="true">
                  <img :src="incidentType.iconUrl || '/Alert.svg'" alt="">
                </span>
                <span>{{ incidentType.label }}</span>
                <svg v-if="userSelectedTypeId === incidentType.id" class="type-picker-option__check" viewBox="0 0 24 24" aria-label="เลือกแล้ว"><path d="m7.5 12.5 3 3 6-7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.3" /></svg>
              </button>
            </div>
          </section>
        </div>
        <p v-else-if="isLoadingTypeCache" class="type-picker-empty">กำลังโหลดหมวดหมู่และประเภทเหตุการณ์…</p>
        <p v-else-if="catalogLoadError" class="type-picker-empty">ยังโหลดประเภทเหตุการณ์จากระบบไม่ได้ ลองเปิดใหม่อีกครั้งได้เลย</p>
        <p v-else class="type-picker-empty">ไม่พบประเภทเหตุการณ์ที่ค้นหา ลองใช้คำที่สั้นลงหรือพิมพ์รายละเอียดในรายงานแทน</p>

        <p class="type-picker-footnote">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z" fill="currentColor" /></svg>
          หากไม่พบประเภทที่ต้องการ หรือยังไม่แน่ใจ คุณยังสามารถพิมพ์รายละเอียดแล้วส่งรายงานได้
        </p>
      </section>
    </div>
  </Teleport>

  <Teleport to="body">
    <div v-if="isTypeConflictDialogOpen" class="incident-type-modal-backdrop" @click.self="closeTypeConflictDialog">
      <section class="incident-type-modal type-conflict-modal" role="dialog" aria-modal="true" aria-labelledby="type-conflict-title" @keydown.esc="closeTypeConflictDialog">
        <h2 id="type-conflict-title">ประเภทที่คุณเลือกอาจไม่ตรงกับรายละเอียดที่พิมพ์</h2>
        <p>ระบบแนะนำ: <strong>{{ detectedSuggestion?.label }}</strong><br>คุณเลือก: <strong>{{ userSelectedType?.label }}</strong></p>
        <div class="type-conflict-modal__actions">
          <button type="button" class="button button--secondary" @click="changeToSuggestedType">เปลี่ยนเป็น {{ detectedSuggestion?.label }}</button>
          <button type="button" class="button button--primary" @click="confirmSelectedTypeDespiteConflict">ยืนยันใช้ {{ userSelectedType?.label }}</button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { getRecommendedIncidentTypes, toDisplayIncidentCategory, toDisplayKeywordType } from '~/composables/useReportIncident'

const {
  userSelectedTypeId,
  userSelectedType,
  incidentLocation,
  reporterLocation,
  selectUserSelectedType,
  clearUserSelectedType,
} = useReportIncident()
clearUserSelectedType()
const details = ref('')
const fileInput = ref(null)
const selectedFiles = ref([])
const feedback = ref('')
const isSubmitting = ref(false)
const isTypePickerOpen = ref(false)
const typeSearch = ref('')
const typePickerSearch = ref(null)
const moreTypesButton = ref(null)
const keywordTypeCache = ref([])
const incidentTypeGroups = ref([])
const isLoadingTypeCache = ref(false)
const catalogLoadError = ref(false)
const isTypeConflictDialogOpen = ref(false)
const allowTypeConflict = ref(false)
const config = useRuntimeConfig()
// Nuxt dev server ที่เปิดก่อนเพิ่ม runtime config ยังไม่มี apiBase จึงต้องมีค่า fallback
const apiBase = config.public.apiBase || 'http://localhost:5000'
const { getToken, isLoggedIn } = useAuth()
const maxMediaFiles = 5
const maxMediaFileSizeBytes = 20 * 1024 * 1024
const needsLogin = ref(false)
const recommendedTypes = computed(() => getRecommendedIncidentTypes(details.value, keywordTypeCache.value))
const detectedSuggestion = computed(() => recommendedTypes.value[0] ?? null)
const visibleIncidentTypes = computed(() => {
  // ก่อนพิมพ์ข้อความจะไม่แสดง Type ทั้งหมด: ผู้ใช้เห็นเฉพาะคำแนะนำจาก keyword
  // หรือ Type ที่ตนเลือกเองจาก modal เท่านั้น
  const prioritized = [userSelectedType.value, ...recommendedTypes.value].filter(Boolean)
  return [...new Map(prioritized.map((type) => [type.id, type])).values()]
})
const hasTypeConflict = computed(() => Boolean(
  userSelectedType.value?.databaseTypeId
  && detectedSuggestion.value?.databaseTypeId
  && userSelectedType.value.databaseTypeId !== detectedSuggestion.value.databaseTypeId,
))
const selectedMediaLabel = computed(() => {
  if (!selectedFiles.value.length) return 'เลือกรูปภาพหรือวิดีโอ'
  if (selectedFiles.value.length === 1) return selectedFiles.value[0].name
  return `เลือกแล้ว ${selectedFiles.value.length} ไฟล์`
})
const suggestionNote = computed(() => {
  if (userSelectedType.value) return `เลือกประเภท “${userSelectedType.value.label}” แล้ว กดอีกครั้งเพื่อยกเลิก หรือเลือกประเภทอื่นได้`
  if (details.value.trim().length < 2) return 'พิมพ์รายละเอียดก่อน ระบบจะแนะนำ Type ที่เกี่ยวข้องให้ หรือกดดูเพิ่มเติมได้'
  if (isLoadingTypeCache.value) return 'กำลังเตรียมคำแนะนำประเภทเหตุการณ์…'
  if (detectedSuggestion.value) return `ระบบคาดว่าอาจเป็น “${detectedSuggestion.value.label}” เลือกได้ถ้าตรง ไม่เลือกก็ส่งรายงานได้`
  if (catalogLoadError.value) return 'ยังโหลดคำแนะนำจากระบบไม่ได้ แต่คุณยังพิมพ์และส่งรายงานได้ตามปกติ'
  return 'ระบุ Type ได้เมื่อช่วยให้ตรงกับสิ่งที่พบ ไม่เลือกก็ส่งรายงานได้'
})
const normalizedSearch = computed(() => typeSearch.value.trim().toLocaleLowerCase())
const filteredTypeGroups = computed(() => incidentTypeGroups.value
  .map((group) => ({
    ...group,
    types: !normalizedSearch.value || group.label.toLocaleLowerCase().includes(normalizedSearch.value)
      ? group.types
      : group.types.filter((type) => type.label.toLocaleLowerCase().includes(normalizedSearch.value)),
  }))
  .filter((group) => group.types.length))

// โหลด Database snapshot เพียงครั้งเดียวเมื่อเปิดหน้า แล้วใช้ keywordTypeCache ระหว่างพิมพ์
const fetchReportTypeCache = async () => {
  isLoadingTypeCache.value = true
  catalogLoadError.value = false

  try {
    const response = await $fetch(`${apiBase}/incidents/report-type-cache`)
    incidentTypeGroups.value = (response.data?.categories ?? []).map(toDisplayIncidentCategory)
    keywordTypeCache.value = (response.data?.keywords ?? []).map(toDisplayKeywordType)
  } catch {
    incidentTypeGroups.value = []
    keywordTypeCache.value = []
    catalogLoadError.value = true
  } finally {
    isLoadingTypeCache.value = false
  }
}

watch(details, () => {
  allowTypeConflict.value = false
})

onMounted(() => {
  void fetchReportTypeCache()
})
const iconColorByType = {
  flood: '#1479ef', storm: '#6d5dfb', drought: '#f0b429', wildfire: '#e8333c', tsunami: '#1479ef', earthquake: '#e8333c',
  traffic_accident: '#1479ef', vehicle_obstruction: '#596b8a', road_damage: '#53678a', road_obstruction: '#e8333c', building_fire: '#e84431',
  violent_incident: '#e8333c', lost_item: '#1479ef', missing_person: '#f47b22', dangerous_animal: '#9a5131',
  pm25: '#67809f', chemical_odor: '#14a6a2', power_outage: '#f0a72c', water_supply_outage: '#1479ef',
}

const iconColor = (incidentType) => incidentType.markerColor ?? iconColorByType[incidentType.id] ?? '#1479ef'
const groupColor = (categoryCode) => ['natural_disaster', 'environment'].includes(categoryCode) ? '#2ca86a' : '#1479ef'

const selectIncidentType = (incidentType, closePicker = false) => {
  allowTypeConflict.value = false
  selectUserSelectedType(incidentType)
  if (closePicker) closeTypePicker()
}
const openTypePicker = async () => {
  typeSearch.value = ''
  isTypePickerOpen.value = true
  await nextTick()
  typePickerSearch.value?.focus()
}
const closeTypePicker = async () => {
  isTypePickerOpen.value = false
  await nextTick()
  moreTypesButton.value?.focus()
}
const closeTypeConflictDialog = () => {
  isTypeConflictDialogOpen.value = false
}
const changeToSuggestedType = () => {
  if (detectedSuggestion.value) selectUserSelectedType(detectedSuggestion.value)
  allowTypeConflict.value = false
  closeTypeConflictDialog()
}
const confirmSelectedTypeDespiteConflict = () => {
  allowTypeConflict.value = true
  closeTypeConflictDialog()
  void submitReport()
}
const selectFiles = (event) => {
  const files = Array.from(event.target.files ?? [])

  if (files.length > maxMediaFiles) {
    feedback.value = 'แนบรูปภาพหรือวิดีโอได้สูงสุด 5 ไฟล์ต่อรายงาน'
    selectedFiles.value = []
    event.target.value = ''
    return
  }

  if (files.some((file) => file.size > maxMediaFileSizeBytes)) {
    feedback.value = 'ไฟล์แนบแต่ละไฟล์ต้องมีขนาดไม่เกิน 20 MB'
    selectedFiles.value = []
    event.target.value = ''
    return
  }

  selectedFiles.value = files
}
const saveMockDraft = () => { feedback.value = 'บันทึกข้อมูลตัวอย่างแล้ว ข้อมูลนี้ยังอยู่เฉพาะในหน้าจอนี้' }
const showLoginPrompt = (message = 'เข้าสู่ระบบก่อนส่งรายงาน เพื่อให้ระบบยืนยันผู้แจ้งและป้องกันการส่งข้อมูลรบกวน') => {
  feedback.value = message
  needsLogin.value = true
}
const goToLogin = () => navigateTo({ path: '/login', query: { redirect: '/report-incident' } })
const submitReport = async () => {
  if (!incidentLocation.value) {
    feedback.value = 'กรุณาเลือกตำแหน่งเหตุการณ์ก่อนส่งรายงาน'
    return
  }

  const authToken = getToken()
  if (!authToken) {
    showLoginPrompt()
    return
  }

  if (hasTypeConflict.value && !allowTypeConflict.value) {
    isTypeConflictDialogOpen.value = true
    return
  }

  const formData = new FormData()
  formData.append('description', details.value.trim())
  formData.append('lat', String(incidentLocation.value.lat))
  formData.append('lng', String(incidentLocation.value.lng))

  if (reporterLocation.value) {
    formData.append('reporter_lat', String(reporterLocation.value.lat))
    formData.append('reporter_lng', String(reporterLocation.value.lng))
  }

  if (userSelectedType.value?.databaseTypeId) {
    formData.append('user_selected_type_id', String(userSelectedType.value.databaseTypeId))
  }

  for (const file of selectedFiles.value) formData.append('media', file)

  isSubmitting.value = true
  feedback.value = ''
  needsLogin.value = false

  try {
    const response = await $fetch(`${apiBase}/incidents`, {
      method: 'POST',
      body: formData,
      headers: { Authorization: `Bearer ${authToken}` },
    })

    const reportId = response.data?.report_id
    console.log(response)
    feedback.value = reportId ? `ส่งรายงาน #${reportId} สำเร็จแล้ว` : 'ส่งรายงานสำเร็จแล้ว'
    details.value = ''
    selectedFiles.value = []
    if (fileInput.value) fileInput.value.value = ''
    clearUserSelectedType()
    allowTypeConflict.value = false
  } catch (error) {
    if (error?.statusCode === 401) {
      showLoginPrompt('เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้งก่อนส่งรายงาน')
      return
    }
    feedback.value = error?.data?.message ?? 'ส่งรายงานไม่สำเร็จ กรุณาลองอีกครั้ง'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.report-incident-form {
  display: grid;
  gap: 1.5rem;
  width: 100%;
  padding: 1.75rem;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 8px 24px rgb(31 72 125 / 10%);
}

.report-incident-form h1,
.report-incident-form h2,
.report-incident-form p {
  margin: 0;
}

.report-incident-form h1 {
  color: #102968;
  font-size: 1.65rem;
}

.report-incident-form__intro p {
  margin-top: 0.5rem;
  color: #60718c;
  font-size: 0.9rem;
}

.report-incident-form__section {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.report-incident-form__details {
  position: relative;
  display: grid;
}

.report-incident-form__details > span,
.report-incident-form__upload h2,
.incident-suggestions h2 {
  color: #142d5b;
  font-size: 1.05rem;
  font-weight: 800;
}

.incident-suggestions h2 span {
  color: #70819b;
  font-size: 0.75rem;
  font-weight: 650;
}

.report-incident-form__details b {
  color: #e8333c;
}

.report-incident-form__details textarea {
  min-height: 7rem;
  margin-top: 0.7rem;
  padding: 0.85rem 0.9rem 1.8rem;
  border: 1px solid #cdd9e8;
  border-radius: 0.75rem;
  background: #fff;
  color: #17345f;
  font: inherit;
  font-size: 0.9rem;
  line-height: 1.55;
  resize: vertical;
}

.report-incident-form__details textarea::placeholder {
  color: #8291a8;
  opacity: 1;
}

.report-incident-form__details textarea:focus-visible {
  border-color: #1479ef;
  outline: 3px solid rgb(20 121 239 / 16%);
}

.report-incident-form__details em {
  position: absolute;
  right: 0.8rem;
  bottom: 0.6rem;
  color: #70819b;
  font-size: 0.72rem;
  font-style: normal;
}

.incident-suggestions {
  padding-top: 1.45rem;
  border-top: 1px solid #dce6f1;
}

.incident-suggestions__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.95rem;
}

.incident-suggestions__heading p {
  margin-top: 0.25rem;
  color: #60718c;
  font-size: 0.82rem;
  line-height: 1.45;
}

.more-types-button {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0;
  border: 0;
  background: transparent;
  color: #1479ef;
  font: inherit;
  font-size: 0.87rem;
  font-weight: 800;
  cursor: pointer;
}

.more-types-button svg {
  width: 1.15rem;
  height: 1.15rem;
  transition: transform 160ms ease;
}

.more-types-button:hover svg {
  transform: translateX(0.2rem);
}

.more-types-button:focus-visible {
  border-radius: 0.3rem;
  outline: 3px solid rgb(20 121 239 / 20%);
  outline-offset: 0.2rem;
}

.suggested-type-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.suggested-type {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-height: 5.25rem;
  padding: 0.9rem 1rem;
  border: 1px solid #d8e3f0;
  border-radius: 0.8rem;
  background: #fff;
  color: #1c355d;
  font: inherit;
  font-size: 0.94rem;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
  transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.suggested-type__icon {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 999px;
  box-shadow: 0 0 0 4px rgb(20 121 239 / 8%);
}

.suggested-type__icon img {
  width: 1.18rem;
  height: 1.18rem;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.suggested-type:hover {
  border-color: #8bbcf2;
  background: #f8fbff;
  transform: translateY(-1px);
}

.suggested-type:focus-visible {
  outline: 3px solid rgb(20 121 239 / 20%);
  outline-offset: 2px;
}

.suggested-type--selected {
  border-color: #1479ef;
  background: #f1f7ff;
  box-shadow: inset 0 0 0 1px #1479ef;
  color: #096bdc;
}

.suggested-type__check {
  width: 1.7rem;
  height: 1.7rem;
  margin-left: auto;
  padding: 0.25rem;
  border-radius: 50%;
  background: #1479ef;
  color: #fff;
}

.report-incident-form__upload h2 span {
  color: #71809a;
  font-size: 0.8rem;
  font-weight: 600;
}

.report-incident-form__upload > p {
  margin-top: 0.3rem;
  margin-bottom: 0.75rem;
  color: #60718c;
  font-size: 0.82rem;
  line-height: 1.45;
}

.upload-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  width: 100%;
  min-height: 5.5rem;
  padding: 0.75rem;
  border: 1px dashed #89a8cf;
  border-radius: 0.7rem;
  background: #fbfdff;
  color: #2b5b9a;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.upload-zone:hover,
.upload-zone:focus-visible {
  border-color: #1479ef;
  background: #f4f9ff;
  outline: none;
}

.upload-zone svg {
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
}

.upload-zone strong,
.upload-zone small {
  display: block;
}

.upload-zone strong {
  color: #1b3b70;
  font-size: 0.82rem;
}

.upload-zone small {
  margin-top: 0.2rem;
  color: #70819b;
  font-size: 0.72rem;
}

.report-incident-form__feedback {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin: -0.4rem 0 0;
  padding: 0.7rem 0.8rem;
  border-radius: 0.6rem;
  background: #edf6ff;
  color: #24558e;
  font-size: 0.8rem;
  line-height: 1.4;
}

.feedback-login {
  flex: 0 0 auto;
  padding: 0.45rem 0.7rem;
  border: 1px solid #71a9e6;
  border-radius: 0.45rem;
  background: #fff;
  color: #0b61c2;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
}

.feedback-login:hover,
.feedback-login:focus-visible {
  border-color: #1479ef;
  background: #f4f9ff;
  outline: none;
}

.report-incident-form__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.button {
  min-height: 3rem;
  border-radius: 0.6rem;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.button--secondary {
  border: 1px solid #b9cae0;
  background: #fff;
  color: #21416f;
}

.button--secondary:hover,
.button--secondary:focus-visible {
  border-color: #1479ef;
  color: #0b61c2;
  outline: none;
}

.button--primary {
  border: 0;
  background: #e8333c;
  color: #fff;
}

.button--primary:hover,
.button--primary:focus-visible {
  background: #cf202a;
  outline: none;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.incident-type-modal-backdrop {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: rgb(14 34 66 / 48%);
  backdrop-filter: blur(3px);
}

.incident-type-modal {
  width: min(100%, 45rem);
  max-height: min(52rem, calc(100dvh - 2.5rem));
  overflow: auto;
  padding: 1.55rem;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 22px 58px rgb(7 27 62 / 28%);
  animation: modal-enter 180ms cubic-bezier(.2, .8, .2, 1);
}

.incident-type-modal__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.incident-type-modal h2 {
  margin: 0;
  color: #102968;
  font-size: 1.55rem;
  line-height: 1.2;
}

.type-conflict-modal {
  width: min(100%, 34rem);
}

.type-conflict-modal > p {
  margin: 0.8rem 0 0;
  color: #60718c;
  line-height: 1.55;
}

.type-conflict-modal__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 1.35rem;
}

.incident-type-modal__header p {
  margin: 0.35rem 0 0;
  color: #60718c;
  font-size: 0.85rem;
  line-height: 1.4;
}

.incident-type-modal__header p span {
  color: #7b8aa0;
}

.modal-close-button {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 auto;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: #527096;
  cursor: pointer;
}

.modal-close-button:hover {
  background: #eff5fc;
  color: #163b70;
}

.modal-close-button:focus-visible {
  outline: 3px solid rgb(20 121 239 / 20%);
}

.modal-close-button svg {
  width: 1.35rem;
  height: 1.35rem;
}

.type-search {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-top: 1rem;
  padding: 0 0.8rem;
  border: 1px solid #c9d8ea;
  border-radius: 0.6rem;
  color: #6d82a0;
}

.type-search:focus-within {
  border-color: #1479ef;
  outline: 3px solid rgb(20 121 239 / 14%);
}

.type-search svg {
  width: 1.3rem;
  height: 1.3rem;
  flex: 0 0 auto;
}

.type-search input {
  width: 100%;
  min-height: 2.6rem;
  border: 0;
  outline: 0;
  background: transparent;
  color: #17345f;
  font: inherit;
  font-size: 0.9rem;
}

.type-search input::placeholder {
  color: #8291a8;
}

.type-search__hint {
  margin: 0.35rem 0 0;
  color: #74849b;
  font-size: 0.75rem;
}

.type-picker-groups {
  display: grid;
  gap: 1.1rem;
  margin-top: 1.25rem;
}

.type-picker-group__heading {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.55rem;
}

.type-picker-group__icon {
  display: grid;
  width: 1.9rem;
  height: 1.9rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 999px;
}

.type-picker-group__icon img {
  width: 1.08rem;
  height: 1.08rem;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.type-picker-group h3 {
  margin: 0;
  color: #17345f;
  font-size: 1rem;
}

.type-picker-group__count {
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: #f0f4f9;
  color: #7a899d;
  font-size: 0.68rem;
  font-weight: 700;
}

.type-picker-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
  padding-left: 2.45rem;
}

.type-picker-option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 2.8rem;
  padding: 0.55rem 0.65rem;
  border: 1px solid #dbe6f2;
  border-radius: 0.6rem;
  background: #fbfdff;
  color: #314866;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 750;
  text-align: left;
  cursor: pointer;
  transition: border-color 160ms ease, background 160ms ease;
}

.type-picker-option__icon {
  display: grid;
  width: 1.55rem;
  height: 1.55rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 999px;
}

.type-picker-option__icon img {
  width: 0.95rem;
  height: 0.95rem;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.type-picker-option:hover {
  border-color: #8bbcf2;
  background: #f4f9ff;
}

.type-picker-option:focus-visible {
  outline: 3px solid rgb(20 121 239 / 20%);
  outline-offset: 1px;
}

.type-picker-option--selected {
  border-color: #1479ef;
  background: #eff7ff;
  color: #096bdc;
}

.type-picker-option__check {
  position: absolute;
  top: 0.35rem;
  right: 0.35rem;
  width: 1rem;
  height: 1rem;
  color: #1479ef;
}

.type-picker-empty {
  margin: 1.5rem 0;
  padding: 1rem;
  border-radius: 0.65rem;
  background: #f5f8fc;
  color: #5e728f;
  font-size: 0.85rem;
  text-align: center;
}

.type-picker-footnote {
  display: flex;
  gap: 0.55rem;
  align-items: center;
  margin: 1.25rem 0 0;
  padding: 0.7rem 0.85rem;
  border-radius: 0.6rem;
  background: #eaf4ff;
  color: #3670bd;
  font-size: 0.75rem;
  font-weight: 650;
  line-height: 1.4;
}

.type-picker-footnote svg {
  width: 1.2rem;
  height: 1.2rem;
  flex: 0 0 auto;
  color: #1479ef;
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: translateY(0.75rem) scale(.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 60rem) {
  .suggested-type-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 38rem) {
  .report-incident-form {
    padding: 1rem;
  }
  .incident-suggestions__heading {
    align-items: flex-end;
  }
  .incident-suggestions__heading p {
    max-width: 29ch;
  }
  .suggested-type {
    min-height: 4.75rem;
    padding: 0.75rem;
    font-size: 0.84rem;
  }
  .suggested-type__icon {
    width: 1.65rem;
    height: 1.65rem;
  }
  .suggested-type__icon img {
    width: 1rem;
    height: 1rem;
  }
  .incident-type-modal-backdrop {
    padding: 0.7rem;
  }
  .incident-type-modal {
    max-height: calc(100dvh - 1.4rem);
    padding: 1.1rem;
    border-radius: 0.8rem;
  }
  .incident-type-modal h2 {
    font-size: 1.3rem;
  }
  .type-picker-group__heading {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .type-picker-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding-left: 0;
  }

  .type-conflict-modal__actions {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 26rem) {
  .suggested-type-grid,
  .report-incident-form__actions {
    grid-template-columns: 1fr;
  }
  .more-types-button {
    font-size: 0.8rem;
  }
}
</style>
