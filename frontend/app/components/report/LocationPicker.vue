<script setup>
defineProps({
  label: {
    type: String,
    default: 'ตำแหน่งเหตุการณ์'
  }
});
</script>

<template>
  <section class="location-picker">
    <header>
      <h2>{{ label }}</h2>
      <p>ตัวเลือกแผนที่และการระบุตำแหน่งจะเชื่อมต่อในขั้นตอนถัดไป</p>
    </header>

    <div class="location-picker__map" role="img" aria-label="พื้นที่เลือกตำแหน่งบนแผนที่">
      พื้นที่เลือกตำแหน่ง
    </div>
  </section>
</template>

<style scoped>
.location-picker {
  display: grid;
  gap: 0.75rem;
}

.location-picker h2 {
  margin: 0;
  color: #123765;
  font-size: 1rem;
}

.location-picker p {
  margin: 0.35rem 0 0;
  color: #60718c;
  font-size: 0.85rem;
}

.location-picker__map {
  min-height: 12rem;
  display: grid;
  place-items: center;
  border: 1px dashed #aebfd8;
  border-radius: 0.75rem;
  background: #eaf2ff;
  color: #315b8f;
  font-size: 0.875rem;
  font-weight: 700;
}
</style>
