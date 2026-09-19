<template>
  <form class="report-incident-form" @submit.prevent="submitMockReport">
    <header class="report-incident-form__intro">
      <h1>แจ้งเหตุการณ์</h1>
      <p>แจ้งสิ่งที่คุณพบเพื่อให้คนในพื้นที่รับรู้และช่วยเหลือได้เร็วขึ้น</p>
    </header>

    <fieldset class="report-incident-form__section">
      <legend>ประเภทภัยที่เกิดขึ้น</legend>
      <p>เลือกประเภทที่ใกล้เคียงกับเหตุการณ์มากที่สุด</p>
      <div class="incident-type-grid">
        <button v-for="incidentType in reportIncidentTypes" :key="incidentType.id" type="button" class="incident-type" :class="{ 'incident-type--selected': selectedTypeId === incidentType.id }" :aria-pressed="selectedTypeId === incidentType.id" @click="selectedTypeId = incidentType.id">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="typeIcon(incidentType.id)" fill="currentColor" /></svg>
          <span>{{ incidentType.label }}</span>
        </button>
      </div>
    </fieldset>

    <label class="report-incident-form__section report-incident-form__details">
      <span>{{ isOtherType ? 'รายละเอียดเหตุการณ์อื่น' : 'รายละเอียดเหตุการณ์' }}</span>
      <small>{{ isOtherType ? 'ระบุประเภทเหตุการณ์ที่พบ และอธิบายสถานการณ์เพิ่มเติม' : 'ระบุสิ่งที่เกิดขึ้น จุดสังเกต และผลกระทบที่พบ' }}</small>
      <textarea v-model="details" rows="5" maxlength="500" :placeholder="detailsPlaceholder" />
      <em>{{ details.length }}/500</em>
    </label>

    <fieldset class="report-incident-form__section">
      <legend>ระดับความรุนแรง</legend>
      <p>ประเมินจากผลกระทบที่เกิดขึ้น ณ ตอนนี้</p>
      <div class="severity-grid">
        <button v-for="severity in severities" :key="severity.id" type="button" class="severity-option" :class="[{ 'severity-option--selected': selectedSeverityId === severity.id }, `severity-option--${severity.id}`]" :aria-pressed="selectedSeverityId === severity.id" @click="selectedSeverityId = severity.id">
          <span class="severity-option__dot" aria-hidden="true" />
          <span><strong>{{ severity.label }}</strong><small>{{ severity.description }}</small></span>
        </button>
      </div>
    </fieldset>

    <section class="report-incident-form__section report-incident-form__upload" aria-labelledby="upload-heading">
      <h2 id="upload-heading">แนบรูปภาพหรือวิดีโอ <span>(ไม่บังคับ)</span></h2>
      <p>สื่อประกอบช่วยให้ชุมชนและเจ้าหน้าที่เข้าใจสถานการณ์ได้ดีขึ้น</p>
      <input ref="fileInput" type="file" accept="image/jpeg,image/png,video/mp4" class="sr-only" @change="selectFile">
      <button type="button" class="upload-zone" @click="fileInput?.click()">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v12h16V6H4Zm3 10 3.2-4.1 2.4 2.9 1.7-2.1L18 16H7Zm3-5.5A1.5 1.5 0 1 0 10 7.5a1.5 1.5 0 0 0 0 3Z" fill="currentColor" /></svg>
        <span><strong>{{ selectedFileName || 'เลือกรูปภาพหรือวิดีโอ' }}</strong><small>{{ selectedFileName ? 'ไฟล์ตัวอย่างถูกเลือกแล้ว ยังไม่ได้อัปโหลด' : 'รองรับ JPG, PNG และ MP4 ขนาดไม่เกิน 50 MB' }}</small></span>
      </button>
    </section>

    <p v-if="feedback" class="report-incident-form__feedback" role="status">{{ feedback }}</p>
    <footer class="report-incident-form__actions">
      <button type="button" class="button button--secondary" @click="saveMockDraft">บันทึกร่าง</button>
      <button type="submit" class="button button--primary">ส่งรายงาน</button>
    </footer>
  </form>
</template>

<script setup>
import { computed, ref } from 'vue'
import { reportIncidentTypes, useReportIncident } from '~/composables/useReportIncident'

