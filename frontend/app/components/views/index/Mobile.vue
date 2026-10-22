<template>
  <div class="mobile-home">
    <header class="mobile-home__header">
      <NuxtLink to="/" class="mobile-home__brand" aria-label="GeoSpread หน้าหลัก">
        <img src="/logos/logo.png" alt="" aria-hidden="true">
        <span><strong>GeoSpread</strong><small>ชุมชนปลอดภัย ไปด้วยกัน</small></span>
      </NuxtLink>
      <button type="button" class="mobile-home__menu-button" aria-label="เปิดเมนูเพิ่มเติม" :aria-expanded="isMenuOpen" @click="isMenuOpen = !isMenuOpen">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      <nav v-if="isMenuOpen" class="mobile-home__menu" aria-label="เมนูเพิ่มเติม">
        <NuxtLink to="/followed-locations" @click="isMenuOpen = false">พื้นที่ที่ติดตาม</NuxtLink>
        <NuxtLink to="/safety-guide" @click="isMenuOpen = false">คู่มือความปลอดภัย</NuxtLink>
        <NuxtLink to="/settings" @click="isMenuOpen = false">การตั้งค่า</NuxtLink>
      </nav>
    </header>

    <section class="mobile-home__map-section" aria-label="แผนที่เหตุการณ์">
      <MapboxMap :center="activeMapCenter" :zoom="activeMapZoom" :map-items="publicMapItems" :selected-item-id="selectedIncident?.id" :reporter-location="userLocation" class="mobile-home__map" @select-item="selectIncident" />
      <MapLocationSearch class="mobile-home__location-search" :is-locating="isLocating" :location-error="locationError" @locate="focusCurrentLocation" @select="selectArea" @clear-selection="clearAreaSelection" />
      <p v-if="mapError" class="mobile-home__map-error">{{ mapError }}</p>
      <IncidentMapPopup class="mobile-home__map-popup" :incident="selectedIncidentPreview" @close="clearSelectedIncident" />
    </section>

    <section class="mobile-home__nearby" aria-labelledby="mobile-nearby-title">
      <div class="mobile-home__sheet-handle" aria-hidden="true" />
      <header class="mobile-home__nearby-header">
        <div><h1 id="mobile-nearby-title">เหตุการณ์ใกล้คุณ</h1><p>ติดตามสถานการณ์ในพื้นที่ที่เลือก</p></div>
        <NuxtLink to="/incidents" class="mobile-home__view-all">ดูทั้งหมด <span aria-hidden="true">›</span></NuxtLink>
      </header>
      <p v-if="isLoadingMap" class="mobile-home__state">กำลังโหลดเหตุการณ์...</p>
      <p v-else-if="mapError" class="mobile-home__state mobile-home__state--error">{{ mapError }}</p>
      <p v-else-if="!nearbyIncidentCards.length" class="mobile-home__state">ยังไม่มีเหตุการณ์ใกล้พื้นที่นี้</p>
      <div v-else class="mobile-home__incident-list">
        <button v-for="incident in nearbyIncidentCards.slice(0, 4)" :key="incident.id" type="button" class="mobile-incident" :class="{ 'mobile-incident--selected': selectedIncident?.id === incident.id }" @click="selectIncident(incident)">
          <div class="mobile-incident__media" :class="{ 'mobile-incident__media--empty': !incident.imageUrl }">
            <img v-if="incident.imageUrl" :src="incident.imageUrl" :alt="incident.title"><img v-else :src="incident.iconUrl || '/icons/Alert.svg'" alt="" aria-hidden="true">
          </div>
          <div class="mobile-incident__content">
            <span class="mobile-incident__category" :style="{ backgroundColor: incident.markerColor || '#1479ef' }"><img :src="incident.iconUrl || '/icons/Alert.svg'" alt="" aria-hidden="true">{{ incident.category || 'เหตุการณ์' }}</span>
            <h2>{{ previewText(incident) }}</h2>
            <p class="mobile-incident__area"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Zm0-8.5a2.5 2.5 0 1 1 0-5" /></svg>{{ incident.areaLabel || 'พื้นที่ที่รายงาน' }}</p>
            <p class="mobile-incident__meta"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3.2 2" /></svg>{{ incident.distanceFromUserLabel || incident.distance || 'ยังไม่ทราบระยะทาง' }} · {{ incident.time || 'เมื่อสักครู่' }}</p>
          </div>
          <div class="mobile-incident__side"><span class="mobile-incident__status" :class="`mobile-incident__status--${incident.statusTone || 'pending'}`">{{ incident.statusLabel || 'รอตรวจสอบ' }}</span><svg class="mobile-incident__arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg></div>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import MapboxMap from '~/components/map/MapboxMap.vue'
import IncidentMapPopup from '~/components/map/IncidentMapPopup.vue'
import MapLocationSearch from '~/components/map/MapLocationSearch.vue'
import { useGeolocation } from '~/composables/useGeolocation'

