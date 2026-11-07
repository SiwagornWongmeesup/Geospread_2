<template>
  <!-- ข้อมูลส่วนตัว: โหมดดู (รายการ) และโหมดแก้ไข (ฟอร์ม) -->
  <section class="info-card" :aria-labelledby="titleId">
    <header class="info-card__head">
      <h2 :id="titleId">{{ t('profilePage.infoTitle') }}</h2>
      <button v-if="!isEditing" type="button" class="info-card__edit" @click="startEdit">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" /></svg>
        {{ t('profilePage.edit') }}
      </button>
    </header>

    <p v-if="savedMessage" class="info-card__saved" role="status">{{ savedMessage }}</p>

    <!-- โหมดดู -->
    <dl v-if="!isEditing" class="info-list">
      <div v-for="field in fields" :key="field" class="info-list__row">
        <dt>{{ t(`profilePage.fields.${field}`) }}</dt>
        <dd :class="{ 'info-list__empty': !profile[field] }">{{ displayValue(field) }}</dd>
      </div>
    </dl>

    <!-- โหมดแก้ไข -->
    <form v-else class="info-form" novalidate @submit.prevent="submit">
      <div class="info-form__photo">
        <span class="info-form__avatar" aria-hidden="true">
          <img v-if="form.avatarUrl" :src="form.avatarUrl" alt="" />
          <template v-else>{{ initial }}</template>
        </span>
        <div class="info-form__photo-actions">
          <div class="info-form__photo-buttons">
            <label class="info-form__button">
              {{ t('profilePage.changePhoto') }}
              <input type="file" accept="image/jpeg,image/png,image/webp" class="visually-hidden" @change="pickPhoto" />
            </label>
            <button v-if="form.avatarUrl" type="button" class="info-form__button info-form__button--ghost" @click="form.avatarUrl = null">
              {{ t('profilePage.removePhoto') }}
            </button>
          </div>
          <small :class="{ 'info-form__error': errors.photo }">{{ errors.photo || t('profilePage.photoHint') }}</small>
        </div>
      </div>

      <div class="info-form__grid">
        <label v-for="field in fields" :key="field" class="info-form__field" :class="{ 'info-form__field--wide': field === 'email' }">
          <span>{{ t(`profilePage.fields.${field}`) }}</span>
          <input
            v-model.trim="form[field]"
            :type="inputTypes[field]"
            :inputmode="field === 'phone' ? 'tel' : undefined"
            :autocomplete="autocomplete[field]"
            :placeholder="t(`profilePage.placeholders.${field}`)"
            :aria-invalid="errors[field] ? 'true' : undefined"
            :aria-describedby="errors[field] || field === 'email' ? `${titleId}-${field}-note` : undefined"
          />
          <small v-if="errors[field]" :id="`${titleId}-${field}-note`" class="info-form__error">{{ errors[field] }}</small>
          <small v-else-if="field === 'email' && form.email !== profile.email" :id="`${titleId}-${field}-note`">{{ t('profilePage.emailHint') }}</small>
        </label>
      </div>

      <div class="info-form__actions">
        <button type="button" class="info-form__button info-form__button--ghost" :disabled="isSaving" @click="cancelEdit">
          {{ t('profilePage.cancel') }}
        </button>
        <button type="submit" class="info-form__button info-form__button--primary" :disabled="isSaving">
          {{ isSaving ? t('profilePage.saving') : t('profilePage.save') }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
const props = defineProps({
  profile: { type: Object, required: true },
  isSaving: { type: Boolean, default: false },
  // ฟังก์ชันบันทึกจากหน้าโปรไฟล์ รับข้อมูลที่แก้ แล้วคืน Promise<boolean> ว่าสำเร็จไหม
  save: { type: Function, required: true },
  // true = แสดงช่อง LINE ID และ Instagram ด้วย (ใช้ในหน้าโปรไฟล์ของแอดมิน)
  showSocial: { type: Boolean, default: false },
})

const { t } = useLocale()
const titleId = useId()

// ช่องข้อมูลที่แสดง: ช่องพื้นฐานทุกคน + ช่องโซเชียลเฉพาะเมื่อเปิด showSocial
const baseFields = ['name', 'lastname', 'phone', 'email']
const socialFields = ['lineId', 'instagram']
const fields = computed(() => {
  if (props.showSocial) {
    return [...baseFields, ...socialFields]
  }
  return baseFields
})

const inputTypes = { name: 'text', lastname: 'text', phone: 'tel', email: 'email', lineId: 'text', instagram: 'text' }
const autocomplete = { name: 'given-name', lastname: 'family-name', phone: 'tel', email: 'email', lineId: 'off', instagram: 'off' }

const MAX_PHOTO_BYTES = 2 * 1024 * 1024
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const isEditing = ref(false)
const savedMessage = ref('')
const form = reactive({ name: '', lastname: '', phone: '', email: '', lineId: '', instagram: '', avatarUrl: null })
const errors = reactive({ name: '', phone: '', email: '', lineId: '', instagram: '', photo: '' })

// ตัวอักษรแรกของชื่อ (ไม่มีชื่อใช้อีเมล) แทนรูปโปรไฟล์ตอนยังไม่มีรูป
const initial = computed(() => {
  let source = form.name
  if (!source) {
    source = form.email
  }

  const firstLetter = source.charAt(0)
  if (!firstLetter) {
    return '?'
  }
  return firstLetter.toUpperCase()
})

// ข้อความที่แสดงในโหมดดู: ช่องว่างขึ้นว่า "ยังไม่ได้ระบุ", Instagram ใส่ @ นำหน้า
const displayValue = (field) => {
  const value = props.profile[field]
  if (!value) {
    return t('profilePage.notSet')
  }
  if (field === 'instagram') {
    return `@${value}`
  }
  return value
}

// ล้างข้อความ error ทุกช่อง
const clearErrors = () => {
  for (const key of Object.keys(errors)) {
    errors[key] = ''
  }
}

const startEdit = () => {
  // คัดลอกค่าปัจจุบันลงฟอร์ม (ช่องที่ยังไม่มีค่าใช้ข้อความว่าง)
  for (const field of fields.value) {
    form[field] = props.profile[field] ?? ''
  }
  form.avatarUrl = props.profile.avatarUrl ?? null
  clearErrors()
  savedMessage.value = ''
  isEditing.value = true
}

const cancelEdit = () => {
  clearErrors()
  isEditing.value = false
}

// เลือกรูป: ตรวจชนิดและขนาด แล้วแปลงเป็น data URL ไว้แสดงตัวอย่าง (ตอนมี API จะส่งไฟล์ขึ้นแทน)
const pickPhoto = (event) => {
  const input = event.target
  const file = input.files?.[0]
  input.value = ''
  errors.photo = ''
  if (!file) {
    return
  }

  if (!PHOTO_TYPES.includes(file.type)) {
    errors.photo = t('profilePage.errors.photoType')
    return
  }
  if (file.size > MAX_PHOTO_BYTES) {
    errors.photo = t('profilePage.errors.photoSize')
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    form.avatarUrl = reader.result
  }
  reader.readAsDataURL(file)
}

// ---- ตรวจข้อมูลทีละช่อง: คืนข้อความ error หรือข้อความว่างถ้าผ่าน ----

const checkName = () => {
  if (!form.name) {
    return t('profilePage.errors.nameRequired')
  }
  return ''
}

// เบอร์ไทย 9–10 หลัก (เว้นวรรคหรือขีดได้) ไม่บังคับกรอก
const checkPhone = () => {
  if (!form.phone) {
    return ''
  }
  const digits = form.phone.replace(/[\s-]/g, '')
  if (!/^0\d{8,9}$/.test(digits)) {
    return t('profilePage.errors.phoneInvalid')
  }
  return ''
}

const checkEmail = () => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    return t('profilePage.errors.emailInvalid')
  }
  return ''
}

