<template>
  <section class="request-page">
    <div class="request-page__layout">
      <header class="request-page__intro">
        <h1>{{ t('nav.requestHelp') }}</h1>
        <p>{{ t('requestHelp.pageSubtitle') }}</p>
      </header>

      <!-- ยังไม่ได้เข้าสู่ระบบ: บอกตั้งแต่แรกก่อนเริ่มกรอก -->
      <LoginRequiredNotice
        v-if="!isLoggedIn"
        :message="t('requestHelp.loginRequired')"
        redirect="/request-help"
      />

      <!-- อันตรายต่อชีวิต: โทรก่อน แล้วค่อยขอความช่วยเหลือในแอป -->
      <!-- มือถือ: แสดงเฉพาะขั้นแรก ขั้นอื่นซ่อนไว้ให้พื้นที่กับช่องกรอก -->
      <EmergencyCallStrip v-if="!isWizard || currentStep === 0" />

      <!-- มือถือ: แบ่งฟอร์มเป็นขั้นตอน แถบนี้บอกว่าอยู่ขั้นไหนและเหลืออีกกี่ขั้นถึงส่งคำขอ -->
      <FormSteps v-if="isWizard" ref="stepStatus" :steps="wizardSteps" :current="currentStep" :label="t('requestHelp.stepsLabel')" />

      <div class="request-page__body">
        <RequestHelpForm
          ref="helpForm"
          :location="helpLocation"
          :step="formStep"
          :error-field="stepErrorField"
          error-id="help-step-error"
        />
        <RequestHelpSidePanel
          ref="sidePanel"
          v-show="showLocation"
          v-model:location="helpLocation"
          :is-submitting="helpForm?.isSubmitting ?? false"
          :submission-feedback="helpForm?.feedback ?? ''"
          :hide-submit="isWizard"
          @submit="helpForm?.submit()"
        />
      </div>

      <!-- มือถือ: ข้อความเตือนของขั้นนี้ หรือผลการส่งคำขอ -->
      <p v-if="isWizard && wizardMessage" id="help-step-error" class="request-page__feedback" :class="{ 'request-page__feedback--error': stepError }" role="status">{{ wizardMessage }}</p>

      <FormStepActions
        v-if="isWizard"
        :is-first="currentStep === 0"
        :is-last="isLastStep"
        :disabled="helpForm?.isSubmitting ?? false"
        @cancel="navigateTo('/')"
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
import { computed, nextTick, onMounted, ref } from 'vue'
import RequestHelpForm from '~/components/request-help/RequestHelpForm.vue'
import RequestHelpSidePanel from '~/components/request-help/RequestHelpSidePanel.vue'
import FormSteps from '~/components/common/FormSteps.vue'
import FormStepActions from '~/components/common/FormStepActions.vue'
import LoginRequiredNotice from '~/components/common/LoginRequiredNotice.vue'
import EmergencyCallStrip from '~/components/common/EmergencyCallStrip.vue'

const { t } = useLocale()
const { isMobile } = useResponsiveView()
const { isLoggedIn } = useAuth()

const helpLocation = ref(null)
const helpForm = ref(null)
const sidePanel = ref(null)

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
// ช่องที่กรอกไม่ผ่านในขั้นนี้ ใช้ทำกรอบแดงและผูกข้อความ error กับช่อง
const stepErrorField = ref('')

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

// เลื่อนหน้าขึ้นบนสุด: หน้านี้เลื่อนอยู่ในกล่องเนื้อหาของ layout ไม่ใช่ทั้งหน้าต่าง
const scrollPageToTop = () => {
  window.scrollTo({ top: 0 })
  const pageScroller = document.querySelector('.desktop-shell__main')
  if (pageScroller) {
    pageScroller.scrollTo({ top: 0 })
  }
}

// ยังไม่มีตำแหน่ง: ขอตำแหน่งจากเครื่องให้เลย ผู้ใช้ลากหมุดหรือแตะแผนที่เปลี่ยนเองได้
const locateIfEmpty = () => {
  if (!helpLocation.value) {
    sidePanel.value?.locateAutomatically()
  }
}

const goToStep = async (index) => {
  currentStep.value = Math.min(Math.max(index, 0), wizardSteps.length - 1)
  stepError.value = ''
  stepErrorField.value = ''
  await nextTick()
  // เลื่อนขึ้นบนสุด และให้โปรแกรมอ่านหน้าจออ่านว่าอยู่ขั้นไหน
  scrollPageToTop()
  stepStatus.value?.focus()
  if (currentStepId.value === 'location') {
    locateIfEmpty()
  }
}

// ตรวจข้อมูลของขั้นนี้ก่อนไปขั้นถัดไป ไม่ผ่าน: ขึ้นกรอบแดงและย้ายเคอร์เซอร์ไปช่องนั้น
const nextStep = async () => {
  let problem = null
  if (currentStepId.value === 'location') {
    if (!helpLocation.value) {
      problem = { field: 'location', message: t('requestHelp.needLocation') }
    }
  } else {
    problem = helpForm.value?.validateStep(currentStepId.value) ?? null
  }

  if (problem) {
    stepError.value = problem.message
    stepErrorField.value = problem.field
    await nextTick()
    document.getElementById(`help-${problem.field}`)?.focus()
    return
  }
  goToStep(currentStep.value + 1)
}

// คอมเห็นแผนที่ตั้งแต่เปิดหน้า: ขอตำแหน่งให้เลย (มือถือจะขอตอนถึงขั้นตำแหน่ง)
onMounted(async () => {
  if (!isWizard.value) {
    await nextTick()
    locateIfEmpty()
  }
})

const submitFromWizard = () => {
  stepError.value = ''
  stepErrorField.value = ''
  helpForm.value?.submit()
}
</script>

<style scoped>
.request-page {
  min-height: 100%;
  padding: 16px;
  background: #edf6ff;
}

.request-page__layout {
  display: grid;
  gap: 16px;
  max-width: 1472px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #dce8f5;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 29px rgb(31 72 125 / 8%);
  align-items: stretch;
}

.request-page__intro h1 {
  margin: 0;
  color: #102968;
  font-size: 26px;
}

.request-page__intro p {
  margin: 8px 0 0;
  color: #60718c;
  font-size: 14px;
}

.request-page__body {
  display: grid;
  /* minmax(0, ...) = คอลัมน์หดได้ ไม่ถูกข้อความยาวๆ (เช่น พิกัด) ดันจนล้นกรอบ */
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  gap: 18px;
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

/* มือถือ: ฟอร์มเต็มจอ ไม่มีกรอบการ์ดและพื้นหลังสีฟ้ารอบนอก (เลิกการ์ดซ้อนการ์ด) */
@media (max-width: 767px) {
  /* ฟอร์มสูงเต็มจอ ส่วนเนื้อหาของขั้นยืดกินที่ว่าง ปุ่มย้อนกลับ/ถัดไปจึงอยู่ล่างจอทุกขั้น */
  .request-page {
    display: flex;
    flex-direction: column;
    padding: 0;
    background: var(--gs-surface);
  }

  .request-page__layout {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .request-page__body {
    display: flex;
    flex: 1;
    flex-direction: column;
  }
}

/* จอแคบกว่า 1200px (รวม sidebar) ฟอร์มกับแผนที่อยู่คนละแถว */
@media (max-width: 1199px) {
  .request-page__body {
    /* ใช้ minmax(0, 1fr) แทน 1fr: 1fr จะขยายตามข้อความที่ยาวที่สุด ทำให้กล่องทะลุกรอบ */
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
