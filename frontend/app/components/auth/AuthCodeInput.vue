<template>
  <!-- ช่องรหัส 6 หลักจากอีเมล ใช้ทั้งหน้ายืนยันอีเมลและหน้าลืมรหัสผ่าน -->
  <div class="auth-code" :class="{ 'auth-code--invalid': error }">
    <label :for="id" class="auth-code__label">
      {{ label }} <b aria-hidden="true">*</b>
    </label>
    <!-- ช่องเดียว 6 หลัก: มือถือขึ้นแป้นตัวเลข และเติมรหัสจากอีเมล/SMS ให้อัตโนมัติได้ -->
    <input
      :id="id"
      :value="modelValue"
      class="auth-code__input"
      type="text"
      inputmode="numeric"
      autocomplete="one-time-code"
      maxlength="6"
      placeholder="••••••"
      aria-required="true"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${id}-error` : `${id}-hint`"
      @input="onInput"
    />
    <p v-if="error" :id="`${id}-error`" class="auth-code__error">{{ error }}</p>
    <p v-else :id="`${id}-hint`" class="auth-code__hint">{{ hint }}</p>
  </div>
</template>

<script setup>
defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

// รับเฉพาะตัวเลข 6 หลัก (วางรหัสที่มีช่องว่างหรือขีดมาก็ได้)
const onInput = (event) => {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 6)
  event.target.value = digits
  emit('update:modelValue', digits)
}
</script>

<style scoped>
.auth-code {
  display: grid;
  gap: 7px;
  margin-top: 16px;
}

.auth-code__label {
  color: #193a70;
  font-size: 14px;
  font-weight: 750;
}

.auth-code__label b {
  color: #c8202a;
}

.auth-code__input {
  box-sizing: border-box;
  width: 100%;
  min-height: 64px;
  padding: 0 16px;
  border: 1px solid #7d93ad;
  border-radius: 12px;
  background: #fff;
  color: #102968;
  font: inherit;
  font-size: 32px;
  font-variant-numeric: tabular-nums;
  font-weight: 800;
  letter-spacing: 0.5em;
  text-align: center;
}

.auth-code__input::placeholder {
  color: #64758c;
  letter-spacing: 0.5em;
}

.auth-code__input:focus-visible {
  border-color: #0b5fcc;
  outline: 2px solid #0b5fcc;
  outline-offset: 2px;
}

.auth-code--invalid .auth-code__input {
  border-color: #d93a42;
  background: #fffafa;
}

.auth-code--invalid .auth-code__input:focus-visible {
  border-color: #be2631;
  outline-color: #be2631;
}

.auth-code__hint,
.auth-code__error {
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
}

.auth-code__hint {
  color: #52708b;
}

.auth-code__error {
  color: #be2631;
  font-weight: 650;
}
</style>