// LINE ID: ตัวอักษรอังกฤษ ตัวเลข จุด ขีด ขีดล่าง 4–20 ตัว ไม่บังคับกรอก
const checkLineId = () => {
  if (!form.lineId) {
    return ''
  }
  if (!/^[a-zA-Z0-9._-]{4,20}$/.test(form.lineId)) {
    return t('profilePage.errors.lineIdInvalid')
  }
  return ''
}

// Instagram: ตัด @ ข้างหน้าออกก่อน แล้วต้องเป็นตัวอักษรอังกฤษ ตัวเลข จุด ขีดล่าง ไม่เกิน 30 ตัว ไม่บังคับกรอก
const checkInstagram = () => {
  form.instagram = form.instagram.replace(/^@+/, '')
  if (!form.instagram) {
    return ''
  }
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(form.instagram)) {
    return t('profilePage.errors.instagramInvalid')
  }
  return ''
}

// ตรวจทุกช่องที่แสดงอยู่ คืน true ถ้าผ่านทั้งหมด
const validate = () => {
  clearErrors()
  errors.name = checkName()
  errors.phone = checkPhone()
  errors.email = checkEmail()
  if (props.showSocial) {
    errors.lineId = checkLineId()
    errors.instagram = checkInstagram()
  }

  const hasError = errors.name || errors.phone || errors.email || errors.lineId || errors.instagram
  if (hasError) {
    return false
  }
  return true
}

