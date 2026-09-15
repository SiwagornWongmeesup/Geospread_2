<script setup>
defineProps({
  open: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);
</script>

<template>
  <div v-if="open" class="incident-modal" role="presentation">
    <section
      class="incident-modal__dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="incident-detail-title"
    >
      <header class="incident-modal__header">
        <h2 id="incident-detail-title">รายละเอียดเหตุการณ์</h2>
        <button type="button" aria-label="ปิดรายละเอียดเหตุการณ์" @click="emit('close')">
          ปิด
        </button>
      </header>

      <div class="incident-modal__content">
        <slot>รายละเอียดเชิงลึกของเหตุการณ์จะแสดงในส่วนนี้</slot>
      </div>
    </section>
  </div>
</template>

<style scoped>
.incident-modal {
  position: fixed;
  z-index: 50;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(8 28 58 / 45%);
}

.incident-modal__dialog {
  width: min(100%, 36rem);
  max-height: min(40rem, 90dvh);
  overflow: auto;
  border-radius: 0.875rem;
  background: #ffffff;
  box-shadow: 0 1.25rem 3rem rgb(8 28 58 / 22%);
}

.incident-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #dce5f2;
}

.incident-modal__header h2 {
  margin: 0;
  color: #123765;
  font-size: 1rem;
}

.incident-modal__header button {
  padding: 0.5rem 0.75rem;
  border: 1px solid #bfcde0;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #234978;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.incident-modal__header button:hover,
.incident-modal__header button:focus-visible {
  outline: none;
  border-color: #0a53b7;
  background: #eaf2ff;
}

.incident-modal__content {
  padding: 1.25rem;
  color: #60718c;
  line-height: 1.6;
}
</style>
