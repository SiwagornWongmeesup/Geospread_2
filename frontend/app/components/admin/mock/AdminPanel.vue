<template>
  <!-- แผงข้อมูลของหน้าแอดมิน: หัวข้อ + ปุ่มด้านขวา (slot actions) + เนื้อหา
       ตาราง (class="admin-table") และป้ายสถานะ (class="admin-pill") ในแผงนี้ใช้สไตล์เดียวกันทุกหน้า -->
  <section class="admin-panel" :aria-labelledby="titleId">
    <header class="admin-panel__head">
      <h2 :id="titleId">{{ title }}</h2>
      <div v-if="$slots.actions" class="admin-panel__actions"><slot name="actions" /></div>
    </header>
    <div class="admin-panel__body" :class="{ 'admin-panel__body--flush': flush }">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  // true = เนื้อหาชิดขอบ (เช่น ตาราง)
  flush: { type: Boolean, default: false },
})

const titleId = useId()
</script>

<style scoped>
.admin-panel {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
  color: var(--gs-ink);
}

.admin-panel__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 56px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--gs-line);
}

.admin-panel__head h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.4;
}

.admin-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.admin-panel__body {
  padding: 16px 20px;
}

.admin-panel__body--flush {
  padding: 0;
  overflow-x: auto;
}

/* ---- ตารางและป้ายที่ใช้ร่วมกัน ---- */
.admin-panel :deep(.admin-table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.admin-panel :deep(.admin-table th) {
  padding: 10px 20px;
  border-bottom: 1px solid var(--gs-line);
  color: var(--gs-ink-2);
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  white-space: nowrap;
}

.admin-panel :deep(.admin-table td) {
  padding: 12px 20px;
  border-bottom: 1px solid var(--gs-line);
  vertical-align: middle;
}

.admin-panel :deep(.admin-table tbody tr:last-child td) {
  border-bottom: 0;
}

.admin-panel :deep(.admin-muted) {
  color: var(--gs-ink-2);
}

.admin-panel :deep(.admin-pill) {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface-sunken);
  color: var(--gs-ink-2);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.admin-panel :deep(.admin-pill--waiting) {
  background: var(--gs-help-tint);
  color: var(--gs-help-hover);
}

.admin-panel :deep(.admin-pill--active) {
  background: var(--gs-action-tint);
  color: var(--gs-action);
}

.admin-panel :deep(.admin-pill--done) {
  background: #e3f1e8;
  color: var(--gs-verified);
}

.admin-panel :deep(.admin-button) {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface);
  color: var(--gs-action);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
}

.admin-panel :deep(.admin-button:hover) {
  background: var(--gs-action-tint);
}

.admin-panel :deep(.admin-button--primary) {
  border-color: var(--gs-action);
  background: var(--gs-action);
  color: #fff;
}

.admin-panel :deep(.admin-button--primary:hover) {
  background: var(--gs-action-hover);
}

.admin-panel :deep(.admin-button:focus-visible) {
  outline: none;
  box-shadow: var(--gs-focus);
}

@media (max-width: 640px) {
  .admin-panel__head,
  .admin-panel__body {
    padding-right: 16px;
    padding-left: 16px;
  }

  .admin-panel :deep(.admin-table th),
  .admin-panel :deep(.admin-table td) {
    padding-right: 16px;
    padding-left: 16px;
  }
}
</style>