const { selectedIncident, selectedIncidentPreview, publicMapItems, userLocation, nearbyIncidentCards, isLoadingMap, mapError, mapCenter, selectIncident, clearSelectedIncident, setUserLocation, fetchPublicMapItems } = useHomeDashboard()
const { getCurrentLocation, isLocating, locationError } = useGeolocation()
const selectedArea = ref(null)
const isMenuOpen = ref(false)
const activeMapCenter = computed(() => selectedArea.value?.center || mapCenter.value)
const activeMapZoom = computed(() => selectedArea.value?.zoom || 11)
const previewText = (incident) => String(incident?.description || '').trim() || incident?.title || 'ยังไม่มีรายละเอียดเพิ่มเติม'
const selectArea = (area) => { selectedArea.value = area; clearSelectedIncident() }
const clearAreaSelection = () => { selectedArea.value = null; clearSelectedIncident() }
const focusCurrentLocation = async () => {
  try {
    const location = await getCurrentLocation()
    setUserLocation(location)
    selectedArea.value = { center: [location.lng, location.lat], zoom: 13 }
    clearSelectedIncident()
  } catch { /* MapLocationSearch renders the error. */ }
}
onMounted(() => { void fetchPublicMapItems() })
</script>

<style scoped>
.mobile-home { position:relative; min-height:100%; overflow:hidden; background:#dceef1; color:#102968; }
.mobile-home__header { position:absolute; z-index:20; top:0; right:0; left:0; display:flex; align-items:center; justify-content:space-between; min-height:5.4rem; padding:max(.75rem, env(safe-area-inset-top)) 1rem .7rem; background:rgb(255 255 255 / 97%); box-shadow:0 .25rem 1rem rgb(16 41 104 / 8%); }
.mobile-home__brand { display:inline-flex; min-width:0; align-items:center; gap:.55rem; color:#102968; text-decoration:none; }.mobile-home__brand img { width:2.7rem; height:2.7rem; object-fit:contain; }.mobile-home__brand span { display:grid; min-width:0; }.mobile-home__brand strong { font-size:1.45rem; font-weight:900; letter-spacing:-.055em; line-height:1; }.mobile-home__brand small { margin-top:.2rem; color:#5b7096; font-size:.69rem; font-weight:700; white-space:nowrap; }
.mobile-home__menu-button { display:grid; width:2.75rem; height:2.75rem; flex:0 0 auto; padding:0; place-items:center; border:0; border-radius:.75rem; background:#f1f6fc; color:#102968; cursor:pointer; }.mobile-home__menu-button svg { width:1.55rem; height:1.55rem; fill:none; stroke:currentColor; stroke-linecap:round; stroke-width:2.5; }.mobile-home__menu { position:absolute; top:calc(100% - .15rem); right:.85rem; display:grid; min-width:11.5rem; padding:.45rem; border-radius:.85rem; background:#fff; box-shadow:0 .75rem 1.75rem rgb(16 41 104 / 20%); }.mobile-home__menu a { padding:.72rem .82rem; border-radius:.55rem; color:#183c75; font-size:.83rem; font-weight:800; text-decoration:none; }.mobile-home__menu a:active { background:#edf5ff; color:#146ee7; }
.mobile-home__map-section { position:absolute; inset:0; z-index:1; }.mobile-home__map { width:100%!important; height:100%!important; min-height:0!important; border:0!important; border-radius:0!important; box-shadow:none!important; }.mobile-home__location-search:deep(.map-location-tools) { top:6.05rem; left:.9rem; width:calc(100% - 5.9rem); }.mobile-home__location-search:deep(.map-location-tools__current-location) { min-width:2.9rem; }.mobile-home__location-search:deep(.map-location-tools__search) { min-height:3.1rem; border-radius:.9rem; }.mobile-home__location-search:deep(.map-location-tools__search input) { font-size:.95rem; }.mobile-home__location-search:deep(.map-location-tools__results) { max-height:min(19rem, calc(100dvh - 11rem)); }
.mobile-home__map-error { position:absolute; top:10rem; right:1rem; left:1rem; z-index:6; margin:0; padding:.65rem .8rem; border-radius:.7rem; background:rgb(255 247 247 / 96%); color:#b91c1c; font-size:.78rem; font-weight:750; box-shadow:0 .5rem 1.1rem rgb(127 29 29 / 12%); }.mobile-home__map-popup { position:absolute; z-index:5; right:1rem; bottom:calc(min(52dvh, 28rem) + .8rem); left:1rem; width:auto; }
.mobile-home__nearby { position:absolute; right:0; bottom:0; left:0; z-index:10; display:grid; gap:.85rem; max-height:min(52dvh, 28rem); padding:.7rem 1rem calc(.8rem + env(safe-area-inset-bottom)); overflow:auto; border-radius:1.45rem 1.45rem 0 0; background:rgb(255 255 255 / 98%); box-shadow:0 -1rem 2.5rem rgb(19 55 104 / 20%); }.mobile-home__sheet-handle { width:2.7rem; height:.32rem; margin:0 auto -.15rem; border-radius:999px; background:#dce5f1; }.mobile-home__nearby-header { display:flex; align-items:start; justify-content:space-between; gap:.75rem; }.mobile-home__nearby h1 { margin:0; color:#102968; font-size:clamp(1.15rem, 5.5vw, 1.5rem); font-weight:900; letter-spacing:-.035em; line-height:1.1; }.mobile-home__nearby-header p { margin:.24rem 0 0; color:#60779e; font-size:.72rem; font-weight:650; }.mobile-home__view-all { display:inline-flex; flex:0 0 auto; align-items:center; gap:.22rem; margin-top:.15rem; color:#146ee7; font-size:.84rem; font-weight:850; text-decoration:none; }.mobile-home__view-all span { font-size:1.5rem; font-weight:500; line-height:.65; }.mobile-home__state { margin:0; padding:.85rem; border-radius:.75rem; background:#f4f8fd; color:#58729a; font-size:.8rem; font-weight:750; }.mobile-home__state--error { background:#fff1f1; color:#b91c1c; }.mobile-home__incident-list { display:grid; gap:.6rem; }
.mobile-incident { display:grid; grid-template-columns:4.8rem minmax(0,1fr) auto; align-items:center; gap:.65rem; width:100%; min-height:5.9rem; padding:.45rem; border:1px solid #e1eaf5; border-radius:.9rem; background:#fff; color:inherit; font:inherit; text-align:left; cursor:pointer; box-shadow:0 .3rem .9rem rgb(30 65 120 / 5%); }.mobile-incident--selected { border-color:#4b90f5; background:#f7fbff; }.mobile-incident__media { display:grid; width:4.8rem; height:4.8rem; place-items:center; overflow:hidden; border-radius:.65rem; background:#eaf2fb; }.mobile-incident__media>img { width:100%; height:100%; object-fit:cover; }.mobile-incident__media--empty>img { width:2rem; height:2rem; object-fit:contain; filter:invert(32%) sepia(71%) saturate(1671%) hue-rotate(199deg) brightness(96%) contrast(93%); }.mobile-incident__content { min-width:0; }.mobile-incident__category { display:inline-flex; max-width:100%; align-items:center; gap:.28rem; padding:.25rem .45rem; overflow:hidden; border-radius:999px; color:#fff; font-size:.65rem; font-weight:850; line-height:1.1; text-overflow:ellipsis; white-space:nowrap; }.mobile-incident__category img { width:.78rem; height:.78rem; flex:0 0 auto; object-fit:contain; filter:brightness(0) invert(1); }.mobile-incident h2 { display:-webkit-box; margin:.32rem 0 .25rem; overflow:hidden; color:#102968; font-size:.83rem; font-weight:850; letter-spacing:-.018em; line-height:1.22; -webkit-box-orient:vertical; -webkit-line-clamp:2; }.mobile-incident__area,.mobile-incident__meta { display:flex; min-width:0; align-items:center; gap:.25rem; margin:.14rem 0 0; overflow:hidden; color:#62799d; font-size:.66rem; font-weight:650; line-height:1.2; text-overflow:ellipsis; white-space:nowrap; }.mobile-incident__area svg,.mobile-incident__meta svg { width:.86rem; height:.86rem; flex:0 0 auto; fill:none; stroke:currentColor; stroke-linecap:round; stroke-linejoin:round; stroke-width:2; }.mobile-incident__side { display:grid; align-self:stretch; align-items:center; justify-items:end; gap:.5rem; padding:.2rem .15rem .2rem 0; }.mobile-incident__status { padding:.27rem .42rem; border-radius:999px; font-size:.57rem; font-weight:850; line-height:1; white-space:nowrap; }.mobile-incident__status--pending { background:#fff0df; color:#c65d00; }.mobile-incident__status--ongoing { background:#e5efff; color:#1768d7; }.mobile-incident__status--verified { background:#e0f5e9; color:#18764a; }.mobile-incident__arrow { width:1.15rem; height:1.15rem; fill:none; stroke:#6a81a6; stroke-linecap:round; stroke-linejoin:round; stroke-width:2.2; }
.mobile-home__menu-button:focus-visible,.mobile-home__menu a:focus-visible,.mobile-home__view-all:focus-visible,.mobile-incident:focus-visible { outline:3px solid rgb(20 110 231 / 35%); outline-offset:3px; }.mobile-home__menu-button:active,.mobile-incident:active { transform:scale(.985); }@media (min-width:30rem) { .mobile-home__header { padding-right:1.25rem; padding-left:1.25rem; }.mobile-home__location-search:deep(.map-location-tools) { left:1.25rem; width:calc(100% - 6.5rem); }.mobile-home__nearby { padding-right:1.25rem; padding-left:1.25rem; } }@media (max-height:42rem) { .mobile-home__nearby { max-height:46dvh; }.mobile-home__map-popup { bottom:calc(46dvh + .6rem); }.mobile-home__nearby-header p { display:none; } }
</style>
