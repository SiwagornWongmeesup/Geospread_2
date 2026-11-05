<template>
  <!-- ปุ่มของฟอร์มแบบทีละขั้น: ขั้นแรก = ยกเลิก (ออกจากฟอร์ม), ขั้นอื่น = ย้อนกลับ
       ขั้นสุดท้ายแสดงปุ่มส่งที่ฟอร์มส่งมาใน slot "submit" -->
  <footer class="step-actions">
    <button v-if="isFirst" type="button" class="step-actions__button" :disabled="disabled" @click="$emit('cancel')">
      {{ t('report.stepCancel') }}
    </button>
    <button v-else type="button" class="step-actions__button" :disabled="disabled" @click="$emit('back')">
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
  // ขั้นแรก: ปุ่มซ้ายเป็น "ยกเลิก" แทน "ย้อนกลับ"
  isFirst: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

defineEmits(['back', 'next', 'cancel'])

const { t } = useLocale()
</script>

<style scoped>
.step-actions {
  /* ติดอยู่ล่างจอพอดีเหนือแถบเมนูล่าง กดได้ด้วยนิ้วโป้งเสมอ ไม่ต้องเลื่อนหา
     bottom: 0 เพราะกล่องที่เลื่อนได้ของหน้าเว้นที่ให้แถบเมนูล่างไว้แล้ว (ถ้าใส่ 71px จะลอยสูงขึ้นไปบังเนื้อหา) */
  position: sticky;
  z-index: 5;
  bottom: 0;
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  gap: 12px;
  margin: 0 -4px;
  padding: 10px 4px;
  background: var(--gs-surface);
  box-shadow: 0 -10px 12px -12px rgb(16 41 104 / 35%);
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
  border-color: var(--gs-action);
  background: var(--gs-action);
  color: #fff;
  box-shadow: 0 6px 13px rgb(29 53 87 / 18%);
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
