<template>
  <div ref="mapContainer" class="w-full h-full min-h-[400px] rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700"></div>
</template>

<script setup>
import { createApp, ref, onMounted, onUnmounted, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import IncidentMapPopup from './IncidentMapPopup.vue'
import HelpRequestMapPopup from './HelpRequestMapPopup.vue'
import { usePlaceNames } from '~/composables/usePlaceNames'

const config = useRuntimeConfig()
// popup สร้างด้วย createApp แยกต่างหาก เรียก composable ของ Nuxt เองไม่ได้
// จึงหาชื่อสถานที่ที่นี่ แล้วส่งเข้า popup เป็น prop
const { loadPlaceNames, getPlaceLabel } = usePlaceNames()
const { t, locale } = useLocale()
const mapContainer = ref(null)
let map = null
let isMapLoaded = false
let markers = []
let editableMarker = null
let reporterMarker = null
let resizeObserver = null
let incidentPopup = null
let incidentPopupApp = null
let notifyParentOnPopupClose = false

const radiusSourceId = 'incident-radius-source'
const radiusFillLayerId = 'incident-radius-fill'
const radiusLineLayerId = 'incident-radius-line'
// ระยะ (px บนจอ) ที่หมุดจะถูกรวมเป็นกลุ่ม ต้องไม่น้อยกว่าความกว้างหมุด (~42px)
// ไม่งั้นหมุดที่ห่างกันน้อยกว่าขนาดตัวเองจะวาดทับกัน และหมุดข้างล่างจะถูกบังจนมองไม่เห็น
const clusterRadiusPx = 44
// ซูมถึงระดับนี้แล้วกลุ่มที่ยังไม่แยก จะกางหมุดออกเป็นวงรอบจุดแทน
const spiderfyZoom = 16
const popupMarkerOffsetPx = 52

const props = defineProps({
  center: { type: Array, default: () => [100.5018, 13.7563] },
  zoom: { type: Number, default: 10 },
  showGeolocateControl: { type: Boolean, default: true },
  mapItems: { type: Array, default: () => [] },
  selectedItemId: { type: String, default: null },
  selectedItem: { type: Object, default: null },
  selectedIncidentDetail: { type: Object, default: null },
  popupPadding: {
    type: Object,
    default: () => ({ top: 240, right: 32, bottom: 48, left: 32 }),
  },
  editableLocation: { type: Object, default: null },
  reporterLocation: { type: Object, default: null },
  allowLocationSelection: { type: Boolean, default: false },
  // false = ไม่แสดง popup ลอยบนแผนที่ตอนกดหมุด (หน้ามือถือใช้ bottom sheet แทน)
  showPopup: { type: Boolean, default: true },
})

const emit = defineEmits(['select-item', 'location-select', 'close-popup','open-report'])

const toNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const toLngLat = (item) => {
  const lng = toNumber(item?.lng)
  const lat = toNumber(item?.lat)
  return lng === null || lat === null ? null : [lng, lat]
}

const getPopupPadding = () => ({
  top: Number(props.popupPadding?.top) || 0,
  right: Number(props.popupPadding?.right) || 0,
  bottom: Number(props.popupPadding?.bottom) || 0,
  left: Number(props.popupPadding?.left) || 0,
})

const clearIncidentPopup = ({ notifyParent = false } = {}) => {
  if (!incidentPopup) return

  notifyParentOnPopupClose = notifyParent
  incidentPopup.remove()
}

const renderIncidentPopup = () => {
  if (!map || !isMapLoaded) return

  const item = props.selectedItem
  const lngLat = toLngLat(item)
  if (!item || !lngLat || !props.showPopup) {
    clearIncidentPopup()
    return
  }

  // หาชื่อสถานที่ของหมุดนี้จาก Mapbox (ถ้าเคยหาแล้วจะไม่ถามซ้ำ)
  // popup จะอัปเดตชื่อเองเมื่อได้ชื่อมา ไม่ต้องสร้าง popup ใหม่
  loadPlaceNames([item])

  clearIncidentPopup()

  const popupContent = document.createElement('div')
  const popup = new mapboxgl.Popup({
    anchor: 'bottom',
    closeButton: false,
    closeOnClick: false,
    closeOnMove: false,
    focusAfterOpen: false,
    maxWidth: 'none',
    // ยก popup ขึ้นพ้นตัวหมุด (หมุดสูง 2.8rem ≈ 45px ปักอยู่เหนือพิกัด) ไม่งั้น popup จะบังหมุด
    offset: popupMarkerOffsetPx,
    className: 'geospread-incident-popup',
  })
  // เลือก popup ให้ตรงกับประเภทหมุด: คำขอความช่วยเหลือใช้ popup ของตัวเอง ที่เหลือใช้ popup รายงาน
  let popupApp
  if (item.kind === 'help_request') {
    popupApp = createApp(HelpRequestMapPopup, {
      incident: item,
      getPlaceLabel,
      t,
      onClose: () => clearIncidentPopup({ notifyParent: true }),
    })
  } else {
    // ส่งไปใช้ต่อหน้าdestop
    popupApp = createApp(IncidentMapPopup, {
      incident: item,
      incidentDetail: props.selectedIncidentDetail,
      getPlaceLabel,
      t,
      onClose: () => clearIncidentPopup({ notifyParent: true }),
      onOpenReport: ({ incidentId, reportId }) => {emit('open-report', { incidentId, reportId })},
    })
  }

  incidentPopup = popup
  incidentPopupApp = popupApp
  popupApp.mount(popupContent)

  popup.on('close', () => {
    if (popup !== incidentPopup) {
      popupApp.unmount()
      return
    }

    const shouldNotifyParent = notifyParentOnPopupClose
    notifyParentOnPopupClose = false
    incidentPopup = null
    incidentPopupApp = null
    popupApp.unmount()

    if (shouldNotifyParent) emit('close-popup')
  })

  popup
    .setLngLat(lngLat)
    .setDOMContent(popupContent)
    .addTo(map)
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
    ? t('status.pending')
    : item.kind === 'help_request'
      ? t('help.category')
      : null

  const marker = document.createElement('button')
  marker.type = 'button'
  marker.className = `incident-map-marker incident-map-marker--${markerKind}`
  marker.style.setProperty('--marker-color', item.markerColor || fallbackMarkerColor)
  const ariaCount = Number(item.reportCount) > 1 ? ` (${t('units.reports', { count: Number(item.reportCount) })})` : ''
  marker.setAttribute('aria-label', (badgeLabel ? `${badgeLabel}: ${item.title || t('map.markerFallback')}` : (item.title || t('map.markerIncident'))) + ariaCount)

  const pin = document.createElement('span')
  pin.className = 'incident-map-marker__pin'

  const icon = document.createElement('img')
  icon.className = 'incident-map-marker__icon'
  icon.src = item.iconUrl || '/icons/Alert.svg'
  icon.alt = ''
  icon.setAttribute('aria-hidden', 'true')
  pin.appendChild(icon)

  // จำนวนรายงานของจุดนี้ (ถ้าไม่มีข้อมูล ให้ถือว่าเป็น 1)
  const reportCount = Number(item.reportCount) || 1

  // แสดงตัวเลขบนหมุด เฉพาะเมื่อมีมากกว่า 1 รายงาน
  if (reportCount > 1) {
    // ถ้าเกิน 99 ให้แสดงเป็น "99+" จะได้ไม่ล้นหมุด
    let label = String(reportCount)
    if (reportCount > 99) {
      label = '99+'
    }

    // สร้างป้ายตัวเลข แล้วใส่ลงในหมุด
    const badge = document.createElement('span')
    badge.className = 'incident-map-marker__count'
    badge.textContent = label
    badge.setAttribute('aria-hidden', 'true') // ไม่ให้โปรแกรมอ่านหน้าจออ่านตัวเลขนี้
    pin.appendChild(badge)
  }

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
    map.easeTo({ center: cluster.center, zoom: Math.max(Math.min(map.getZoom() + 3, 18), spiderfyZoom), duration: 350 })
    return
  }

  // ซูมได้สูงสุดแค่ระดับที่กลุ่มจะถูกกางออก ถ้ายังไม่แยก renderMapItems จะกางหมุดเป็นวงให้เอง
  map.fitBounds(bounds, {
    padding: 72,
    maxZoom: spiderfyZoom,
    duration: 350,
  })
}

