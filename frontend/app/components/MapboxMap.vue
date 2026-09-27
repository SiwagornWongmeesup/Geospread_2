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
let isMapLoaded = false
let markers = []

const radiusSourceId = 'incident-radius-source'
const radiusFillLayerId = 'incident-radius-fill'
const radiusLineLayerId = 'incident-radius-line'

const props = defineProps({
  center: { type: Array, default: () => [100.5018, 13.7563] },
  zoom: { type: Number, default: 10 },
  showGeolocateControl: { type: Boolean, default: true },
  mapItems: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-item'])

const toNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const toLngLat = (item) => {
  const lng = toNumber(item?.lng)
  const lat = toNumber(item?.lat)
  return lng === null || lat === null ? null : [lng, lat]
}

const createRadiusPolygon = (center, radiusMeters, points = 64) => {
  const [centerLng, centerLat] = center
  const earthRadius = 6371008.8
  const angularDistance = radiusMeters / earthRadius
  const latRad = centerLat * Math.PI / 180
  const lngRad = centerLng * Math.PI / 180
  const coordinates = []

  for (let index = 0; index <= points; index += 1) {
    const bearing = 2 * Math.PI * index / points
    const lat = Math.asin(
      Math.sin(latRad) * Math.cos(angularDistance)
      + Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearing)
    )
    const lng = lngRad + Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latRad),
      Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(lat)
    )

    coordinates.push([lng * 180 / Math.PI, lat * 180 / Math.PI])
  }

  return coordinates
}

const buildRadiusFeatureCollection = () => ({
  type: 'FeatureCollection',
  features: props.mapItems
    .filter((item) => item.kind === 'incident' && item.displayMode !== 'marker' && Number(item.radiusM) > 0)
    .map((item) => {
      const center = toLngLat(item)
      if (!center) return null

      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [createRadiusPolygon(center, Number(item.radiusM))],
        },
        properties: {
          id: item.id,
          color: item.markerColor || '#1479ef',
        },
      }
    })
    .filter(Boolean),
})

const createPopupContent = (item) => {
  const popup = document.createElement('div')
  popup.className = 'incident-map-popup'

  const status = document.createElement('span')
  status.className = 'incident-map-popup__status'
  status.textContent = item.statusLabel || (item.kind === 'pending_report' ? 'รอตรวจสอบ' : 'เหตุการณ์')
  popup.appendChild(status)

  const title = document.createElement('strong')
  title.textContent = item.title || 'รายงานเหตุการณ์'
  popup.appendChild(title)

  if (item.description) {
    const description = document.createElement('p')
    description.textContent = item.description
    popup.appendChild(description)
  }

  return popup
}

const createMarkerElement = (item) => {
  const marker = document.createElement('button')
  marker.type = 'button'
  marker.className = `incident-map-marker incident-map-marker--${item.kind === 'pending_report' ? 'pending' : 'incident'}`
  marker.style.setProperty('--marker-color', item.markerColor || (item.kind === 'pending_report' ? '#e8333c' : '#1479ef'))
  marker.setAttribute('aria-label', item.title || 'ตำแหน่งเหตุการณ์')

  const pin = document.createElement('span')
  pin.className = 'incident-map-marker__pin'

  const icon = document.createElement('img')
  icon.className = 'incident-map-marker__icon'
  icon.src = item.iconUrl || '/Alert.svg'
  icon.alt = ''
  icon.setAttribute('aria-hidden', 'true')
  pin.appendChild(icon)

  marker.appendChild(pin)

  if (item.kind === 'pending_report') {
    const badge = document.createElement('span')
    badge.className = 'incident-map-marker__badge'
    badge.textContent = 'รอตรวจสอบ'
    marker.appendChild(badge)
  }

  marker.addEventListener('click', () => emit('select-item', item))
  return marker
}

const clearMarkers = () => {
  markers.forEach((marker) => marker.remove())
  markers = []
}

const renderRadiusLayer = () => {
  const radiusData = buildRadiusFeatureCollection()

  if (map.getSource(radiusSourceId)) {
    map.getSource(radiusSourceId).setData(radiusData)
    return
  }

  map.addSource(radiusSourceId, {
    type: 'geojson',
    data: radiusData,
  })

  map.addLayer({
    id: radiusFillLayerId,
    type: 'fill',
    source: radiusSourceId,
    paint: {
      'fill-color': ['coalesce', ['get', 'color'], '#1479ef'],
      'fill-opacity': 0.14,
    },
  })

  map.addLayer({
    id: radiusLineLayerId,
    type: 'line',
    source: radiusSourceId,
    paint: {
      'line-color': ['coalesce', ['get', 'color'], '#1479ef'],
      'line-opacity': 0.32,
      'line-width': 2,
    },
  })
}