const { selectedTypeId, selectedSeverityId } = useReportIncident()
const details = ref('')
const fileInput = ref(null)
const selectedFileName = ref('')
const feedback = ref('')
const isOtherType = computed(() => selectedTypeId.value === 'other')
const detailsPlaceholder = computed(() => isOtherType.value
  ? 'เช่น ไฟฟ้าดับทั้งชุมชน มีผู้สูงอายุต้องใช้อุปกรณ์ไฟฟ้า'
  : 'เช่น มีน้ำท่วมขังบนถนน รถสัญจรลำบาก และเริ่มมีผู้ต้องการความช่วยเหลือ')

const severities = [
  { id: 'low', label: 'ต่ำ', description: 'ผลกระทบเล็กน้อย' },
  { id: 'medium', label: 'ปานกลาง', description: 'เริ่มส่งผลต่อพื้นที่' },
  { id: 'high', label: 'สูง', description: 'ต้องติดตามอย่างเร่งด่วน' },
  { id: 'critical', label: 'วิกฤต', description: 'อาจเป็นอันตรายต่อชีวิต' },
]

const iconPaths = {
  flood: 'M3 17c1.7 0 1.7-1.5 3.4-1.5S8.1 17 9.8 17s1.7-1.5 3.4-1.5 1.7 1.5 3.4 1.5 1.7-1.5 3.4-1.5v2c-1.7 0-1.7 1.5-3.4 1.5s-1.7-1.5-3.4-1.5-1.7 1.5-3.4 1.5-1.7-1.5-3.4-1.5S4.7 20 3 20v-3Zm2-9 7-5 7 5v6h-2V9.1l-5-3.6-5 3.6V14H5V8Z',
  storm: 'M6.2 18h9.6a4.2 4.2 0 0 0 .7-8.34A5.2 5.2 0 0 0 6.1 11.1 3.5 3.5 0 0 0 6.2 18Zm5.1-6.2h2.2l-1 2.2H14l-3.4 5 .9-3H10l1.3-4.2Z',
  drought: 'M12 2a1 1 0 0 1 1 1v1.3l1.7-1a1 1 0 1 1 1 1.7l-1.7 1H16a1 1 0 1 1 0 2h-2.3l1.7 1a1 1 0 1 1-1 1.7L12.7 9.7V12a1 1 0 1 1-2 0V9.7L9 10.7a1 1 0 1 1-1-1.7l1.7-1H7.4a1 1 0 1 1 0-2h2.3L8 5a1 1 0 1 1 1-1.7l1.7 1V3a1 1 0 0 1 1-1Zm0 9a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z',
  wildfire: 'M13.6 2.5c.2 3.4-2.6 4.7-3.2 7.4-.2.9 0 1.9.6 2.7-2.8-.4-4.2-2.7-3.7-5.3-2.7 2-4.3 5.1-4.3 8.1A9 9 0 1 0 20 11.2c-1.3-3.8-4.8-5.8-6.4-8.7Zm-1.7 18a3.4 3.4 0 0 1-3.3-4.2c.3-1.5 1.4-2.4 2.4-3.5.5 1.2 1.7 1.8 1.7 3.4 0 .9.5 1.7 1.1 2.2a3.4 3.4 0 0 1-1.9 2.1Z',
  tsunami: 'M3 16c1.7 0 1.7-1.7 3.4-1.7S8.1 16 9.8 16s1.7-1.7 3.4-1.7 1.7 1.7 3.4 1.7 1.7-1.7 3.4-1.7v2.2c-1.7 0-1.7 1.7-3.4 1.7s-1.7-1.7-3.4-1.7-1.7 1.7-3.4 1.7-1.7-1.7-3.4-1.7S4.7 20 3 20v-4Zm1-4.5c1.7-4.3 5.2-6.5 10.5-6.5 3.1 0 5.3.9 6.5 2.6-3.4-.5-5.7.1-7.1 1.8-1.8-1.1-3.7-.9-5.8.6-1 .7-2.4 1.2-4.1 1.5Z',
  earthquake: 'M5 3h14v7l-2-1.4V14h-2v-3.9l-3-2.1-3 2.1V14H7V8.6L5 10V3Zm5 11h4v7h-4v-7Zm-5 2h3v5H5v-5Zm11 0h3v5h-3v-5Z',
  other: 'M5 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm7 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm7 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
}

const typeIcon = (type) => iconPaths[type]
const selectFile = (event) => { selectedFileName.value = event.target.files?.[0]?.name ?? '' }
const saveMockDraft = () => { feedback.value = 'บันทึกข้อมูลตัวอย่างแล้ว ข้อมูลนี้ยังอยู่เฉพาะในหน้าจอนี้' }
const submitMockReport = () => { feedback.value = 'ยังไม่เชื่อมต่อระบบส่งรายงาน ข้อมูลตัวอย่างยังไม่ได้ถูกส่งไปยังระบบ' }
</script>

