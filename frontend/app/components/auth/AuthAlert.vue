<template>
  <!-- กล่องข้อความบนฟอร์ม: error จาก server (สีแดง) หรือแจ้งผลสำเร็จ เช่น สร้างบัญชีแล้ว (สีเขียว) -->
  <p
    class="auth-alert"
    :class="`auth-alert--${tone}`"
    :role="tone === 'error' ? 'alert' : 'status'"
  >
    <svg v-if="tone === 'success'" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
    <svg v-else viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.01" /></svg>
    <span><slot /></span>
  </p>
</template>

<script setup>
defineProps({
  tone: { type: String, default: 'error' },
})
</script>

<style scoped>
.auth-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  margin: 0 0 0.5rem;
  padding: 0.75rem 0.85rem;
  border-radius: 0.65rem;
  font-size: 0.88rem;
  font-weight: 650;
  line-height: 1.45;
}

.auth-alert svg {
  flex: 0 0 auto;
  width: 1.15rem;
  height: 1.15rem;
  margin-top: 0.08rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.2;
}

.auth-alert--error {
  background: #fdeeee;
  color: #a51d27;
}

.auth-alert--success {
  background: #e6f5ec;
  color: #14653a;
}
</style>
