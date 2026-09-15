<script setup>
import HelpRequests from '~/components/dashboard/HelpRequests.vue';

definePageMeta({
  showRightPanel: false
});
</script>

<template>
  <section class="dashboard-page">
    <header class="dashboard-page__header">
      <h1>คำขอความช่วยเหลือ</h1>
      <p>ดูและจัดการคำขอความช่วยเหลือที่เกี่ยวข้องกับพื้นที่ของคุณ</p>
    </header>

    <HelpRequests />
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
