<template>
  <!-- สถานะการยืนยัน: แต่ละสถานะต่างกันทั้งรูปทรง ไอคอน และข้อความ ไม่ใช้สีอย่างเดียว -->
  <span class="status-badge" :class="`status-badge--${tone}`">
    <svg v-if="tone === 'verified'" viewBox="0 0 16 16" aria-hidden="true">
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
    <svg v-else-if="tone === 'ongoing'" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 5v3.2l2 1.3" />
    </svg>
    <svg v-else-if="tone === 'rejected'" viewBox="0 0 16 16" aria-hidden="true">
      <path d="m4.5 4.5 7 7m0-7-7 7" />
    </svg>
    {{ label }}
  </span>
</template>

<script setup>
defineProps({
  // verified | ongoing | pending | rejected
  tone: { type: String, default: 'pending' },
  label: { type: String, default: 'รอตรวจสอบ' },
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.45rem;
  border: 1px solid transparent;
  border-radius: var(--gs-radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
}

.status-badge svg {
  width: 0.8rem;
  height: 0.8rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.status-badge--verified {
  background: var(--gs-verified);
  color: #fff;
}

.status-badge--ongoing {
  border-color: var(--gs-line-strong);
  background: var(--gs-surface);
  color: var(--gs-ink-2);
}

.status-badge--pending {
  border-style: dashed;
  border-color: currentColor;
  background: var(--gs-pending-tint);
  color: var(--gs-pending);
}

.status-badge--rejected {
  background: var(--gs-surface-sunken);
  color: var(--gs-muted);
  text-decoration: line-through;
}
</style>
