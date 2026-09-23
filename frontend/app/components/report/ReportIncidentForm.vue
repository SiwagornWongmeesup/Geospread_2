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
          เลือกประเภทอื่น
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
        </button>
      </header>

      <div v-if="suggestedTypes.length" class="suggested-type-grid" role="group" aria-label="ประเภทเหตุการณ์ที่ระบบแนะนำ">
        <button v-for="incidentType in suggestedTypes" :key="incidentType.id" type="button" class="suggested-type" :class="{ 'suggested-type--selected': userSelectedTypeId === incidentType.id }" :aria-pressed="userSelectedTypeId === incidentType.id" @click="selectIncidentType(incidentType)">
          <svg class="suggested-type__icon" viewBox="0 0 24 24" aria-hidden="true" :style="{ color: iconColor(incidentType) }"><path :d="iconPath(incidentType.icon)" fill="currentColor" /></svg>
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
              <svg viewBox="0 0 24 24" aria-hidden="true" :style="{ color: groupColor(group.id) }"><path :d="iconPath(group.icon)" fill="currentColor" /></svg>
              <h3 :id="`type-group-${group.id}`">{{ group.label }}</h3>
              <span>{{ group.types.length }} ประเภท</span>
            </header>
            <div class="type-picker-grid">
              <button v-for="incidentType in group.types" :key="incidentType.id" type="button" class="type-picker-option" :class="{ 'type-picker-option--selected': userSelectedTypeId === incidentType.id }" :aria-pressed="userSelectedTypeId === incidentType.id" @click="selectIncidentType(incidentType, true)">
                <svg viewBox="0 0 24 24" aria-hidden="true" :style="{ color: iconColor(incidentType) }"><path :d="iconPath(incidentType.icon)" fill="currentColor" /></svg>
                <span>{{ incidentType.label }}</span>
                <svg v-if="userSelectedTypeId === incidentType.id" class="type-picker-option__check" viewBox="0 0 24 24" aria-label="เลือกแล้ว"><path d="m7.5 12.5 3 3 6-7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.3" /></svg>
              </button>
            </div>
          </section>
        </div>
        <p v-else-if="isLoadingCatalog" class="type-picker-empty">กำลังโหลดหมวดหมู่และประเภทเหตุการณ์…</p>
        <p v-else-if="catalogLoadError" class="type-picker-empty">ยังโหลดประเภทเหตุการณ์จากระบบไม่ได้ ลองเปิดใหม่อีกครั้งได้เลย</p>
        <p v-else class="type-picker-empty">ไม่พบประเภทเหตุการณ์ที่ค้นหา ลองใช้คำที่สั้นลงหรือพิมพ์รายละเอียดในรายงานแทน</p>

        <p class="type-picker-footnote">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z" fill="currentColor" /></svg>
          หากไม่พบประเภทที่ต้องการ หรือยังไม่แน่ใจ คุณยังสามารถพิมพ์รายละเอียดแล้วส่งรายงานได้
        </p>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getRecommendedIncidentTypes, toDisplayIncidentCategory } from '~/composables/useReportIncident'

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
const suggestedTypesFromApi = ref([])
const isLoadingSuggestions = ref(false)
const incidentTypeGroups = ref([])
const isLoadingCatalog = ref(false)
const catalogLoadError = ref(false)
const config = useRuntimeConfig()
// Nuxt dev server ที่เปิดก่อนเพิ่ม runtime config ยังไม่มี apiBase จึงต้องมีค่า fallback
const apiBase = config.public.apiBase || 'http://localhost:5000'
const { getToken, isLoggedIn } = useAuth()
const maxMediaFiles = 5
const maxMediaFileSizeBytes = 20 * 1024 * 1024
const needsLogin = ref(false)
let suggestionTimer
let latestSuggestionRequest = 0
const suggestedTypes = computed(() => getRecommendedIncidentTypes(
  suggestedTypesFromApi.value,
  userSelectedType.value,
))
const detectedSuggestion = computed(() => getRecommendedIncidentTypes(suggestedTypesFromApi.value)[0] ?? null)
const selectedMediaLabel = computed(() => {
  if (!selectedFiles.value.length) return 'เลือกรูปภาพหรือวิดีโอ'
  if (selectedFiles.value.length === 1) return selectedFiles.value[0].name
  return `เลือกแล้ว ${selectedFiles.value.length} ไฟล์`
})
const suggestionNote = computed(() => {
  if (userSelectedType.value) return `เลือกประเภท “${userSelectedType.value.label}” แล้ว กดอีกครั้งเพื่อยกเลิก หรือเลือกประเภทอื่นได้`
  if (isLoadingSuggestions.value) return 'กำลังหาประเภทที่เกี่ยวข้องจากรายละเอียดที่พิมพ์…'
  if (detectedSuggestion.value) return `ระบบคาดว่าอาจเป็น “${detectedSuggestion.value.label}” เลือกได้ถ้าตรง ไม่เลือกก็ส่งรายงานได้`
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

const fetchIncidentCatalog = async () => {
  isLoadingCatalog.value = true
  catalogLoadError.value = false

  try {
    const response = await $fetch(`${apiBase}/incidents/catalog`)
    incidentTypeGroups.value = (response.data ?? []).map(toDisplayIncidentCategory)
  } catch {
    incidentTypeGroups.value = []
    catalogLoadError.value = true
  } finally {
    isLoadingCatalog.value = false
  }
}

const fetchSuggestedTypes = async (description) => {
  const requestId = ++latestSuggestionRequest
  const trimmedDescription = description.trim()

  if (trimmedDescription.length < 2) {
    suggestedTypesFromApi.value = []
    isLoadingSuggestions.value = false
    return
  }

  isLoadingSuggestions.value = true

  try {
    const response = await $fetch(`${apiBase}/incidents/suggestions`, {
      query: { description: trimmedDescription, limit: 2 },
    })

    if (requestId === latestSuggestionRequest) {
      suggestedTypesFromApi.value = response.data ?? []
    }
  } catch {
    // คำแนะนำล้มเหลวได้โดยไม่กระทบการพิมพ์หรือการส่งรายงาน
    if (requestId === latestSuggestionRequest) suggestedTypesFromApi.value = []
  } finally {
    if (requestId === latestSuggestionRequest) isLoadingSuggestions.value = false
  }
}

watch(details, (description) => {
  clearTimeout(suggestionTimer)

  if (description.trim().length < 2) {
    void fetchSuggestedTypes(description)
    return
  }

  suggestionTimer = setTimeout(() => {
    void fetchSuggestedTypes(description)
  }, 350)
})

onBeforeUnmount(() => clearTimeout(suggestionTimer))
onMounted(() => {
  void fetchIncidentCatalog()
})

const iconPaths = {
  flood: 'M3 16c1.7 0 1.7-1.7 3.4-1.7S8.1 16 9.8 16s1.7-1.7 3.4-1.7 1.7 1.7 3.4 1.7 1.7-1.7 3.4-1.7v2.2c-1.7 0-1.7 1.7-3.4 1.7s-1.7-1.7-3.4-1.7-1.7 1.7-3.4 1.7-1.7-1.7-3.4-1.7S4.7 20 3 20v-4Zm1-4.5c1.7-4.3 5.2-6.5 10.5-6.5 3.1 0 5.3.9 6.5 2.6-3.4-.5-5.7.1-7.1 1.8-1.8-1.1-3.7-.9-5.8.6-1 .7-2.4 1.2-4.1 1.5Z',
  storm: 'M6.2 18h9.6a4.2 4.2 0 0 0 .7-8.34A5.2 5.2 0 0 0 6.1 11.1 3.5 3.5 0 0 0 6.2 18Zm5.1-6.2h2.2l-1 2.2H14l-3.4 5 .9-3H10l1.3-4.2Z',
  drought: 'M12 2a1 1 0 0 1 1 1v1.3l1.7-1a1 1 0 1 1 1 1.7l-1.7 1H16a1 1 0 1 1 0 2h-2.3l1.7 1a1 1 0 1 1-1 1.7L12.7 9.7V12a1 1 0 1 1-2 0V9.7L9 10.7a1 1 0 1 1-1-1.7l1.7-1H7.4a1 1 0 1 1 0-2h2.3L8 5a1 1 0 1 1 1-1.7l1.7 1V3a1 1 0 0 1 1-1Zm0 9a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z',
  fire: 'M13.6 2.5c.2 3.4-2.6 4.7-3.2 7.4-.2.9 0 1.9.6 2.7-2.8-.4-4.2-2.7-3.7-5.3-2.7 2-4.3 5.1-4.3 8.1A9 9 0 1 0 20 11.2c-1.3-3.8-4.8-5.8-6.4-8.7Zm-1.7 18a3.4 3.4 0 0 1-3.3-4.2c.3-1.5 1.4-2.4 2.4-3.5.5 1.2 1.7 1.8 1.7 3.4 0 .9.5 1.7 1.1 2.2a3.4 3.4 0 0 1-1.9 2.1Z',
  tsunami: 'M3 16c1.7 0 1.7-1.7 3.4-1.7S8.1 16 9.8 16s1.7-1.7 3.4-1.7 1.7 1.7 3.4 1.7 1.7-1.7 3.4-1.7v2.2c-1.7 0-1.7 1.7-3.4 1.7s-1.7-1.7-3.4-1.7-1.7 1.7-3.4 1.7-1.7-1.7-3.4-1.7S4.7 20 3 20v-4Z',
  earthquake: 'M5 3h14v7l-2-1.4V14h-2v-3.9l-3-2.1-3 2.1V14H7V8.6L5 10V3Zm5 11h4v7h-4v-7Zm-5 2h3v5H5v-5Zm11 0h3v5h-3v-5Z',
  car: 'M5.1 11 6.7 6.5A2 2 0 0 1 8.6 5h6.8a2 2 0 0 1 1.9 1.5l1.6 4.5A2.5 2.5 0 0 1 21 13.5V17a1 1 0 0 1-1 1h-1v1a1 1 0 0 1-2 0v-1H7v1a1 1 0 0 1-2 0v-1H4a1 1 0 0 1-1-1v-3.5A2.5 2.5 0 0 1 5.1 11Zm2.2-4L6.2 10h11.6l-1.1-3H7.3ZM6.5 15a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm11 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z',
  wrench: 'M14.8 4.1a4 4 0 0 0-5 5L3.4 15.5a2 2 0 1 0 2.8 2.8l6.4-6.4a4 4 0 0 0 5-5l-2.5 2.5-2.8-.7-.7-2.8 2.4-2.4Z',
  road: 'M7 3h10l2 18h-4l-1-7h-4l-1 7H5L7 3Zm4 4v3h2V7h-2Z',
  barrier: 'M3 17h18v3H3v-3Zm2-8h14v6H5V9Zm3 1.5v3h2.5v-3H8Zm5.5 0v3H16v-3h-2.5Z',
  shield: 'M12 2 20 5v6c0 5-3.3 9.3-8 11-4.7-1.7-8-6-8-11V5l8-3Z',
  warning: 'M12 3 2 20h20L12 3Zm1 13h-2v-5h2v5Zm0 2h-2v-1.5h2V18Z',
  search: 'm20 20-4.2-4.2m1.2-4.8a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z',
  person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c.6-4 3-6 7-6s6.4 2 7 6H5Z',
  paw: 'M8.5 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm7 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM5 14a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 5 14Zm14 0a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 19 14Zm-7 0c-3.3 0-5.5 4-3.8 6.1.9 1.1 2.3.6 3.8.6s2.9.5 3.8-.6C17.5 18 15.3 14 12 14Z',
  wind: 'M4 8h9a2 2 0 1 0-2-2m-7 6h13a2 2 0 1 1-2 2m-11 2h7a2 2 0 1 1-2 2',
  bolt: 'm13 2-9 12h7l-1 8 9-12h-7l1-8Z',
  drop: 'M12 2s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11Z',
  sprout: 'M12 21v-8m0 4c-4.6 0-7-2.5-7-7 4.6 0 7 2.5 7 7Zm0-4c0-4.6 2.5-7 7-7 0 4.6-2.5 7-7 7Z',
  leaf: 'M20 4C10 4 4 9.5 4 17c3.9 0 6.6-1.1 8.5-3.4L12 21l2-7.6C17.7 11.2 20 8.1 20 4Z',
}

const iconColorByType = {
  flood: '#1479ef', storm: '#6d5dfb', drought: '#f0b429', wildfire: '#e8333c', tsunami: '#1479ef', earthquake: '#e8333c',
  traffic_accident: '#1479ef', vehicle_obstruction: '#596b8a', road_damage: '#53678a', road_obstruction: '#e8333c', building_fire: '#e84431',
  violent_incident: '#e8333c', lost_item: '#1479ef', missing_person: '#f47b22', dangerous_animal: '#9a5131',
  pm25: '#67809f', chemical_odor: '#14a6a2', power_outage: '#f0a72c', water_supply_outage: '#1479ef',
}

const iconAliases = {
  'activity': 'earthquake', 'building-2': 'earthquake', 'car-front': 'car', 'cloud': 'wind', 'cloud-lightning': 'storm',
  'cloud-rain': 'storm', 'construction': 'road', 'droplet-off': 'drop', 'droplets': 'drop', 'flame': 'fire',
  'flask-conical': 'warning', 'mountain': 'earthquake', 'package-check': 'search', 'package-search': 'search',
  'paw-print': 'paw', 'shield-alert': 'shield', 'sun': 'drought', 'trash-2': 'barrier', 'triangle-alert': 'warning',
  'utility-pole': 'bolt', 'waves': 'flood', 'waves-arrow-up': 'flood', 'zap': 'bolt', 'zap-off': 'bolt',
}
const iconPath = (icon) => iconPaths[iconAliases[icon] ?? icon] ?? iconPaths.warning
const iconColor = (incidentType) => incidentType.markerColor ?? iconColorByType[incidentType.id] ?? '#1479ef'
const groupColor = (categoryCode) => ['natural_disaster', 'environment'].includes(categoryCode) ? '#2ca86a' : '#1479ef'

const selectIncidentType = (incidentType, closePicker = false) => {
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
    suggestedTypesFromApi.value = []
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
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
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

.type-picker-group__heading svg {
  width: 1.9rem;
  height: 1.9rem;
  flex: 0 0 auto;
}

.type-picker-group h3 {
  margin: 0;
  color: #17345f;
  font-size: 1rem;
}

.type-picker-group__heading span {
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

.type-picker-option > svg:first-child {
  width: 1.35rem;
  height: 1.35rem;
  flex: 0 0 auto;
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
