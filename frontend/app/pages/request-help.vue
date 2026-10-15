<template>
  <section class="request-page">
    <div class="request-page__layout">
      <header class="request-page__intro">
        <h1>ขอความช่วยเหลือ</h1>
        <p>บอกรายละเอียดให้ชุมชนช่วยเหลือคุณได้เร็วขึ้น</p>
      </header>

      <div class="request-page__body">
        <RequestHelpForm ref="helpForm" :location="helpLocation" />
        <RequestHelpSidePanel
          v-model:location="helpLocation"
          :is-submitting="helpForm?.isSubmitting ?? false"
          :submission-feedback="helpForm?.feedback ?? ''"
          @submit="helpForm?.submit()"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import RequestHelpForm from '~/components/request-help/RequestHelpForm.vue'
import RequestHelpSidePanel from '~/components/request-help/RequestHelpSidePanel.vue'

const helpLocation = ref(null)
const helpForm = ref(null)
</script>

<style scoped>
.request-page {
  min-height: 100%;
  padding: 1rem;
  background: #edf6ff;
}

.request-page__layout {
  display: grid;
  gap: 1rem;
  max-width: 92rem;
  margin: 0 auto;
  padding: 1.25rem;
  border: 1px solid #dce8f5;
  border-radius: .85rem;
  background: #fff;
  box-shadow: 0 .65rem 1.8rem rgb(31 72 125 / 8%);
  align-items: stretch;
}

.request-page__intro h1 {
  margin: 0;
  color: #102968;
  font-size: 1.65rem;
}

.request-page__intro p {
  margin: .5rem 0 0;
  color: #60718c;
  font-size: .9rem;
}

.request-page__body {
  display: grid;
  grid-template-columns: minmax(22rem, 2fr) minmax(31rem, 3fr);
  gap: 1.15rem;
  align-items: stretch;
}

@media (max-width: 58rem) {
  .request-page {
    padding: 1rem;
  }

  .request-page__body {
    grid-template-columns: 1fr;
  }
}
</style>
