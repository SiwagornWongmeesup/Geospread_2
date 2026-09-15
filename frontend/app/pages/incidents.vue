<script setup>
import IncidentCard from '~/components/incidents/IncidentCard.vue';
import IncidentFilter from '~/components/incidents/IncidentFilter.vue';

definePageMeta({
  showRightPanel: false
});
</script>

<template>
  <section class="dashboard-page">
    <header class="dashboard-page__header">
      <h1>เหตุการณ์</h1>
      <p>ค้นหาและติดตามเหตุการณ์ตามพื้นที่ของคุณ</p>
    </header>

    <IncidentFilter />
    <IncidentCard />
  </section>
</template>

<style scoped>
.dashboard-page {
  display: grid;
  gap: 1.25rem;
  padding: 1.5rem;
}

.dashboard-page__header h1 {
  margin: 0;
  color: #123765;
  font-size: 1.75rem;
}

.dashboard-page__header p {
  margin: 0.5rem 0 0;
  color: #60718c;
}
</style>
