<template>
  <!-- ช่องกรอกของหน้าเข้าสู่ระบบ/สมัครสมาชิก: ชื่อช่อง + * ช่องที่ต้องกรอก, คำแนะนำใต้ช่อง, error ใต้ช่อง, ปุ่มดูรหัสผ่าน -->
  <div class="auth-field" :class="{ 'auth-field--invalid': error }">
    <label :for="id" class="auth-field__label">
      {{ label }}
      <b v-if="required" class="auth-field__required" aria-hidden="true">*</b>
    </label>

    <div class="auth-field__control">
      <input
        :id="id"
        :value="modelValue"
        :type="inputType"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :placeholder="placeholder"
        :aria-required="required || undefined"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        class="auth-field__input"
        :class="{ 'auth-field__input--with-toggle': isPassword }"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <button
        v-if="isPassword"
        type="button"
        class="auth-field__toggle"
        :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
        :aria-pressed="showPassword"
        @click="showPassword = !showPassword"
      >
        <!-- ตาเปิด = กดเพื่อดู, ตาขีดฆ่า = กดเพื่อซ่อน -->
        <svg v-if="!showPassword" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 3l18 18" />
          <path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a10 10 0 0 0 5.4-1.6" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </svg>
      </button>
    </div>

    <!-- ไม่ใส่ role="alert" ทุกช่อง: หน้าจะย้ายเคอร์เซอร์ไปช่องแรกที่ผิด แล้วโปรแกรมอ่านหน้าจออ่าน error ของช่องนั้นเอง -->
    <p v-if="error" :id="`${id}-error`" class="auth-field__error">
      {{ error }}
      <slot name="error-action" />
    </p>
    <p v-else-if="hint" :id="`${id}-hint`" class="auth-field__hint">{{ hint }}</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: String, default: '' },
  type: { type: String, default: 'text' },
  autocomplete: { type: String, default: undefined },
  inputmode: { type: String, default: undefined },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  // คำแนะนำที่แสดงใต้ช่องตลอด (ไม่หายตอนพิมพ์เหมือน placeholder)
  hint: { type: String, default: '' },
  // ข้อความ error ของช่องนี้ ถ้ามีจะแสดงแทนคำแนะนำ และขอบช่องเป็นสีแดง
  error: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const { t } = useLocale()

const showPassword = ref(false)
const isPassword = computed(() => props.type === 'password')
const inputType = computed(() => (isPassword.value && showPassword.value ? 'text' : props.type))
const describedBy = computed(() => {
  if (props.error) return `${props.id}-error`
  if (props.hint) return `${props.id}-hint`
  return undefined
})
</script>

<style scoped>
.auth-field {
  display: grid;
  gap: 7px;
  margin-top: 16px;
}

.auth-field__label {
  color: #193a70;
  font-size: 14px;
  font-weight: 750;
}

/* เหมือนฟอร์มรายงานเหตุ: * สีแดงหลังชื่อช่องที่ต้องกรอก */
.auth-field__required {
  margin-left: 2px;
  color: #c8202a;
}

.auth-field__control {
  position: relative;
}

.auth-field__input {
  box-sizing: border-box;
  width: 100%;
  min-height: 50px;
  padding: 0 14px;
  /* ขอบ 3:1 กับพื้นขาว ตามเกณฑ์ WCAG ของขอบช่องกรอก */
  border: 1px solid #7d93ad;
  border-radius: 10px;
  background: #fff;
  color: #17345f;
  font: inherit;
  font-size: 16px;
}

.auth-field__input--with-toggle {
  padding-right: 51px;
}

.auth-field__input::placeholder {
  color: #64758c;
  opacity: 1;
}

/* วงโฟกัสเส้นทึบ เห็นชัดแม้กลางแดด */
.auth-field__input:focus-visible {
  border-color: #0b5fcc;
  outline: 2px solid #0b5fcc;
  outline-offset: 2px;
}

.auth-field--invalid .auth-field__input {
  border-color: #d93a42;
  background: #fffafa;
}

.auth-field--invalid .auth-field__input:focus-visible {
  border-color: #be2631;
  outline-color: #be2631;
}

.auth-field__toggle {
  position: absolute;
  top: 50%;
  right: 6px;
  display: grid;
  width: 44px;
  height: 44px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #52708b;
  cursor: pointer;
  transform: translateY(-50%);
}

.auth-field__toggle:hover {
  background: #eef4fb;
  color: #102968;
}

.auth-field__toggle:focus-visible {
  outline: 2px solid #0b5fcc;
  outline-offset: 0;
}

.auth-field__toggle svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.auth-field__hint,
.auth-field__error {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
}

.auth-field__hint {
  color: #52708b;
}

.auth-field__error {
  color: #be2631;
  font-weight: 650;
}

.auth-field__error :deep(a) {
  margin-left: 4px;
  color: #0b5fcc;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
