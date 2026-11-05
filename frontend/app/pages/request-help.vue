<template>
  <section class="request-page">
    <div class="request-page__layout">
      <header class="request-page__intro">
        <h1>{{ t('nav.requestHelp') }}</h1>
        <p>{{ t('requestHelp.pageSubtitle') }}</p>
      </header>

      <!-- มือถือ: แบ่งฟอร์มเป็นขั้นตอน แถบนี้บอกว่าอยู่ขั้นไหนและเหลืออีกกี่ขั้นถึงส่งคำขอ -->
      <FormSteps v-if="isWizard" ref="stepStatus" :steps="wizardSteps" :current="currentStep" :label="t('requestHelp.stepsLabel')" />

      <div class="request-page__body">
        <RequestHelpForm ref="helpForm" :location="helpLocation" :step="formStep" />
        <RequestHelpSidePanel
          v-show="showLocation"
          v-model:location="helpLocation"
          :is-submitting="helpForm?.isSubmitting ?? false"
          :submission-feedback="helpForm?.feedback ?? ''"
          :hide-submit="isWizard"
          @submit="helpForm?.submit()"
        />
      </div>

      <!-- มือถือ: ข้อความเตือนของขั้นนี้ หรือผลการส่งคำขอ -->
      <p v-if="isWizard && wizardMessage" class="request-page__feedback" :class="{ 'request-page__feedback--error': stepError }" role="status">{{ wizardMessage }}</p>

      <FormStepActions
        v-if="isWizard"
        :show-back="currentStep > 0"
        :is-last="isLastStep"
        :disabled="helpForm?.isSubmitting ?? false"
        @back="goToStep(currentStep - 1)"
        @next="nextStep"
      >
        <template #submit>
          <button type="button" class="step-actions__button step-actions__button--primary" :disabled="helpForm?.isSubmitting ?? false" @click="submitFromWizard">
            {{ helpForm?.isSubmitting ? t('requestHelp.submitting') : t('requestHelp.submit') }}
          </button>
        </template>
      </FormStepActions>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import RequestHelpForm from '~/components/request-help/RequestHelpForm.vue'
import RequestHelpSidePanel from '~/components/request-help/RequestHelpSidePanel.vue'
import FormSteps from '~/components/common/FormSteps.vue'
import FormStepActions from '~/components/common/FormStepActions.vue'

const { t } = useLocale()
const { isMobile } = useResponsiveView()

const helpLocation = ref(null)
const helpForm = ref(null)

// ---- ขั้นตอนบนมือถือ: ประเภท → รายละเอียด → ตำแหน่ง → รูปภาพและส่ง (คอมแสดงทุกส่วนพร้อมกันเหมือนเดิม) ----
const isWizard = computed(() => isMobile.value)
const wizardSteps = [
  { id: 'type', label: 'requestHelp.stepType' },
  { id: 'details', label: 'requestHelp.stepDetails' },
  { id: 'location', label: 'requestHelp.stepLocation' },
  { id: 'media', label: 'requestHelp.stepMedia' },
]
const currentStep = ref(0)
const stepStatus = ref(null)
const stepError = ref('')

const currentStepId = computed(() => wizardSteps[currentStep.value].id)
const isLastStep = computed(() => currentStep.value === wizardSteps.length - 1)

// ส่วนของฟอร์มที่จะแสดง: คอมส่ง null (แสดงทุกส่วน) / ขั้นตำแหน่งไม่มีส่วนของฟอร์ม
const formStep = computed(() => {
  if (!isWizard.value) return null
  return currentStepId.value
})

const showLocation = computed(() => {
  if (!isWizard.value) return true
  return currentStepId.value === 'location'
})

// ข้อความที่แสดงเหนือปุ่ม: error ของขั้นนี้ก่อน ถ้าไม่มีใช้ผลจากการส่ง
const wizardMessage = computed(() => {
  if (stepError.value) return stepError.value
  return helpForm.value?.feedback ?? ''
})

const goToStep = async (index) => {
  currentStep.value = Math.min(Math.max(index, 0), wizardSteps.length - 1)
  stepError.value = ''
  await nextTick()
  // เลื่อนขึ้นบนสุด และให้โปรแกรมอ่านหน้าจออ่านว่าอยู่ขั้นไหน
  window.scrollTo({ top: 0 })
  stepStatus.value?.focus()
}

// ตรวจข้อมูลของขั้นนี้ก่อนไปขั้นถัดไป
const nextStep = () => {
  let message = ''
  if (currentStepId.value === 'location') {
    if (!helpLocation.value) {
      message = t('requestHelp.needLocation')
    }
  } else {
    message = helpForm.value?.validateStep(currentStepId.value) ?? ''
  }

  if (message) {
    stepError.value = message
    return
  }
  goToStep(currentStep.value + 1)
}

const submitFromWizard = () => {
  stepError.value = ''
  helpForm.value?.submit()
}
</script>

<style scoped>
.request-page {
  min-height: 100%;
  padding: 1rem;
  background: #edf6ff;
}

.request-page__layout {
  display: grid;
  gap: 1rem;
  max-width: 92rem;
  margin: 0 auto;
  padding: 1.25rem;
  border: 1px solid #dce8f5;
  border-radius: .85rem;
  background: #fff;
  box-shadow: 0 .65rem 1.8rem rgb(31 72 125 / 8%);
  align-items: stretch;
}

.request-page__intro h1 {
  margin: 0;
  color: #102968;
  font-size: 1.65rem;
}

.request-page__intro p {
  margin: .5rem 0 0;
  color: #60718c;
  font-size: .9rem;
}

.request-page__body {
  display: grid;
  grid-template-columns: minmax(22rem, 2fr) minmax(31rem, 3fr);
  gap: 1.15rem;
  align-items: stretch;
}

/* ข้อความเตือนของขั้นตอนบนมือถือ */
.request-page__feedback {
  margin: 0;
  padding: 10px 13px;
  border-radius: 10px;
  background: #eef4fb;
  color: #102968;
  font-size: 14px;
  font-weight: 650;
}

.request-page__feedback--error {
  background: #fff4f4;
  color: #b42318;
}

@media (max-width: 58rem) {
  .request-page {
    padding: 1rem;
  }

  .request-page__body {
    grid-template-columns: 1fr;
  }
}
</style>
