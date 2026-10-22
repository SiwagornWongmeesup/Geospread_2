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
let editableMarker = null
let reporterMarker = null
let resizeObserver = null

const radiusSourceId = 'incident-radius-source'
const radiusFillLayerId = 'incident-radius-fill'
const radiusLineLayerId = 'incident-radius-line'
const clusterRadiusPx = 30

const props = defineProps({
  center: { type: Array, default: () => [100.5018, 13.7563] },
  zoom: { type: Number, default: 10 },
  showGeolocateControl: { type: Boolean, default: true },
  mapItems: { type: Array, default: () => [] },
  selectedItemId: { type: String, default: null },
  editableLocation: { type: Object, default: null },
  reporterLocation: { type: Object, default: null },
  allowLocationSelection: { type: Boolean, default: false },
})

const emit = defineEmits(['select-item', 'location-select'])

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
    .filter((item) => (
      item.id === props.selectedItemId
      && item.kind === 'incident'
      && item.displayMode !== 'marker'
      && Number(item.radiusM) > 0
    ))
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

const createMarkerElement = (item) => {
  const markerKind = item.kind === 'pending_report'
    ? 'pending'
    : item.kind === 'help_request'
      ? 'help'
      : 'incident'
  const fallbackMarkerColor = markerKind === 'pending'
    ? '#e8333c'
    : markerKind === 'help'
      ? '#f97316'
      : '#1479ef'
  const badgeLabel = item.kind === 'pending_report'
    ? 'รอตรวจสอบ'
    : item.kind === 'help_request'
      ? 'ขอความช่วยเหลือ'
      : null

  const marker = document.createElement('button')
  marker.type = 'button'
  marker.className = `incident-map-marker incident-map-marker--${markerKind}`
  marker.style.setProperty('--marker-color', item.markerColor || fallbackMarkerColor)
  marker.setAttribute('aria-label', badgeLabel ? `${badgeLabel}: ${item.title || 'ตำแหน่งบนแผนที่'}` : (item.title || 'ตำแหน่งเหตุการณ์'))

  const pin = document.createElement('span')
  pin.className = 'incident-map-marker__pin'

  const icon = document.createElement('img')
  icon.className = 'incident-map-marker__icon'
  icon.src = item.iconUrl || '/icons/Alert.svg'
  icon.alt = ''
  icon.setAttribute('aria-hidden', 'true')
  pin.appendChild(icon)

  marker.appendChild(pin)

  if (badgeLabel) {
    const badge = document.createElement('span')
    badge.className = `incident-map-marker__badge incident-map-marker__badge--${markerKind}`
    badge.textContent = badgeLabel
    marker.appendChild(badge)
  }

  marker.addEventListener('click', () => emit('select-item', item))
  return marker
}

const buildMapItemClusters = () => {
  if (!map) return []

  const positionedItems = props.mapItems
    .map((item) => {
      const lngLat = toLngLat(item)
      return lngLat ? { item, lngLat, point: map.project(lngLat) } : null
    })
    .filter(Boolean)
  const remaining = new Set(positionedItems.map((_, index) => index))
  const clusters = []

  while (remaining.size) {
    const seedIndex = remaining.values().next().value
    const seed = positionedItems[seedIndex]
    const members = []

    for (const index of remaining) {
      const candidate = positionedItems[index]
      const distance = Math.hypot(candidate.point.x - seed.point.x, candidate.point.y - seed.point.y)
      if (distance <= clusterRadiusPx) members.push(index)
    }

    members.forEach((index) => remaining.delete(index))
    const items = members.map((index) => positionedItems[index].item)
    const center = members.reduce((total, index) => {
      const [lng, lat] = positionedItems[index].lngLat
      return [total[0] + lng, total[1] + lat]
    }, [0, 0]).map((value) => value / members.length)

    clusters.push({ items, center })
  }

  return clusters
}

const zoomToCluster = (cluster) => {
  if (!map) return

  const bounds = new mapboxgl.LngLatBounds()
  cluster.items.forEach((item) => bounds.extend(toLngLat(item)))

  const [[west, south], [east, north]] = bounds.toArray()
  const hasSingleLocation = west === east && south === north
  if (hasSingleLocation) {
    // หมุดที่พิกัดเดียวกันไม่มีวันแยกด้วยการซูมปกติ จึงซูมถึงระดับที่จะแตกเป็นวงรอบจุด
    map.easeTo({ center: cluster.center, zoom: Math.max(Math.min(map.getZoom() + 3, 18), 16), duration: 350 })
    return
  }

  map.fitBounds(bounds, {
    padding: 72,
    maxZoom: 16,
    duration: 350,
  })
}

const clusterHasSingleLocation = (cluster) => cluster.items.every((item) => {
  const [lng, lat] = toLngLat(item)
  return lng === cluster.center[0] && lat === cluster.center[1]
})

const getSpiderOffset = (index, count) => {
  const angle = -Math.PI / 2 + (2 * Math.PI * index / count)
  const radius = Math.max(30, Math.min(52, count * 7))
  return [Math.cos(angle) * radius, Math.sin(angle) * radius]
}

const createClusterElement = (cluster) => {
  const marker = document.createElement('button')
  marker.type = 'button'
  marker.className = 'incident-map-cluster'
  marker.setAttribute('aria-label', `${cluster.items.length} เหตุการณ์ใกล้กัน กดเพื่อซูมดู`)

  const count = document.createElement('span')
  count.className = 'incident-map-cluster__count'
  count.textContent = String(cluster.items.length)
  marker.appendChild(count)

  if (cluster.items.some((item) => item.kind === 'pending_report')) {
    const pendingIndicator = document.createElement('span')
    pendingIndicator.className = 'incident-map-cluster__pending-indicator'
    pendingIndicator.setAttribute('aria-hidden', 'true')
    marker.appendChild(pendingIndicator)
  }

  marker.addEventListener('click', () => zoomToCluster(cluster))
  return marker
}

