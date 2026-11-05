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
  gap: 9px;
  margin: 0 0 8px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.45;
}

.auth-alert svg {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  margin-top: 1.28px;
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
