<template>
  <form class="help-form" :class="{ 'help-form--wizard': step }" @submit.prevent="submit">
    <section v-show="showSection('type')">
      <h2><b>1</b> {{ t('requestHelp.step1') }}</h2>
      <div
        id="help-type"
        class="type-grid"
        role="group"
        tabindex="-1"
        :aria-label="t('requestHelp.step1')"
        :aria-invalid="invalid('type')"
        :aria-describedby="describedBy('type')"
      >
        <button v-for="item in types" :key="item.id"
          type="button"
          :class="{ selected: type === item.id }"
          :aria-pressed="type === item.id"
          @click="type = item.id">
          <!-- ไอคอนชุด OCHA (ไอคอนงานด้านมนุษยธรรม) ชุดเดียวกับประเภทเหตุการณ์ -->
          <img :src="item.icon" alt="" class="type-grid__icon" />
          <span>{{ t(`requestHelp.types.${item.id}.label`) }}</span>
          <small>{{ t(`requestHelp.types.${item.id}.desc`) }}</small>
          </button>
        </div>
      <div v-if="type === 'other'" class="other"><label>{{ t('requestHelp.otherLabel') }}
        <input id="help-other" v-model="customType" :placeholder="t('requestHelp.otherPlaceholder')" :aria-invalid="invalid('other')" :aria-describedby="describedBy('other')" /></label>
      </div>
    </section>

    <section v-show="showSection('details')">
      <h2><b>2</b> {{ t('requestHelp.step2') }}</h2><textarea id="help-details" v-model="details" maxlength="500"
        :placeholder="t('requestHelp.detailsPlaceholder')"
        :aria-invalid="invalid('details')"
        :aria-describedby="describedBy('details')" />
        <small class="count">{{ details.length}}/500</small>
    </section>
    <section v-show="showSection('details')">
      <h2><b>3</b> {{ t('requestHelp.step3') }}</h2>
      <!-- ช่องระบุจำนวนคนเป็นตัวเลข ค่านี้ส่งไป API เป็น people_count -->
      <label class="people-custom">
        {{ t('requestHelp.peopleLabel') }}
        <span class="people-custom__field">
          <input
            id="help-people"
            v-model="peopleCount"
            :aria-invalid="invalid('people')"
            :aria-describedby="describedBy('people')"
            type="number"
            min="1"
            max="999"
            step="1"
            inputmode="numeric"
            :placeholder="t('requestHelp.peoplePlaceholder')"
          />
          <span class="people-custom__unit">{{ t('requestHelp.peopleUnit') }}</span>
        </span>
      </label>
    </section>
    <section v-show="showSection('media')" class="media-upload">
      <h2><b>4</b> {{ t('requestHelp.step4') }} <span>{{ t('report.optional') }}</span></h2>
      <input ref="fileInput" class="sr-only" type="file" multiple accept="image/jpeg,image/png" :disabled="isSubmitting" @change="selectFiles">
      <button type="button" class="upload" :disabled="isSubmitting" @click="fileInput?.click()">
        <img src="/icons/Photo.svg" alt="" class="upload__icon" />
        <span>
          <strong>{{ selectedMediaLabel }}</strong>
          <small>{{ selectedFiles.length ? t('requestHelp.imagesAdded', { count: selectedFiles.length, max: maxImageFiles }) : t('requestHelp.imageLimits') }}</small>
        </span>
      </button>
      <ul v-if="selectedFiles.length" class="selected-media" :aria-label="t('requestHelp.selectedImages')">
        <li v-for="(item, index) in selectedFiles" :key="`${item.file.name}-${item.file.lastModified}`" :title="item.file.name">
          <img :src="item.previewUrl" :alt="t('report.previewOf', { name: item.file.name })">
          <span class="selected-media__details"><strong>{{ item.file.name }}</strong><small>{{ formatFileSize(item.file.size) }}</small></span>
          <button type="button" :disabled="isSubmitting" :aria-label="t('report.removeFile', { name: item.file.name })" @click="removeSelectedFile(index)">{{ t('report.remove') }}</button>
        </li>
      </ul>
    </section>
  </form>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
const props = defineProps({
  location: { type: Object, default: null },
  // มือถือแบ่งเป็นขั้นตอน: ส่ง id ของขั้นที่จะแสดง ('type' | 'details' | 'media') ถ้าเป็น null แสดงทุกส่วน (คอม)
  step: { type: String, default: null },
  // ช่องที่กรอกไม่ผ่านในขั้นนี้ ('type' | 'other' | 'details' | 'people' | '') และ id ของข้อความ error
  errorField: { type: String, default: '' },
  errorId: { type: String, default: '' },
})

// ช่องนี้มี error ไหม: ใช้ทำกรอบแดง และให้ screen reader อ่านข้อความ error พร้อมชื่อช่อง
const invalid = (field) => {
  if (props.errorField === field) return 'true'
  return undefined
}
const describedBy = (field) => {
  if (props.errorField === field) return props.errorId
  return undefined
}

