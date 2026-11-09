<template>
  <!-- ช่องทางติดต่ออีกฝ่าย (เบอร์ / LINE) + คำเตือนเรื่องโอนเงิน -->
  <div class="contact-card">
    <p class="contact-card__title">{{ title }}</p>
    <strong v-if="name" class="contact-card__name">{{ name }}</strong>

    <div v-if="phone || lineId" class="contact-card__actions">
      <a v-if="phone" :href="`tel:${phone}`" class="contact-card__action contact-card__action--phone">
        <span>{{ t('helpContact.call') }}</span>
        <strong>{{ phone }}</strong>
      </a>
      <a
        v-if="lineId"
        :href="lineUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="contact-card__action contact-card__action--line"
      >
        <span>{{ t('helpContact.addLine') }}</span>
        <strong>{{ lineId }}</strong>
      </a>
    </div>
    <p v-else class="contact-card__empty">{{ emptyText }}</p>

    <p class="contact-card__warning" role="note">
      <strong>{{ t('helpContact.warningTitle') }}</strong>
      {{ t('helpContact.warningText') }}
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  name: { type: String, default: '' },
  phone: { type: String, default: null },
  lineId: { type: String, default: null },
  // ข้อความเมื่อไม่มีช่องทางติดต่อเลย
  emptyText: { type: String, default: '' },
})

const { t } = useLocale()

// ลิงก์เพิ่มเพื่อนด้วย LINE ID (เปิดแอป LINE บนมือถือ)
const lineUrl = computed(() => `https://line.me/ti/p/~${encodeURIComponent(props.lineId)}`)
</script>

<style scoped>
.contact-card {
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-paper);
}

.contact-card__title {
  margin: 0;
  color: var(--gs-muted);
  font-size: 13px;
  font-weight: 600;
}

.contact-card__name {
  margin-top: -6px;
  color: var(--gs-ink);
  font-size: 16px;
}

.contact-card__actions {
  display: grid;
  gap: 8px;
}

.contact-card__action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;
  padding: 0 14px;
  border-radius: var(--gs-radius-sm);
  color: #ffffff;
  font-size: 14px;
  text-decoration: none;
}

.contact-card__action strong {
  font-size: 16px;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.contact-card__action--phone {
  background: var(--gs-help);
}

.contact-card__action--phone:hover {
  background: var(--gs-help-hover);
}

/* สีเขียวของ LINE ปรับให้เข้มพอสำหรับตัวหนังสือสีขาว */
.contact-card__action--line {
  background: #05843b;
}

.contact-card__action--line:hover {
  background: #046b30;
}

.contact-card__action:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

.contact-card__empty {
  margin: 0;
  color: var(--gs-muted);
  font-size: 14px;
}

.contact-card__warning {
  margin: 0;
  padding: 10px 12px;
  border-left: 3px solid var(--gs-pending);
  border-radius: 4px;
  background: var(--gs-pending-tint);
  color: var(--gs-ink-2);
  font-size: 13px;
  line-height: 1.55;
}

.contact-card__warning strong {
  display: block;
  color: var(--gs-pending);
}
</style>
