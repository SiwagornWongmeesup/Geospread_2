<template>
  <div class="desktop-layout">
    <main class="map-area">
      <MapboxMap
        :center="[100.5018, 13.7563]"
        :zoom="12"
        class="map-area__map"
      />
    </main>
  </div>
</template>

<script setup>
import MapboxMap from '~/components/MapboxMap.vue'
</script>

<style scoped>
.desktop-layout {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #0f172a;
}

.map-area {
  width: 100%;
  height: 100%;
}

.map-area__map {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
</style>