// แสดงส่วนนี้ไหม: คอมแสดงทุกส่วน มือถือแสดงเฉพาะส่วนของขั้นปัจจุบัน
const showSection = (sectionStep) => {
  if (!props.step) return true
  return props.step === sectionStep
}

const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:5000'
const { getToken } = useAuth()
const { t } = useLocale()
// ชื่อและคำอธิบายของแต่ละประเภทอยู่ใน locales: requestHelp.types.<id>
const types = [
  { id: 'evacuation', icon: '/icons/Internally-displaced.svg' },
  { id: 'medical', icon: '/icons/Health.svg' },
  { id: 'food', icon: '/icons/Food.svg' },
  { id: 'shelter', icon: '/icons/Shelter.svg' },
  { id: 'vehicle', icon: '/icons/Bus.svg' },
  { id: 'other', icon: '/icons/More-options.svg' },
]
// ไม่เลือกประเภทไว้ให้ก่อน คนที่รีบจะได้ไม่ส่งผิดประเภทโดยไม่ตั้งใจ
const type = ref(''); const customType = ref(''); const details = ref(''); const fileInput = ref(null); const selectedFiles = ref([]); const feedback = ref('')
const isSubmitting = ref(false)
// จำนวนคนที่ต้องการความช่วยเหลือ (ผู้ใช้พิมพ์เอง เริ่มต้นที่ 1)
const peopleCount = ref(1)
const maxImageFiles = 5
const maxImageFileSizeBytes = 20 * 1024 * 1024
const selectedMediaLabel = computed(() => {
  if (!selectedFiles.value.length) return t('requestHelp.chooseImages')
  if (selectedFiles.value.length === 1) return selectedFiles.value[0].file.name
  return t('requestHelp.imagesSelected', { count: selectedFiles.value.length })
})

const selectFiles = (event) => {
  const files = Array.from(event.target.files ?? [])

  if (selectedFiles.value.length + files.length > maxImageFiles) {
    feedback.value = t('requestHelp.tooManyImages', { count: maxImageFiles })
    event.target.value = ''
    return
  }

  if (files.some((file) => file.size > maxImageFileSizeBytes)) {
    feedback.value = t('requestHelp.imageTooLarge')
    event.target.value = ''
    return
  }

  selectedFiles.value.push(...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })))
  feedback.value = ''
  event.target.value = ''
}

const formatFileSize = (size) => `${Math.max(1, Math.round(size / 1024 / 1024 * 10) / 10)} MB`
const clearSelectedFiles = () => {
  selectedFiles.value.forEach((item) => URL.revokeObjectURL(item.previewUrl))
  selectedFiles.value = []
}
const removeSelectedFile = (index) => {
  const [removed] = selectedFiles.value.splice(index, 1)
  if (removed) URL.revokeObjectURL(removed.previewUrl)
}

onBeforeUnmount(clearSelectedFiles)

// ตรวจข้อมูลของแต่ละขั้นก่อนไปขั้นถัดไป
// คืน { field, message } ของช่องแรกที่ไม่ผ่าน หรือ null ถ้าผ่านหมด
const validateStep = (stepId) => {
  if (stepId === 'type') {
    if (!type.value) {
      return { field: 'type', message: t('requestHelp.needType') }
    }
    if (type.value === 'other' && !customType.value.trim()) {
      return { field: 'other', message: t('requestHelp.needOtherType') }
    }
  }

  if (stepId === 'details') {
    if (details.value.trim().length < 5) {
      return { field: 'details', message: t('requestHelp.needDetails') }
    }
    const people = Number(peopleCount.value)
    if (!Number.isInteger(people) || people < 1 || people > 999) {
      return { field: 'people', message: t('requestHelp.needPeople') }
    }
  }

  return null
}

const submit = async () => {
  const description = details.value.trim()
  const location = props.location

  if (!location) {
    feedback.value = t('requestHelp.needLocation')
    return
  }

  if (description.length < 5) {
    feedback.value = t('requestHelp.needDetails')
    return
  }

  if (!type.value) {
    feedback.value = t('requestHelp.needType')
    return
  }

  if (type.value === 'other' && !customType.value.trim()) {
    feedback.value = t('requestHelp.needOtherType')
    return
  }

  // จำนวนคนต้องเป็นเลขจำนวนเต็ม 1–999 (ตรงกับที่ backend รับ)
  const people = Number(peopleCount.value)
  if (!Number.isInteger(people) || people < 1 || people > 999) {
    feedback.value = t('requestHelp.needPeople')
    return
  }

  const authToken = getToken()
  if (!authToken) {
    feedback.value = t('requestHelp.needLogin')
    return
  }

  isSubmitting.value = true
  feedback.value = ''

  try {
    const response = await $fetch(`${apiBase}/help-requests`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        help_type: type.value,
        custom_help_type: type.value === 'other' ? customType.value.trim() : null,
        description,
        people_count: people,
        lat: location.lat,
        lng: location.lng,
        location_source: location.source ?? 'unknown',
      },
    })

    const helpRequestId = response.data?.help_request_id
    feedback.value = helpRequestId
      ? t('requestHelp.submittedWithId', { id: helpRequestId })
      : t('requestHelp.submitted')
    clearSelectedFiles()
    setTimeout(() => navigateTo('/'), 1500)
  } catch (error) {
    feedback.value = error?.data?.message ?? t('requestHelp.submitFailed')
  } finally {
    isSubmitting.value = false
  }
}