// ส่งเฉพาะช่องที่แสดงอยู่ (ผู้ใช้ทั่วไปไม่มีช่องโซเชียล จึงไม่ส่งค่าว่างไปทับ)
const buildChanges = () => {
  const changes = { avatarUrl: form.avatarUrl }
  for (const field of fields.value) {
    changes[field] = form[field]
  }
  return changes
}

const submit = async () => {
  const isValid = validate()
  if (!isValid) {
    return
  }

  const ok = await props.save(buildChanges())
  if (ok) {
    isEditing.value = false
    savedMessage.value = t('profilePage.saved')
  }
}
</script>

<style scoped>
.info-card {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 20px;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
}

.info-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.info-card__head h2 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 17px;
  font-weight: 800;
}

.info-card__edit {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface);
  color: var(--gs-action);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.info-card__edit:hover {
  background: var(--gs-action-tint);
}

.info-card__edit svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.info-card__saved {
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--gs-radius-sm);
  background: #e3f1e8;
  color: var(--gs-verified);
  font-size: 14px;
  font-weight: 700;
}

/* โหมดดู */
.info-list {
  display: grid;
  margin: 0;
}

.info-list__row {
  display: grid;
  grid-template-columns: minmax(110px, 160px) minmax(0, 1fr);
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid var(--gs-line);
}

.info-list__row:first-child {
  border-top: 0;
  padding-top: 0;
}

.info-list dt {
  color: var(--gs-muted);
  font-size: 14px;
  font-weight: 600;
}

.info-list dd {
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--gs-ink);
  font-size: 15px;
  font-weight: 600;
}

.info-list .info-list__empty {
  color: var(--gs-muted);
  font-weight: 500;
}

/* โหมดแก้ไข */
.info-form {
  display: grid;
  gap: 18px;
}

.info-form__photo {
  display: flex;
  align-items: center;
  gap: 16px;
}

.info-form__avatar {
  display: grid;
  width: 72px;
  height: 72px;
  flex: 0 0 auto;
  overflow: hidden;
  place-items: center;
  border-radius: 50%;
  background: var(--gs-action);
  color: #fff;
  font-size: 28px;
  font-weight: 800;
}

.info-form__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-form__photo-actions {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.info-form__photo-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.info-form__photo-actions small,
.info-form__field small {
  color: var(--gs-muted);
  font-size: 13px;
  line-height: 1.45;
}

.info-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.info-form__field {
  display: grid;
  gap: 6px;
}

.info-form__field--wide {
  grid-column: 1 / -1;
}

.info-form__field > span {
  color: var(--gs-ink-2);
  font-size: 14px;
  font-weight: 700;
}

.info-form__field input {
  width: 100%;
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface);
  color: var(--gs-ink);
  font-size: 15px;
}

.info-form__field input:focus {
  border-color: var(--gs-action);
  outline: none;
  box-shadow: var(--gs-focus);
}

.info-form__field input[aria-invalid='true'] {
  border-color: var(--gs-danger);
}

.info-form .info-form__error {
  color: var(--gs-danger);
  font-weight: 600;
}

.info-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.info-form__button {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface);
  color: var(--gs-action);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.info-form__button:hover:not(:disabled) {
  background: var(--gs-action-tint);
}

.info-form__button:focus-within,
.info-form__button:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

.info-form__button--ghost {
  color: var(--gs-ink-2);
}

.info-form__button--primary {
  border-color: var(--gs-action);
  background: var(--gs-action);
  color: #fff;
}

.info-form__button--primary:hover:not(:disabled) {
  background: var(--gs-action-hover);
}

.info-form__button:disabled {
  cursor: progress;
  opacity: 0.7;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 560px) {
  .info-list__row {
    grid-template-columns: minmax(0, 1fr);
    gap: 2px;
  }

  .info-form__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .info-form__actions .info-form__button {
    flex: 1;
  }
}
</style>
