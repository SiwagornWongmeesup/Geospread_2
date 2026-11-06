<script setup>
import ReportIncidentForm from '~/components/report/ReportIncidentForm.vue'

definePageMeta({ showRightPanel: false })
</script>

<template>
  <section class="report-page">
    <ReportIncidentForm />
  </section>
</template>

<style scoped>
.report-page {
  min-height: 100%;
  padding: 16px;
  background: #edf6ff;
}

/* มือถือ: ฟอร์มเต็มจอ ไม่ต้องมีพื้นหลังสีฟ้ารอบการ์ด (เลิกการ์ดซ้อนการ์ด) */
@media (max-width: 767px) {
  .report-page {
    /* ให้ฟอร์มยืดสูงเต็มจอ ปุ่มของแต่ละขั้นจะได้อยู่ล่างจอเสมอ */
    display: flex;
    flex-direction: column;
    padding: 0;
    background: var(--gs-surface);
  }
}
</style>
