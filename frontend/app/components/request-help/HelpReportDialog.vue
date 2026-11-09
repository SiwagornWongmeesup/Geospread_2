<template>
  <!-- หน้าต่างรายงานผู้ใช้ที่น่าสงสัย (ใช้ <dialog> ของเบราว์เซอร์ กด Esc ปิดได้เอง) -->
  <dialog ref="dialogElement" class="report-dialog" :aria-labelledby="titleId" @close="handleClose">
    <form v-if="!isDone" class="report-dialog__form" @submit.prevent="sendReport">
      <h2 :id="titleId">{{ t('helpReport.title', { name: targetName }) }}</h2>
      <p class="report-dialog__hint">{{ t('helpReport.hint') }}</p>

      <fieldset>
        <legend>{{ t('helpReport.reasonLabel') }}</legend>
        <label v-for="reasonKey in REASONS" :key="reasonKey" class="report-dialog__reason">
          <input v-model="reason" type="radio" name="report-reason" :value="reasonKey">
          <span>{{ t(`helpReport.reasons.${reasonKey}`) }}</span>
        </label>
      </fieldset>

      <label class="report-dialog__details">
        <span>{{ t('helpReport.detailsLabel') }} <small>{{ t('report.optional') }}</small></span>
        <textarea v-model="details" rows="3" maxlength="500" :placeholder="t('helpReport.detailsPlaceholder')"></textarea>
      </label>

      <p v-if="errorMessage" class="report-dialog__error" role="alert">{{ errorMessage }}</p>

      <div class="report-dialog__actions">
        <button type="button" class="report-dialog__button" @click="closeDialog">{{ t('helpDetail.cancel') }}</button>
        <button type="submit" class="report-dialog__button report-dialog__button--danger" :disabled="!reason || isSending">
          {{ isSending ? t('helpReport.sending') : t('helpReport.submit') }}
        </button>
      </div>
    </form>

    <div v-else class="report-dialog__done" role="status">
      <h2 :id="titleId">{{ t('helpReport.doneTitle') }}</h2>
      <p>{{ t('helpReport.doneText') }}</p>
      <button type="button" class="report-dialog__button report-dialog__button--primary" @click="closeDialog">{{ t('helpReport.close') }}</button>
    </div>
  </dialog>
</template>

<script setup>
import { getApiErrorMessage } from '~/utils/apiError'

const props = defineProps({
  // เปิด/ปิดหน้าต่าง
  open: { type: Boolean, default: false },
  helpRequestId: { type: Number, required: true },
  // ชื่อคนที่ถูกรายงาน (แสดงในหัวข้อ)
  targetName: { type: String, default: '' },
  // มี offerId = เจ้าของคำขอรายงานผู้ช่วยคนนั้น / null = ผู้ช่วยรายงานผู้ขอ
  offerId: { type: Number, default: null },
})

const emit = defineEmits(['close', 'reported'])

const REASONS = ['asked_money', 'no_show', 'fake_request', 'harassment', 'other']

const { t } = useLocale()
const { getToken } = useAuth()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:5000'
const titleId = useId()

const dialogElement = ref(null)
const reason = ref('')
const details = ref('')
const isSending = ref(false)
const errorMessage = ref('')
const isDone = ref(false)

// เปิดใหม่ทุกครั้ง: ล้างฟอร์มก่อน
watch(() => props.open, (isOpen) => {
  if (!dialogElement.value) {
    return
  }
  if (isOpen) {
    reason.value = ''
    details.value = ''
    errorMessage.value = ''
    isDone.value = false
    dialogElement.value.showModal()
  } else if (dialogElement.value.open) {
    dialogElement.value.close()
  }
})

const closeDialog = () => {
  dialogElement.value?.close()
}

// ปิดด้วยปุ่มหรือ Esc: บอกหน้าแม่ ถ้าส่งรายงานสำเร็จแล้วให้หน้าแม่โหลดข้อมูลใหม่ด้วย
const handleClose = () => {
  if (isDone.value) {
    emit('reported')
  }
  emit('close')
}

const sendReport = async () => {
  isSending.value = true
  errorMessage.value = ''
  try {
    await $fetch(`${apiBase}/help-requests/${props.helpRequestId}/reports`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: { offer_id: props.offerId, reason: reason.value, details: details.value.trim() },
    })
    isDone.value = true
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('helpReport.failed'))
  } finally {
    isSending.value = false
  }
}
</script>

<style scoped>
.report-dialog {
  width: min(440px, calc(100vw - 32px));
  padding: 0;
  border: 0;
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
  color: var(--gs-ink);
  box-shadow: 0 24px 64px rgb(23 32 46 / 24%);
}

.report-dialog::backdrop {
  background: rgb(23 32 46 / 45%);
}

.report-dialog__form,
.report-dialog__done {
  display: grid;
  gap: 14px;
  padding: 24px;
}

.report-dialog h2 {
  margin: 0;
  font-size: 19px;
  line-height: 1.4;
}

.report-dialog__hint,
.report-dialog__done p {
  margin: 0;
  color: var(--gs-muted);
  font-size: 14px;
  line-height: 1.55;
}

.report-dialog fieldset {
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0;
  border: 0;
}

.report-dialog legend {
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 700;
}

.report-dialog__reason {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 0 10px;
  border-radius: var(--gs-radius-sm);
  font-size: 15px;
  cursor: pointer;
}

.report-dialog__reason:hover {
  background: var(--gs-surface-sunken);
}

.report-dialog__reason input {
  width: 18px;
  height: 18px;
  accent-color: var(--gs-danger);
}

.report-dialog__details {
  display: grid;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
}

.report-dialog__details small {
  color: var(--gs-muted);
  font-weight: 400;
}

.report-dialog__details textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
  color: var(--gs-ink);
  font: inherit;
  font-size: 15px;
  font-weight: 400;
  resize: vertical;
}

.report-dialog__details textarea:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

.report-dialog__error {
  margin: 0;
  color: var(--gs-danger);
  font-size: 14px;
}

.report-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.report-dialog__button {
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface);
  color: var(--gs-ink);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.report-dialog__button--danger {
  border-color: var(--gs-danger);
  background: var(--gs-danger);
  color: #ffffff;
}

.report-dialog__button--primary {
  border-color: var(--gs-action);
  background: var(--gs-action);
  color: #ffffff;
}

.report-dialog__button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.report-dialog__button:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}
</style>
