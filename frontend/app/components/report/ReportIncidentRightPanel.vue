<template>
  <aside class="report-incident-side-panel" aria-label="ตำแหน่งเกิดเหตุและการส่งรายงาน">
    <LocationPicker />
    <slot name="action" />
  </aside>
</template>

<script setup>
import LocationPicker from '~/components/report/LocationPicker.vue'
</script>

<style scoped>
/* ============================== Side Panel Container ============================== */

.report-incident-side-panel {
  display: grid;
  align-content: start;
  gap: 0.875rem;
  padding: 0;
  background: transparent;
}
</style>
