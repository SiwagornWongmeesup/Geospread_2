<script setup>
const { t } = useLocale()
definePageMeta({
  showRightPanel: false
});
</script>

<template>
  <section class="dashboard-page">
    <h1>{{ t('nav.notifications') }}</h1>
    <p>{{ t('pages.notifications') }}</p>
  </section>
</template>

<style scoped>
.dashboard-page {
  padding: 1.5rem;
  border: 1px solid #dce5f2;
  border-radius: 0.875rem;
  background: #ffffff;
}

h1 {
  margin: 0;
  color: #123765;
  font-size: 1.5rem;
}

p {
  margin: 0.5rem 0 0;
  color: #60718c;
  line-height: 1.6;
}
</style>
