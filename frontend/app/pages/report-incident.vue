<script setup>
import LocationPicker from '~/components/report/LocationPicker.vue';
import ReportIncidentForm from '~/components/report/ReportIncidentForm.vue';

definePageMeta({
  showRightPanel: false
});
</script>

<template>
  <section class="report-page">
    <ReportIncidentForm>
      <template #location>
        <LocationPicker />
      </template>
    </ReportIncidentForm>
  </section>
</template>

<style scoped>
.report-page {
  padding: 1.5rem;
}
</style>
