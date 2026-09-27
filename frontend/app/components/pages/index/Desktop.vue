<template>
  <div class="desktop-home">
    <section class="desktop-home__map" aria-label="แผนที่เหตุการณ์">
      <MapboxMap
        :center="mapCenter"
        :zoom="11"
        :map-items="publicMapItems"
        class="desktop-home__map-canvas"
        @select-item="selectIncident"
      />
      <div class="desktop-home__map-label">
        <span class="desktop-home__map-pulse" aria-hidden="true" />
        แผนที่เหตุการณ์ชุมชน
      </div>
      <div v-if="mapError" class="desktop-home__map-status">
        {{ mapError }}
      </div>
    </section>

    <NearbyIncidents
      :selected-incident-id="selectedIncident?.id"
      :incidents="nearbyIncidentCards"
      :is-loading="isLoadingMap"
      :error-message="mapError"
      @select="selectIncident"
    />

    <div class="desktop-home__lower-grid">
      <HelpRequests />
      <RecentActivity />
    </div>
  </div>
</template>

<script setup>
import MapboxMap from '~/components/MapboxMap.vue'
import HelpRequests from '~/components/dashboard/HelpRequests.vue'
import NearbyIncidents from '~/components/dashboard/NearbyIncidents.vue'
import RecentActivity from '~/components/dashboard/RecentActivity.vue'

const {
  selectedIncident,
  publicMapItems,
  nearbyIncidentCards,
  isLoadingMap,
  mapError,
  mapCenter,
  selectIncident,
  fetchPublicMapItems,
} = useHomeDashboard()

onMounted(fetchPublicMapItems)
</script>

<style scoped>
.desktop-home {
  display: grid;
  gap: 1rem;
  min-height: 100%;
  padding: 1.25rem;
  background: #f5f8fc;
}

.desktop-home__map {
  position: relative;
  width: 100%;
  height: clamp(22rem, 42vh, 30rem);
  min-height: 25rem;
  overflow: hidden;
  border: 1px solid #dce6f2;
  border-radius: 1rem;
  background: #dceef1;
  box-shadow: 0 8px 24px rgb(36 75 122 / 10%);
}

.desktop-home__map-canvas {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.desktop-home__map-label {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  border: 1px solid #d8e5f4;
  border-radius: 0.625rem;
  background: rgb(255 255 255 / 94%);
  color: #173a75;
  font-size: 0.875rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgb(26 58 108 / 12%);
  pointer-events: none;
}

.desktop-home__map-pulse {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background: #1479ef;
  box-shadow: 0 0 0 4px rgb(20 121 239 / 16%);
}

.desktop-home__map-status {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  max-width: min(22rem, calc(100% - 2rem));
  padding: 0.65rem 0.8rem;
  border: 1px solid #fecaca;
  border-radius: 0.625rem;
  background: rgb(255 255 255 / 94%);
  color: #b91c1c;
  font-size: 0.78rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgb(26 58 108 / 12%);
}

.desktop-home__lower-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.92fr);
  gap: 1rem;
}

@media (max-width: 72rem) {
  .desktop-home__lower-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 48rem) {
  .desktop-home {
    padding: 1rem;
  }

  .desktop-home__map {
    min-height: 20rem;
  }
}
</style>
