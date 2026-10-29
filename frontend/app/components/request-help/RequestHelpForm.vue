<template>
  <form class="help-form" @submit.prevent="submit">
    <section>
      <h2><b>1</b> ต้องการความช่วยเหลือด้านใด</h2>
      <div class="type-grid">
        <button v-for="item in types" :key="item.id"
          type="button"
          :class="{ selected: type === item.id }"
          @click="type = item.id"><strong>{{ item.icon }}</strong>
          <span>{{item.label }}</span>
          <small>{{ item.desc }}</small>
          </button>
        </div>
      <div v-if="type === 'other'" class="other"><label>หรือระบุประเภทอื่น
        <input v-model="customType"placeholder="เช่น ต้องการไฟฉายและแบตเตอรี่" /></label>
      </div>
    </section>

    <section>
      <h2><b>2</b> รายละเอียดเพิ่มเติม</h2><textarea v-model="details" maxlength="500"
        placeholder="เช่น จำนวนคน สถานการณ์ตอนนี้ และสิ่งที่ต้องการเป็นพิเศษ" />
        <small class="count">{{ details.length}}/500</small>
    </section>
    <section>
      <h2><b>3</b> จำนวนผู้ที่ต้องการความช่วยเหลือ</h2>
      <!-- ช่องระบุจำนวนคนเป็นตัวเลข ค่านี้ส่งไป API เป็น people_count -->
      <label class="people-custom">
        ระบุจำนวนคน
        <span class="people-custom__field">
          <input
            v-model="peopleCount"
            type="number"
            min="1"
            max="999"
            step="1"
            inputmode="numeric"
            placeholder="เช่น 3"
          />
          <span class="people-custom__unit">คน</span>
        </span>
      </label>
    </section>
    <section class="media-upload">
      <h2><b>4</b> เพิ่มรูปภาพ <span>(ไม่บังคับ)</span></h2>
      <input ref="fileInput" class="sr-only" type="file" multiple accept="image/jpeg,image/png" :disabled="isSubmitting" @change="selectFiles">
      <button type="button" class="upload" :disabled="isSubmitting" @click="fileInput?.click()">
        ▣
        <span>
          <strong>{{ selectedMediaLabel }}</strong>
          <small>{{ selectedFiles.length ? `เพิ่มแล้ว ${selectedFiles.length}/5 รูป` : 'รองรับ JPG และ PNG สูงสุด 5 รูป รูปละไม่เกิน 20 MB' }}</small>
        </span>
      </button>
      <ul v-if="selectedFiles.length" class="selected-media" aria-label="รูปภาพที่เลือก">
        <li v-for="(item, index) in selectedFiles" :key="`${item.file.name}-${item.file.lastModified}`" :title="item.file.name">
          <img :src="item.previewUrl" :alt="`ตัวอย่าง ${item.file.name}`">
          <span class="selected-media__details"><strong>{{ item.file.name }}</strong><small>{{ formatFileSize(item.file.size) }}</small></span>
          <button type="button" :disabled="isSubmitting" :aria-label="`ลบ ${item.file.name}`" @click="removeSelectedFile(index)">ลบ</button>
        </li>
      </ul>
    </section>
  </form>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
const props = defineProps({
  location: { type: Object, default: null },
})

const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:5000'
const { getToken } = useAuth()
const types = [{ id: 'evacuation', label: 'อพยพ', desc: 'ต้องการย้ายไปที่ปลอดภัย', icon: '↗' }, { id: 'medical', label: 'การแพทย์', desc: 'ต้องการการดูแล', icon: '+' }, { id: 'food', label: 'อาหารและน้ำ', desc: 'ต้องการเสบียง', icon: '▤' }, { id: 'shelter', label: 'ที่พักพิง', desc: 'ต้องการที่พัก', icon: '⌂' }, { id: 'vehicle', label: 'พาหนะ', desc: 'ต้องการการเดินทาง', icon: '▰' }, { id: 'other', label: 'อื่น ๆ', desc: 'ระบุความต้องการ', icon: '•••' }]
const type = ref('evacuation'); const customType = ref(''); const details = ref(''); const fileInput = ref(null); const selectedFiles = ref([]); const feedback = ref('')
const isSubmitting = ref(false)
// จำนวนคนที่ต้องการความช่วยเหลือ (ผู้ใช้พิมพ์เอง เริ่มต้นที่ 1)
const peopleCount = ref(1)
const maxImageFiles = 5
const maxImageFileSizeBytes = 20 * 1024 * 1024
const selectedMediaLabel = computed(() => {
  if (!selectedFiles.value.length) return 'เลือกรูปภาพ'
  if (selectedFiles.value.length === 1) return selectedFiles.value[0].file.name
  return `เลือกรูปภาพแล้ว ${selectedFiles.value.length} รูป`
})

