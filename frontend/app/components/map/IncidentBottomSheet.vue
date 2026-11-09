<template>
  <!-- แผ่นข้อมูลที่เลื่อนขึ้นจากด้านล่างจอ ใช้แทน popup บนแผนที่ในหน้ามือถือ -->
  <Transition name="incident-sheet">
    <section
      v-if="incident"
      class="incident-sheet"
      role="dialog"
      :aria-label="t('popup.sheetLabel')"
    >
      <!-- แถบจับด้านบน: กดแล้วปิด sheet ได้ -->
      <button
        type="button"
        class="incident-sheet__handle"
        :aria-label="t('popup.close')"
        @click="$emit('close')"
      >
        <span aria-hidden="true"></span>
      </button>

      <!-- ใช้เนื้อหาชุดเดียวกับ popup ของหน้าคอม (มีปุ่ม ✕ ปิดอยู่ในตัว) -->
      <!-- เลือกตามประเภทหมุด: คำขอความช่วยเหลือใช้ popup ของตัวเอง -->
      <HelpRequestMapPopup
        v-if="incident.kind === 'help_request'"
        :incident="incident"
        :get-place-label="getPlaceLabel"
        :t="t"
        in-sheet
        @close="$emit('close')"
        @open-help-request="openHelpRequestPage"
      />
      <IncidentMapPopup
        v-else
        :incident="incident"
        :incident-detail="incidentDetail"
        :get-place-label="getPlaceLabel"
        :t="t"
        in-sheet
        @close="$emit('close')"
        @open-report="(report) => $emit('open-report', report)"
      />

      <!-- คู่มือย่อของประเภทเหตุนี้ (แสดงเฉพาะประเภทที่มีไฟล์คู่มือ) -->
      <section v-if="emergencyGuide" class="incident-sheet__guide" :aria-label="t('quickGuide.label', { topic: emergencyGuide.title })">
        <QuickGuide :guide="emergencyGuide" compact />
      </section>
    </section>
  </Transition>
</template>

<script setup>
import { computed, watch } from 'vue'
import IncidentMapPopup from '~/components/map/IncidentMapPopup.vue'
import HelpRequestMapPopup from '~/components/map/HelpRequestMapPopup.vue'
import QuickGuide from '~/components/guide/QuickGuide.vue'
import { getEmergencyGuideForType } from '~/utils/emergencyGuides'
import { usePlaceNames } from '~/composables/usePlaceNames'
import { openHelpRequestPage } from '~/composables/useHomeDashboard'

const props = defineProps({
  // เหตุการณ์ที่เลือกอยู่ ถ้าเป็น null จะซ่อน sheet
  incident: { type: Object, default: null },
  // รายงานทั้งหมดในเหตุการณ์ (โหลดจาก API หลังกดหมุด)
  incidentDetail: { type: Object, default: null },
})

defineEmits(['close', 'open-report'])

const { loadPlaceNames, getPlaceLabel } = usePlaceNames()
const { t, locale } = useLocale()

const emergencyGuide = computed(() => {
  if (!props.incident || props.incident.kind === 'help_request' || !props.incident.typeCode) return null
  return getEmergencyGuideForType(props.incident.typeCode, locale.value)
})

// ทุกครั้งที่เลือกหมุดใหม่ ให้หาชื่อสถานที่ของหมุดนั้น (ถ้าเคยหาแล้วจะไม่ถามซ้ำ)
watch(
  () => props.incident,
  (incident) => {
    if (incident) {
      loadPlaceNames([incident])
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.incident-sheet {
  position: absolute;
  z-index: 30;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  /* สูงสุด 65% ของจอ ส่วนบนยังเห็นแผนที่และหมุดที่เลือก */
  max-height: 65dvh;
  padding: 4px 16px 16px;
  box-sizing: border-box;
  border-radius: 20px 20px 0 0;
  background: #ffffff;
  box-shadow: 0 -8px 28px rgb(16 41 104 / 18%);
}

/* เนื้อหาใน sheet ใช้ความสูงที่เหลือ และให้รายการรายงานเลื่อนได้ */
.incident-sheet > :deep(.incident-map-popup),
.incident-sheet > :deep(.help-popup) {
  flex: 1;
  min-height: 0;
}

.incident-sheet__guide {
  flex: 0 0 auto;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--gs-line);
}

.incident-sheet__handle {
  display: grid;
  align-self: center;
  width: 64px;
  height: 20px;
  margin-bottom: 6px;
  padding: 0;
  place-items: center;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.incident-sheet__handle span {
  width: 40px;
  height: 5px;
  border-radius: 999px;
  background: #cfdbea;
}

.incident-sheet__handle:focus-visible {
  outline: 3px solid rgb(37 99 235 / 35%);
  outline-offset: 2px;
  border-radius: 8px;
}

/* เลื่อนขึ้นตอนเปิด เลื่อนลงตอนปิด */
.incident-sheet-enter-active,
.incident-sheet-leave-active {
  transition: transform 220ms ease, opacity 220ms ease;
}

.incident-sheet-enter-from,
.incident-sheet-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .incident-sheet-enter-active,
  .incident-sheet-leave-active {
    transition: none;
  }
}
</style>
