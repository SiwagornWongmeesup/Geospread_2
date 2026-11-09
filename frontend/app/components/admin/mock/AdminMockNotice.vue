<template>
  <!-- แถบบอกว่าหน้านี้เป็นหน้าตัวอย่าง (ข้อมูลจำลอง) + ข้อความเมื่อกดปุ่มที่ยังไม่ทำงานจริง -->
  <div class="mock-notice">
    <p class="mock-notice__banner">{{ t('adminMock.notice') }}</p>
    <p v-if="message" class="mock-notice__message" role="status">
      <span>{{ message }}</span>
      <button type="button" :aria-label="t('admin.bottomNav.close')" @click="emit('close')">×</button>
    </p>
  </div>
</template>

<script setup>
defineProps({
  // ข้อความหลังกดปุ่มคำสั่งตัวอย่าง ('' = ไม่แสดง)
  message: { type: String, default: '' },
})

const emit = defineEmits(['close'])
const { t } = useLocale()
</script>

<style scoped>
.mock-notice {
  display: grid;
  gap: 8px;
}

.mock-notice p {
  margin: 0;
  padding: 10px 14px;
  border-radius: var(--gs-radius-sm);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}

.mock-notice__banner {
  border: 1px solid #ecd9b0;
  background: var(--gs-pending-tint);
  color: var(--gs-pending);
}

.mock-notice__message {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid var(--gs-line);
  background: var(--gs-surface);
  color: var(--gs-ink);
}

.mock-notice__message button {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--gs-ink-2);
  font-size: 20px;
  cursor: pointer;
}

.mock-notice__message button:hover {
  background: var(--gs-surface-sunken);
}
</style>
