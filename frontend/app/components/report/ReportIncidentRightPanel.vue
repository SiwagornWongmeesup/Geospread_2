<template>
  <aside class="report-incident-side-panel" :aria-label="t('report.sidePanelLabel')">
    <LocationPicker ref="picker" />
    <slot name="action" />
  </aside>
</template>

<script setup>
import LocationPicker from '~/components/report/LocationPicker.vue'
const { t } = useLocale()
const picker = ref(null)

// ให้ฟอร์มสั่งขอตำแหน่งปัจจุบันได้ (เช่น ตอนเข้าขั้นตำแหน่งแล้วยังไม่มีตำแหน่ง)
const locate = () => {
  picker.value?.locateAutomatically()
}

defineExpose({ locate })
</script>

<style scoped>
/* ============================== Side Panel Container ============================== */

.report-incident-side-panel {
  display: grid;
  /* คอลัมน์หดได้ตามกรอบ ไม่ถูกข้อความพิกัดที่ยาว (ห้ามตัดบรรทัด) ดันให้กว้างเกินกรอบ */
  grid-template-columns: minmax(0, 1fr);
  align-content: start;
  gap: 14px;
  padding: 0;
  background: transparent;
}
</style>