<style scoped>
/* Report incident form */

.report-incident-form {
  display: grid;
  gap: 1.5rem;
  width: 100%;
  padding: 1.75rem;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 8px 24px rgb(31 72 125 / 10%);
}

.report-incident-form h1 {
  margin: 0;
  color: #102968;
  font-size: 1.65rem;
}

.report-incident-form__intro p {
  margin: 0.5rem 0 0;
  color: #60718c;
  font-size: 0.9rem;
}

.report-incident-form__section {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.report-incident-form__section legend,
.report-incident-form__details > span,
.report-incident-form__upload h2 {
  margin: 0;
  padding: 0;
  color: #142d5b;
  font-size: 1.05rem;
  font-weight: 800;
}

.report-incident-form__section > p,
.report-incident-form__details > small {
  display: block;
  margin: 0.3rem 0 0.75rem;
  color: #60718c;
  font-size: 0.82rem;
  line-height: 1.45;
}

.incident-type-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.65rem;
}

.incident-type {
  display: grid;
  min-height: 7.4rem;
  padding: 0.75rem 0.4rem;
  place-items: center;
  gap: 0.55rem;
  border: 1px solid #dae5f2;
  border-radius: 0.75rem;
  background: #fff;
  color: #2d4d7e;
  font: inherit;
  font-size: 0.77rem;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 160ms ease, background 160ms ease, color 160ms ease, transform 160ms ease;
}

.incident-type svg {
  width: 2.5rem;
  height: 2.5rem;
  color: #1479ef;
}

.incident-type:hover,
.incident-type:focus-visible {
  border-color: #77afea;
  background: #f6faff;
  outline: none;
  transform: translateY(-2px);
}

.incident-type--selected {
  border-color: #e6333c;
  background: #fff6f6;
  color: #b7212a;
}

.incident-type--selected svg {
  color: #e6333c;
}

.severity-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
}

.severity-option {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 5.7rem;
  padding: 0.7rem;
  border: 1px solid #dae5f2;
  border-radius: 0.7rem;
  background: #fff;
  color: #274166;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.severity-option:hover,
.severity-option:focus-visible {
  border-color: #77afea;
  background: #f6faff;
  outline: none;
}

.severity-option--selected {
  border-color: #e6333c;
  background: #fff8f8;
}

.severity-option__dot {
  width: 1.65rem;
  height: 1.65rem;
  flex: 0 0 auto;
  border-radius: 50%;
}

.severity-option strong,
.severity-option small {
  display: block;
}

.severity-option strong {
  font-size: 0.8rem;
}

.severity-option small {
  margin-top: 0.15rem;
  color: #72819a;
  font-size: 0.68rem;
  line-height: 1.3;
}

.severity-option--low .severity-option__dot {
  background: #49b96e;
}

.severity-option--medium .severity-option__dot {
  background: #f0b429;
}

.severity-option--high .severity-option__dot {
  background: #f47b22;
}

.severity-option--critical .severity-option__dot {
  background: #e6333c;
}

.report-incident-form__details {
  position: relative;
  display: grid;
}

.report-incident-form__details textarea {
  min-height: 8rem;
  padding: 0.8rem 0.85rem 1.75rem;
  border: 1px solid #bfcde0;
  border-radius: 0.65rem;
  background: #fff;
  color: #17345f;
  font: inherit;
  font-size: 0.88rem;
  line-height: 1.5;
  resize: vertical;
}

.report-incident-form__details textarea:focus-visible {
  border-color: #1479ef;
  outline: 3px solid rgb(20 121 239 / 16%);
}

.report-incident-form__details em {
  position: absolute;
  right: 0.75rem;
  bottom: 0.55rem;
  color: #70819b;
  font-size: 0.7rem;
  font-style: normal;
}

.report-incident-form__upload h2 span {
  color: #71809a;
  font-size: 0.8rem;
  font-weight: 600;
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
  margin: -0.4rem 0 0;
  padding: 0.7rem 0.8rem;
  border-radius: 0.6rem;
  background: #edf6ff;
  color: #24558e;
  font-size: 0.8rem;
  line-height: 1.4;
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

@media (max-width: 60rem) {
  .incident-type-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .severity-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 34rem) {
  .report-incident-form {
    padding: 1rem;
  }

  .incident-type-grid,
  .severity-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
