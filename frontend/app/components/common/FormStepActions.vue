<template>
  <!-- ปุ่มย้อนกลับ / ถัดไป ของฟอร์มแบบทีละขั้น ขั้นสุดท้ายแสดงปุ่มส่งที่ฟอร์มส่งมาใน slot "submit" -->
  <footer class="step-actions">
    <button v-if="showBack" type="button" class="step-actions__button" :disabled="disabled" @click="$emit('back')">
      {{ t('report.stepBack') }}
    </button>
    <button v-if="!isLast" type="button" class="step-actions__button step-actions__button--primary" @click="$emit('next')">
      {{ t('report.stepNext') }}
    </button>
    <slot v-else name="submit" />
  </footer>
</template>

<script setup>
defineProps({
  showBack: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

defineEmits(['back', 'next'])

const { t } = useLocale()
</script>

<style scoped>
.step-actions {
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  gap: 12px;
}

/* ปุ่มส่งที่มาจาก slot ใช้ class เดียวกัน (:slotted ให้สไตล์นี้ติดกับปุ่มจากฟอร์มด้วย) */
.step-actions__button,
:slotted(.step-actions__button) {
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid #c9d6e6;
  border-radius: 10px;
  background: #fff;
  color: #102968;
  font: inherit;
  font-size: 15px;
  font-weight: 750;
  cursor: pointer;
}

.step-actions__button--primary,
:slotted(.step-actions__button--primary) {
  border-color: #f52c3c;
  background: #f52c3c;
  color: #fff;
  box-shadow: 0 6px 13px rgb(232 51 60 / 18%);
}

.step-actions__button:disabled,
:slotted(.step-actions__button:disabled) {
  cursor: wait;
  opacity: .7;
}

.step-actions__button:focus-visible,
:slotted(.step-actions__button:focus-visible) {
  outline: 3px solid rgb(11 95 204 / 40%);
  outline-offset: 2px;
}
</style>