// ตำแหน่งของหมุดแต่ละอันตอนกางเป็นวงรอบจุดกลาง
const getSpiderOffset = (index, count) => {
  const angle = -Math.PI / 2 + (2 * Math.PI * index / count)

  // ให้วงใหญ่ขึ้นตามจำนวนหมุด ระยะห่างตามขอบวงจะได้ไม่น้อยกว่าความกว้างหมุด (~48px รวมช่องว่าง)
  const spacingPerPin = 48
  const radius = Math.max(36, (count * spacingPerPin) / (2 * Math.PI))

  return [Math.cos(angle) * radius, Math.sin(angle) * radius]
}

const createClusterElement = (cluster) => {
  const marker = document.createElement('button')
  marker.type = 'button'
  marker.className = 'incident-map-cluster'
  marker.setAttribute('aria-label', t('map.clusterLabel', { count: cluster.items.length }))

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
  // Mapbox เขียน transform ทับที่ตัว marker เพื่อวางตามพิกัด จึงต้องหมุนรูปหมุดที่ลูกข้างในแทน
  if (kind === 'incident') {
    const pin = document.createElement('span')
    pin.className = 'report-map-marker__pin'
    marker.appendChild(pin)
  }
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

    // ซูมลึกพอแล้วแต่ยังเป็นกลุ่มอยู่ = หมุดอยู่ใกล้กันมาก (หรือพิกัดเดียวกัน) ให้กางออกเป็นวง
    // (เดิมกางเฉพาะกลุ่มที่ทุกหมุดพิกัดตรงกันเป๊ะ กลุ่มที่ห่างกันไม่กี่เมตรจึงกดซูมเท่าไหร่ก็ไม่แยก)
    const shouldSpiderfy = isCluster && map.getZoom() >= spiderfyZoom

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
      renderIncidentPopup()
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
  clearIncidentPopup()
  incidentPopupApp?.unmount()
  incidentPopupApp = null
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
      map.flyTo({
        center: newCenter,
        zoom: newZoom,
        padding: props.selectedItem ? getPopupPadding() : { top: 0, right: 0, bottom: 0, left: 0 },
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

watch(() => props.selectedItem, () => {
  renderIncidentPopup()
}, { deep: true })

watch(() => props.selectedIncidentDetail, () => {
  renderIncidentPopup()
}, { deep: true })

watch(() => [props.editableLocation, props.reporterLocation], () => {
  renderReportLocations()
}, { deep: true })

// เปลี่ยนภาษาแล้ววาด popup ใหม่ (popup เป็น Vue app แยก จึงไม่อัปเดตเอง)
watch(locale, () => {
  renderIncidentPopup()
})
</script>

<style scoped>
/* ห้ามตั้ง position หรือ transform ที่ตัวหมุด: Mapbox ใส่ position: absolute และ transform ให้เองเพื่อวางหมุดตามพิกัด
   (เดิมตั้ง position: relative ไว้ ทำให้หมุดแต่ละอันถูกดันลงต่อจากอันก่อนหน้า หมุดจึงเลื่อนไปจากจุดจริง) */
:global(.incident-map-marker) {
  display: grid;
  place-items: center;
  width: 2.6rem;
  height: 2.8rem;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
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

:global(.incident-map-marker__count) {
  position: absolute;
  top: -0.55rem;
  right: -0.6rem;
  z-index: 2;
  display: grid;
  min-width: 1.15rem;
  height: 1.15rem;
  place-items: center;
  padding: 0 0.28rem;
  border: 2px solid #fff;
  border-radius: 999px;
  background: #102968;
  color: #fff;
  font-size: 0.66rem;
  font-weight: 800;
  line-height: 1;
  box-shadow: 0 2px 6px rgb(15 23 42 / 25%);
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

/* เหมือนตัวหมุด: ไม่ตั้ง position ให้ Mapbox วางตำแหน่งเอง */
:global(.incident-map-cluster) {
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
:global(.report-map-marker--incident) { width:2.35rem; height:2.48rem; border:0; border-radius:0; background:transparent; box-shadow:none }
/* หยดน้ำหมุน -45° ให้ปลายแหลมชี้ลงตรงกลางขอบล่าง (anchor: bottom = จุดพิกัดจริง) */
:global(.report-map-marker__pin) { position:absolute; top:0; left:50%; width:2.05rem; height:2.05rem; box-sizing:border-box; margin-left:-1.025rem; border:3px solid #fff; border-radius:50% 50% 50% 0; background:#e8343e; box-shadow:0 .28rem .75rem rgb(15 23 42 / 26%); transform:rotate(-45deg); transform-origin:center }
:global(.report-map-marker__pin::after) { position:absolute; inset:.4rem; border-radius:50%; background:#fff; content:'' }
:global(.report-map-marker--reporter) { background:#1479ef }

:global(.geospread-incident-popup) { z-index:4; }
:global(.geospread-incident-popup .mapboxgl-popup-content) { padding:1rem; border-radius:1rem; background:#fff; box-shadow:0 .85rem 2rem rgb(15 41 104 / 22%); }
:global(.geospread-incident-popup .mapboxgl-popup-tip) { border-top-color:#fff; }

</style>
