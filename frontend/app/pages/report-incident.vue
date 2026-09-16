<script setup>
import ReportIncidentForm from '~/components/report/ReportIncidentForm.vue'

definePageMeta({ showRightPanel: true })
</script>

<template>
  <section class="report-page">
    <ReportIncidentForm />
  </section>
</template>

<style scoped>
.report-page {
  min-height: 100%;
  padding: 1.5rem;
  background: #f5f8fc;
}
</style>
