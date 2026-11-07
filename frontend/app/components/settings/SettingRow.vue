<template>
  <!-- แถวการตั้งค่า 1 รายการ: ชื่อ + คำอธิบาย ด้านซ้าย, ตัวควบคุม (สวิตช์/ตัวเลือก/ปุ่ม) ด้านขวา
       ส่ง toggle = true/false เพื่อใช้สวิตช์เปิด-ปิด หรือใส่ตัวควบคุมเองใน slot -->
  <div class="setting-row" :class="{ 'setting-row--disabled': disabled }">
    <div class="setting-row__text">
      <span :id="labelId" class="setting-row__label">{{ label }}</span>
      <span v-if="hint" :id="hintId" class="setting-row__hint">{{ hint }}</span>
    </div>

    <button
      v-if="toggle !== undefined"
      type="button"
      role="switch"
      class="switch"
      :aria-checked="toggle"
      :aria-labelledby="labelId"
      :aria-describedby="hint ? hintId : undefined"
      :disabled="disabled"
      @click="emit('update:toggle', !toggle)"
    >
      <span class="switch__thumb" aria-hidden="true" />
    </button>

    <slot v-else :label-id="labelId" :hint-id="hintId" />
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  toggle: { type: Boolean, default: undefined },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:toggle'])

const labelId = useId()
const hintId = useId()
</script>

<style scoped>
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 64px;
  padding: 12px 0;
  border-top: 1px solid var(--gs-line);
}

.setting-row__text {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.setting-row__label {
  color: var(--gs-ink);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.45;
}

.setting-row__hint {
  color: var(--gs-muted);
  font-size: 13px;
  line-height: 1.5;
}

.setting-row--disabled .setting-row__text {
  opacity: 0.6;
}

/* สวิตช์เปิด-ปิด */
.switch {
  position: relative;
  flex: 0 0 auto;
  width: 46px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--gs-line-strong);
  cursor: pointer;
  transition: background-color 160ms ease;
}

.switch[aria-checked='true'] {
  background: var(--gs-action);
}

.switch__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgb(23 32 46 / 25%);
  transition: transform 160ms ease;
}

.switch[aria-checked='true'] .switch__thumb {
  transform: translateX(20px);
}

.switch:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

.switch:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

@media (prefers-reduced-motion: reduce) {
  .switch,
  .switch__thumb {
    transition: none;
  }
}
</style>
