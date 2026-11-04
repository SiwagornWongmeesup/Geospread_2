<template>
  <!-- ช่องยอมรับเงื่อนไข: กดได้ทั้งแถว (สูงอย่างน้อย 44px) ส่วนลิงก์อ่านเงื่อนไขแยกออกมาและเปิดแท็บใหม่ ข้อมูลที่กรอกไว้จึงไม่หาย -->
  <div class="auth-terms" :class="{ 'auth-terms--invalid': error }">
    <label :for="id" class="auth-terms__row">
      <input
        :id="id"
        type="checkbox"
        class="auth-terms__checkbox"
        :checked="modelValue"
        aria-required="true"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? `${id}-error` : undefined"
        @change="$emit('update:modelValue', $event.target.checked)"
      />
      <span>{{ t('auth.acceptTermsLabel') }} <b class="auth-terms__required" aria-hidden="true">*</b></span>
    </label>
    <p v-if="error" :id="`${id}-error`" class="auth-terms__error">{{ error }}</p>
    <NuxtLink to="/terms" target="_blank" rel="noopener" class="auth-terms__link">
      {{ t('auth.readTerms') }}
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
      <span class="auth-terms__sr">{{ t('auth.opensNewTab') }}</span>
    </NuxtLink>
  </div>
</template>

<script setup>
defineProps({
  id: { type: String, required: true },
  modelValue: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const { t } = useLocale()
</script>

<style scoped>
.auth-terms {
  margin-top: 1rem;
}

.auth-terms__row {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 0.7rem;
  padding: 0.35rem 0.5rem;
  margin: 0 -0.5rem;
  border-radius: 0.6rem;
  color: #3a5274;
  font-size: 0.88rem;
  line-height: 1.5;
  cursor: pointer;
}

.auth-terms__row:hover {
  background: #f2f6fb;
}

.auth-terms__checkbox {
  flex: 0 0 auto;
  width: 1.25rem;
  height: 1.25rem;
  margin: 0;
  accent-color: #0b5fcc;
  cursor: pointer;
}

.auth-terms__checkbox:focus-visible {
  outline: 2px solid #0b5fcc;
  outline-offset: 3px;
}

.auth-terms--invalid .auth-terms__checkbox {
  outline: 2px solid #be2631;
  outline-offset: 2px;
}

.auth-terms__required {
  color: #c8202a;
}

.auth-terms__error {
  margin: 0.15rem 0 0 1.95rem;
  color: #be2631;
  font-size: 0.8rem;
  font-weight: 650;
}

.auth-terms__link {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 0.3rem;
  margin-left: 1.45rem;
  padding: 0 0.5rem;
  color: #0b5fcc;
  font-size: 0.85rem;
  font-weight: 750;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.auth-terms__link svg {
  width: 0.95rem;
  height: 0.95rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.auth-terms__link:focus-visible {
  outline: 2px solid #0b5fcc;
  outline-offset: 2px;
  border-radius: 0.4rem;
}

.auth-terms__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
