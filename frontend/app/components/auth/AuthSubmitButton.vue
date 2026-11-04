<template>
  <!-- ปุ่มส่งฟอร์มของหน้าเข้าสู่ระบบ/สมัคร: ตอนกำลังส่งยังคงสีเดิม (อ่านง่าย) แล้วเพิ่มวงหมุนบอกสถานะ -->
  <button type="submit" class="auth-submit" :disabled="loading" :aria-busy="loading">
    <span v-if="loading" class="auth-submit__spinner" aria-hidden="true" />
    {{ loading ? loadingLabel : label }}
  </button>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  loadingLabel: { type: String, required: true },
  loading: { type: Boolean, default: false },
})
</script>

<style scoped>
.auth-submit {
  display: flex;
  width: 100%;
  min-height: 3.3rem;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 1.5rem;
  border: 0;
  border-radius: 0.65rem;
  /* #0b5fcc กับตัวอักษรขาว = 5.9:1 ผ่านเกณฑ์ WCAG AA */
  background: #0b5fcc;
  color: #fff;
  font: inherit;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 160ms ease;
}

.auth-submit:hover {
  background: #094fa9;
}

.auth-submit:focus-visible {
  outline: 2px solid #0b5fcc;
  outline-offset: 3px;
}

.auth-submit:disabled {
  cursor: progress;
}

.auth-submit__spinner {
  width: 1.05rem;
  height: 1.05rem;
  border: 2px solid rgb(255 255 255 / 40%);
  border-top-color: #fff;
  border-radius: 50%;
  animation: auth-spin 700ms linear infinite;
}

@keyframes auth-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-submit__spinner {
    animation-duration: 2s;
  }
}
</style>
