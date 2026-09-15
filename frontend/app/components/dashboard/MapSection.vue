<script setup>
defineProps({
  title: {
    type: String,
    default: 'แผนที่เหตุการณ์'
  }
});
</script>

<template>
  <section class="map-section">
    <header class="map-section__header">
      <div>
        <h1>{{ title }}</h1>
        <p>แผนที่ Mapbox และหมุดเหตุการณ์จะเชื่อมต่อในขั้นตอนถัดไป</p>
      </div>

      <slot name="actions" />
    </header>

    <div class="map-section__canvas" role="img" aria-label="พื้นที่สำหรับแผนที่เหตุการณ์">
      <span>Map Area</span>
    </div>
  </section>
</template>

<style scoped>
.map-section {
  display: grid;
  gap: 1rem;
}

.map-section__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.map-section h1 {
  margin: 0;
  color: #123765;
  font-size: clamp(1.25rem, 2vw, 1.75rem);
}

.map-section p {
  margin: 0.35rem 0 0;
  color: #60718c;
  font-size: 0.9rem;
}

.map-section__canvas {
  min-height: 26rem;
  display: grid;
  place-items: center;
  border: 1px dashed #aebfd8;
  border-radius: 0.875rem;
  background: #eaf2ff;
  color: #315b8f;
  font-size: 0.875rem;
  font-weight: 700;
}
</style>
