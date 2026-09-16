<template>
  <div ref="mapContainer" class="w-full h-full min-h-[400px] rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const config = useRuntimeConfig()
const mapContainer = ref(null)
let map = null

// Props for map configuration
const props = defineProps({
  center: { type: Array, default: () => [100.5018, 13.7563] },
  zoom: { type: Number, default: 10 }
})

onMounted(() => {
  if (!config.public.mapboxToken) {
    console.error('Mapbox token is missing. Please add NUXT_PUBLIC_MAPBOX_TOKEN to your .env file.')
    return
  }

  mapboxgl.accessToken = config.public.mapboxToken

  if (mapContainer.value) {
    map = new mapboxgl.Map({
      container: mapContainer.value,
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: props.center, // starting position [lng, lat]
      zoom: props.zoom, // starting zoom
    })

    // Add navigation controls (zoom in/out)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Add user location tracking control
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      })
    )
  }
})

// Clean up map instance
onUnmounted(() => {
  if (map) {
    map.remove()
  }
})

// Watch for prop changes to update map
watch(() => props.center,
(newCenter) => {
  if (map) {
    map.flyTo({ center: newCenter })
  }
})

watch(() => props.zoom,
(newZoom) => {
  if (map) {
    map.zoomTo(newZoom)
  }
})
</script>

<style scoped>
/* Any custom styles for the map container if needed */
</style>
