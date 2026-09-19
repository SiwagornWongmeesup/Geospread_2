<template>
  <section class="request-page">
    <div class="request-page__content"><RequestHelpForm /></div>
    <RequestHelpSidePanel />
  </section>
</template>

<script setup>
import RequestHelpForm from '~/components/request-help/RequestHelpForm.vue'
import RequestHelpSidePanel from '~/components/request-help/RequestHelpSidePanel.vue'
</script>

<style scoped>
.request-page { display: grid; grid-template-columns: minmax(0, 1fr) 21rem; min-height: 100%; background: #f5f9ff; }.request-page__content { padding: 1.5rem; } @media (max-width: 70rem) { .request-page { grid-template-columns: 1fr; }.request-page__content { padding: 1rem; } }
</style>
