<template>
  <!-- แถบบอกขั้นตอนของฟอร์มบนมือถือ: "ขั้นตอนที่ 2 จาก 4" + วงกลมเลขขั้น ต่อกันด้วยเส้น
       ใช้ร่วมกันระหว่างฟอร์มแจ้งเหตุและฟอร์มขอความช่วยเหลือ -->
  <nav class="form-steps" :aria-label="label">
    <p ref="statusText" class="form-steps__status" tabindex="-1">
      {{ t('report.stepOf', { current: current + 1, total: steps.length }) }}
      <span class="sr-only">{{ t(steps[current].label) }}</span>
    </p>
    <ol class="form-steps__list" :style="{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }">
      <li
        v-for="(step, index) in steps"
        :key="step.id"
        class="form-steps__item"
        :class="{ 'form-steps__item--done': index < current, 'form-steps__item--current': index === current }"
        :aria-current="index === current ? 'step' : undefined"
      >
        <span class="form-steps__dot" aria-hidden="true">
          <svg v-if="index < current" viewBox="0 0 24 24"><path d="m6.5 12.5 3.5 3.5 7.5-8" /></svg>
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span class="form-steps__name">{{ t(step.label) }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
defineProps({
  // [{ id, label }] label เป็น key ของข้อความใน locales
  steps: { type: Array, required: true },
  // ลำดับขั้นปัจจุบัน เริ่มที่ 0
  current: { type: Number, default: 0 },
  label: { type: String, default: '' },
})

const { t } = useLocale()
const statusText = ref(null)

// ให้ฟอร์มเรียกตอนเปลี่ยนขั้น โปรแกรมอ่านหน้าจอจะอ่านว่าอยู่ขั้นไหน
const focus = () => {
  statusText.value?.focus({ preventScroll: true })
}

defineExpose({ focus })
</script>

<style scoped>
.form-steps {
  display: grid;
  gap: 11px;
}

.form-steps__status {
  margin: 0;
  color: #52708b;
  font-size: 14px;
  font-weight: 650;
}

.form-steps__status:focus,
.form-steps__status:focus-visible {
  outline: none;
}

.form-steps__list {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}

.form-steps__item {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 6px;
  min-width: 0;
  text-align: center;
}

/* เส้นเชื่อมระหว่างขั้น: ขั้นที่ผ่านแล้วเป็นสีน้ำเงิน */
.form-steps__item + .form-steps__item::before {
  position: absolute;
  top: 14px;
  right: 50%;
  left: -50%;
  height: 2px;
  background: #d5e1ee;
  content: '';
}

.form-steps__item--done + .form-steps__item::before {
  background: #0b5fcc;
}

.form-steps__dot {
  position: relative;
  z-index: 1;
  display: grid;
  width: 29px;
  height: 29px;
  place-items: center;
  border: 2px solid #b8c8da;
  border-radius: 50%;
  background: #fff;
  color: #52708b;
  font-size: 13px;
  font-weight: 800;
}

.form-steps__dot svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.6;
}

.form-steps__item--current .form-steps__dot {
  border-color: #0b5fcc;
  background: #0b5fcc;
  color: #fff;
  box-shadow: 0 0 0 4px rgb(11 95 204 / 15%);
}

.form-steps__item--done .form-steps__dot {
  border-color: #0b5fcc;
  background: #e8f1fd;
  color: #0b5fcc;
}

.form-steps__name {
  overflow: hidden;
  max-width: 100%;
  color: #52708b;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.form-steps__item--current .form-steps__name {
  color: #102968;
  font-weight: 800;
}
</style>