const clearMarkers = () => {
  markers.forEach((marker) => marker.remove())
  markers = []
}

const createLocationMarkerElement = (kind) => {
  const marker = document.createElement('span')
  marker.className = `report-map-marker report-map-marker--${kind}`
  marker.setAttribute('aria-hidden', 'true')
  return marker
}

const emitLocation = (lngLat) => emit('location-select', { lat: lngLat.lat, lng: lngLat.lng })

const renderReportLocations = () => {
  if (!map || !isMapLoaded) return

  if (editableMarker) { editableMarker.remove(); editableMarker = null }
  if (reporterMarker) { reporterMarker.remove(); reporterMarker = null }

  const incidentLngLat = toLngLat(props.editableLocation)
  if (incidentLngLat) {
    editableMarker = new mapboxgl.Marker({
      element: createLocationMarkerElement('incident'),
      anchor: 'bottom',
      draggable: props.allowLocationSelection,
    }).setLngLat(incidentLngLat).addTo(map)
    if (props.allowLocationSelection) editableMarker.on('dragend', () => emitLocation(editableMarker.getLngLat()))
  }

  const reporterLngLat = toLngLat(props.reporterLocation)
  if (reporterLngLat) {
    reporterMarker = new mapboxgl.Marker({ element: createLocationMarkerElement('reporter'), anchor: 'center' })
      .setLngLat(reporterLngLat).addTo(map)
  }
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
  renderReportLocations()

  buildMapItemClusters().forEach((cluster) => {
    const isCluster = cluster.items.length > 1
    const shouldSpiderfy = isCluster && clusterHasSingleLocation(cluster) && map.getZoom() >= 16

    if (shouldSpiderfy) {
      cluster.items.forEach((item, index) => {
        const marker = new mapboxgl.Marker({
          element: createMarkerElement(item),
          anchor: 'bottom',
          offset: getSpiderOffset(index, cluster.items.length),
        })
          .setLngLat(cluster.center)
          .addTo(map)

        markers.push(marker)
      })
      return
    }

    const element = isCluster ? createClusterElement(cluster) : createMarkerElement(cluster.items[0])

    const marker = new mapboxgl.Marker({
      element,
      anchor: 'bottom',
    })
      .setLngLat(cluster.center)
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
      renderReportLocations()
      if (props.allowLocationSelection) map.on('click', (event) => emitLocation(event.lngLat))
    })

    // เมื่อผู้ใช้ซูมหรือลากแผนที่ ให้จัดกลุ่มใหม่ตามระยะบนหน้าจอปัจจุบัน
    map.on('moveend', renderMapItems)

    resizeObserver = new ResizeObserver(() => map?.resize())
    resizeObserver.observe(mapContainer.value)
  }
})

onUnmounted(() => {
  clearMarkers()
  editableMarker?.remove()
  reporterMarker?.remove()
  resizeObserver?.disconnect()
  if (map) {
    map.remove()
  }
})

watch(
  [() => props.center, () => props.zoom],
  ([newCenter, newZoom]) => {
    if (map && Array.isArray(newCenter)) {
      //flyToเลื่อน
      map.flyTo({
        center: newCenter,
        zoom: newZoom,
        duration: 900,
        essential: true,
        easing: (t) => t * (2 - t),
      })
    }
  },
)

watch(() => props.mapItems, () => {
  renderMapItems()
}, { deep: true })

watch(() => props.selectedItemId, () => {
  renderRadiusLayer()
})

watch(() => [props.editableLocation, props.reporterLocation], () => {
  renderReportLocations()
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

:global(.incident-map-marker--help .incident-map-marker__pin) {
  box-shadow: 0 0 0 5px rgb(249 115 22 / 20%), 0 8px 18px rgb(15 23 42 / 22%);
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

:global(.incident-map-marker__badge--help) {
  color: #c2410c;
}

:global(.incident-map-cluster) {
  position: relative;
  display: grid;
  width: 2.85rem;
  height: 2.85rem;
  place-items: center;
  padding: 0;
  border: 3px solid #fff;
  border-radius: 50%;
  background: #102968;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 0.38rem 1rem rgb(15 41 104 / 32%);
}

:global(.incident-map-cluster:hover) { background: #1479ef; }
:global(.incident-map-cluster:focus-visible) { outline: 3px solid #102968; outline-offset: 3px; }

:global(.incident-map-cluster__count) {
  font-size: .82rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

:global(.incident-map-cluster__pending-indicator) {
  position: absolute;
  right: -.08rem;
  bottom: -.08rem;
  width: .72rem;
  height: .72rem;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #e8333c;
}

:global(.report-map-marker) { display:block; width:1.35rem; height:1.35rem; border:3px solid #fff; border-radius:50%; box-shadow:0 .28rem .75rem rgb(15 23 42 / 26%) }
:global(.report-map-marker--incident) { width:2.35rem; height:2.35rem; border-radius:50% 50% 50% 0; background:#e8343e; transform:rotate(-45deg) }
:global(.report-map-marker--incident::after) { position:absolute; inset:.48rem; border-radius:50%; background:#fff; content:'' }
:global(.report-map-marker--reporter) { background:#1479ef }

</style>