const renderMapItems = () => {
  if (!map || !isMapLoaded) return

  clearMarkers()
  renderRadiusLayer()

  props.mapItems.forEach((item) => {
    const lngLat = toLngLat(item)
    if (!lngLat) return

    const marker = new mapboxgl.Marker({
      element: createMarkerElement(item),
      anchor: 'bottom',
    })
      .setLngLat(lngLat)
      .setPopup(new mapboxgl.Popup({ offset: 18 }).setDOMContent(createPopupContent(item)))
      .addTo(map)

    markers.push(marker)
  })
}

onMounted(() => {
  if (!config.public.mapboxToken) {
    console.error('Mapbox token is missing. Please add NUXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env file.')
    return
  }

  mapboxgl.accessToken = config.public.mapboxToken

  if (mapContainer.value) {
    map = new mapboxgl.Map({
      container: mapContainer.value,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: props.center,
      zoom: props.zoom,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    if (props.showGeolocateControl) {
      map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        })
      )
    }

    map.on('load', () => {
      isMapLoaded = true
      renderMapItems()
    })
  }
})

onUnmounted(() => {
  clearMarkers()
  if (map) {
    map.remove()
  }
})

watch(() => props.center, (newCenter) => {
  if (map && Array.isArray(newCenter)) {
    map.flyTo({ center: newCenter })
  }
})

watch(() => props.zoom, (newZoom) => {
  if (map) {
    map.zoomTo(newZoom)
  }
})

watch(() => props.mapItems, () => {
  renderMapItems()
}, { deep: true })
</script>

<style scoped>
:global(.incident-map-marker) {
  position: relative;
  display: grid;
  place-items: center;
  width: 2.6rem;
  height: 2.8rem;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transform: translateY(0.25rem);
}

:global(.incident-map-marker__pin) {
  position: relative;
  display: grid;
  width: 2.15rem;
  height: 2.15rem;
  place-items: center;
  border: 3px solid #fff;
  border-radius: 999px;
  background: var(--marker-color);
  box-shadow: 0 8px 18px rgb(15 23 42 / 22%);
}

:global(.incident-map-marker__pin::after) {
  position: absolute;
  bottom: 0.2rem;
  left: 50%;
  width: 0.55rem;
  height: 0.55rem;
  background: var(--marker-color);
  content: '';
  transform: translateX(-50%) rotate(45deg);
}

:global(.incident-map-marker__icon) {
  position: relative;
  z-index: 1;
  width: 1.2rem;
  height: 1.2rem;
  object-fit: contain;
  filter: brightness(0) invert(1);
  pointer-events: none;
}

:global(.incident-map-marker--pending .incident-map-marker__pin) {
  box-shadow: 0 0 0 5px rgb(232 51 60 / 18%), 0 8px 18px rgb(15 23 42 / 22%);
}

:global(.incident-map-marker__badge) {
  position: absolute;
  top: -1rem;
  left: 50%;
  width: max-content;
  padding: 0.15rem 0.45rem;
  border: 1px solid rgb(255 255 255 / 88%);
  border-radius: 999px;
  background: #fff;
  color: #c42730;
  font-size: 0.66rem;
  font-weight: 800;
  line-height: 1.1;
  box-shadow: 0 4px 10px rgb(15 23 42 / 15%);
  transform: translateX(-50%);
}

:global(.incident-map-popup) {
  display: grid;
  gap: 0.35rem;
  max-width: 15rem;
  color: #18304f;
}

:global(.incident-map-popup__status) {
  width: fit-content;
  padding: 0.12rem 0.45rem;
  border-radius: 999px;
  background: #eff6ff;
  color: #1f5fae;
  font-size: 0.68rem;
  font-weight: 800;
}

:global(.incident-map-popup strong) {
  font-size: 0.88rem;
}

:global(.incident-map-popup p) {
  margin: 0;
  color: #53647d;
  font-size: 0.78rem;
  line-height: 1.45;
}

</style>
