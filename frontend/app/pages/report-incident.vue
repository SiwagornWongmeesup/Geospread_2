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
  padding: 1rem;
  background: #edf6ff;
}
</style>