const selectFiles = (event) => {
  const files = Array.from(event.target.files ?? [])

  if (selectedFiles.value.length + files.length > maxImageFiles) {
    feedback.value = 'แนบรูปภาพได้สูงสุด 5 รูปต่อคำขอ'
    event.target.value = ''
    return
  }

  if (files.some((file) => file.size > maxImageFileSizeBytes)) {
    feedback.value = 'รูปภาพแต่ละรูปต้องมีขนาดไม่เกิน 20 MB'
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

const submit = async () => {
  const description = details.value.trim()
  const location = props.location

  if (!location) {
    feedback.value = 'กรุณาเลือกตำแหน่งที่ต้องการความช่วยเหลือก่อนส่งคำขอ'
    return
  }

  if (description.length < 5) {
    feedback.value = 'กรุณากรอกรายละเอียดอย่างน้อย 5 ตัวอักษร'
    return
  }

  if (type.value === 'other' && !customType.value.trim()) {
    feedback.value = 'กรุณาระบุประเภทความช่วยเหลืออื่น ๆ'
    return
  }

  // จำนวนคนต้องเป็นเลขจำนวนเต็ม 1–999 (ตรงกับที่ backend รับ)
  const people = Number(peopleCount.value)
  if (!Number.isInteger(people) || people < 1 || people > 999) {
    feedback.value = 'กรุณาระบุจำนวนผู้ที่ต้องการความช่วยเหลือเป็นตัวเลข 1 ถึง 999 คน'
    return
  }

  const authToken = getToken()
  if (!authToken) {
    feedback.value = 'กรุณาเข้าสู่ระบบก่อนส่งคำขอความช่วยเหลือ'
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
      ? `ส่งคำขอ #${helpRequestId} สำเร็จแล้ว กำลังกลับไปหน้าแผนที่…`
      : 'ส่งคำขอความช่วยเหลือสำเร็จแล้ว กำลังกลับไปหน้าแผนที่…'
    clearSelectedFiles()
    setTimeout(() => navigateTo('/'), 1500)
  } catch (error) {
    feedback.value = error?.data?.message ?? 'ส่งคำขอไม่สำเร็จ กรุณาลองอีกครั้ง'
  } finally {
    isSubmitting.value = false
  }
}

defineExpose({ submit, isSubmitting, feedback })
</script>

<style scoped>
.help-form {
  display: grid;
  gap: 1rem;
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
  margin: 0 0 .8rem;
  font-size: 1.02rem;
}

.help-form h2 b {
  display: inline-grid;
  width: 1.8rem;
  height: 1.8rem;
  margin-right: .5rem;
  place-items: center;
  border-radius: 50%;
  background: #eb2631;
  color: #fff;
}

.help-form h2 span {
  color: #72819a;
  font-size: .8rem;
  font-weight: 500;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .55rem;
}

.type-grid button {
  display: grid;
  min-height: 5rem;
  gap: .35rem;
  padding: .65rem .55rem;
  border: 1px solid #d8e5f2;
  border-radius: .7rem;
  background: #fff;
  color: #264b80;
  font: inherit;
  cursor: pointer;
}

.type-grid strong {
  color: #1479ef;
  font-size: 1.7rem;
}

.type-grid span {
  font-size: .78rem;
  font-weight: 800;
}

.type-grid small {
  color: #70819b;
  font-size: .66rem;
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
  gap: .75rem;
  margin-top: .75rem;
}

.other label {
  display: grid;
  gap: .35rem;
  color: #355477;
  font-size: .78rem;
  font-weight: 700;
}

.help-form input,
select,
textarea {
  box-sizing: border-box;
  width: 100%;
  padding: .75rem;
  border: 1px solid #c7d8e9;
  border-radius: .6rem;
  color: #17345f;
  font: inherit;
}

.help-form textarea {
  min-height: 6.25rem;
  resize: vertical;
}

.count {
  position: absolute;
  right: .75rem;
  bottom: .6rem;
  color: #70819b;
  font-size: .7rem;
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
  gap: .8rem;
  width: 100%;
  min-height: 4.75rem;
  border: 1px dashed #89a8cf;
  border-radius: .7rem;
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
  gap: .45rem;
  margin: .6rem 0 0;
  padding: 0;
  list-style: none;
}

.selected-media li {
  position: relative;
  display: grid;
  grid-template-rows: 3.25rem auto;
  gap: .3rem;
  min-width: 0;
  padding: .3rem;
  border: 1px solid #dbe6f2;
  border-radius: .5rem;
  background: #f9fbff;
}

.selected-media img {
  width: 100%;
  height: 3.25rem;
  border-radius: .3rem;
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
  font-size: .68rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-media__details small {
  margin-top: .12rem;
  color: #7284a9;
  font-size: .62rem;
}

.selected-media button {
  position: absolute;
  top: .45rem;
  right: .45rem;
  padding: .23rem .3rem;
  border: 0;
  border-radius: .25rem;
  background: rgb(130 35 45 / 88%);
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: .6rem;
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
  margin-top: .2rem;
  color: #70819b;
  font-size: .72rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

@media (max-width: 34rem) {
  .other {
    grid-template-columns: 1fr;
  }

}
</style>