defineExpose({ submit, validateStep, isSubmitting, feedback })
</script>

<style scoped>
/* ช่องที่กรอกไม่ผ่าน: กรอบแดง */
.help-form [aria-invalid='true'] {
  border-color: var(--gs-danger) !important;
  box-shadow: 0 0 0 1px var(--gs-danger);
}

.help-form .type-grid[aria-invalid='true'] {
  padding: 4px;
  border: 1px solid var(--gs-danger);
  border-radius: 12px;
}

/* มือถือแบบทีละขั้น: ซ่อนเลขหน้าหัวข้อ (1, 2, 3...) เพราะแถบขั้นตอนด้านบนบอกลำดับอยู่แล้ว */
.help-form.help-form--wizard h2 b {
  display: none;
}

.help-form {
  display: grid;
  gap: 16px;
  align-content: start;
  min-width: 0;
  padding: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  color: #102968;
}

.help-form section {
  position: relative;
}

.help-form h2 {
  margin: 0 0 13px;
  font-size: 16px;
}

.help-form h2 b {
  display: inline-grid;
  width: 29px;
  height: 29px;
  margin-right: 8px;
  place-items: center;
  border-radius: 50%;
  background: var(--gs-danger);
  color: #fff;
}

.help-form h2 span {
  color: #72819a;
  font-size: 13px;
  font-weight: 500;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.type-grid button {
  display: grid;
  min-height: 80px;
  gap: 6px;
  padding: 10px 9px;
  border: 1px solid #d8e5f2;
  border-radius: 11px;
  background: #fff;
  color: #264b80;
  font: inherit;
  cursor: pointer;
}

.type-grid__icon {
  width: 30px;
  height: 30px;
}

.upload__icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.type-grid span {
  font-size: 12px;
  font-weight: 800;
}

.type-grid small {
  color: #52708b;
  font-size: 12px;
  line-height: 1.3;
}

.type-grid button.selected,
.type-grid button:hover {
  border-color: #1479ef;
  background: #f2f8ff;
}

.other {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

.other label {
  display: grid;
  gap: 6px;
  color: #355477;
  font-size: 12px;
  font-weight: 700;
}

.help-form input,
select,
textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 12px;
  border: 1px solid #c7d8e9;
  border-radius: 10px;
  color: #17345f;
  font: inherit;
}

.help-form textarea {
  min-height: 100px;
  resize: vertical;
}

.count {
  position: absolute;
  right: 12px;
  bottom: 10px;
  color: #52708b;
  font-size: 12px;
}

/* ช่องระบุจำนวนคน */
.people-custom {
  display: grid;
  gap: 6px;
  color: #355477;
  font-size: 13px;
  font-weight: 700;
}

.people-custom__field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.help-form .people-custom__field input {
  width: 140px;
}

.people-custom__unit {
  color: #274166;
  font-size: 15px;
  font-weight: 800;
}

.upload {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 13px;
  width: 100%;
  min-height: 76px;
  border: 1px dashed #89a8cf;
  border-radius: 11px;
  background: #fbfdff;
  color: #2b5b9a;
  font: inherit;
  cursor: pointer;
}

.upload:disabled,
.selected-media button:disabled {
  cursor: not-allowed;
  opacity: .7;
}

.upload strong,
.upload small {
  display: block;
  text-align: left;
}

.selected-media {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 7px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.selected-media li {
  position: relative;
  display: grid;
  grid-template-rows: 52px auto;
  gap: 5px;
  min-width: 0;
  padding: 5px;
  border: 1px solid #dbe6f2;
  border-radius: 8px;
  background: #f9fbff;
}

.selected-media img {
  width: 100%;
  height: 52px;
  border-radius: 5px;
  object-fit: cover;
}

.selected-media__details {
  min-width: 0;
}

.selected-media__details strong,
.selected-media__details small {
  display: block;
}

.selected-media__details strong {
  overflow: hidden;
  color: #29457a;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-media__details small {
  margin-top: 1.92px;
  color: #7284a9;
  font-size: 12px;
}

.selected-media button {
  position: absolute;
  top: 7px;
  right: 7px;
  padding: 4px 5px;
  border: 0;
  border-radius: 4px;
  background: rgb(130 35 45 / 88%);
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
}

.selected-media button:focus-visible {
  outline: 2px solid #1479ef;
  outline-offset: 2px;
}

.selected-media button:disabled {
  cursor: not-allowed;
  opacity: .5;
}

.upload small {
  margin-top: 3px;
  color: #52708b;
  font-size: 12px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

@media (max-width: 544px) {
  .other {
    grid-template-columns: 1fr;
  }

}
</style>
