<script setup>
const { t } = useLocale()
import HelpRequests from '~/components/dashboard/HelpRequests.vue';

definePageMeta({
  showRightPanel: false
});
</script>

<template>
  <section class="dashboard-page">
    <header class="dashboard-page__header">
      <h1>{{ t('pages.helpRequestsTitle') }}</h1>
      <p>{{ t('pages.helpRequests') }}</p>
    </header>

    <HelpRequests :title="t('helpList.allTitle')" full-list />
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
