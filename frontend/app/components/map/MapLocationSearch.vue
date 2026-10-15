<template>
  <div ref="toolsRoot" class="map-location-tools" @keydown.esc="closeResults">
    <div class="map-location-tools__bar">
      <button
        v-if="!selectedArea"
        type="button"
        class="map-location-tools__current-location"
        :disabled="isLocating"
        @click="$emit('locate')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Zm0-8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" /></svg>
        <span>{{ isLocating ? 'กำลังค้นหาตำแหน่ง…' : 'ใช้ตำแหน่งปัจจุบัน' }}</span>
      </button>
      <div v-else class="map-location-tools__selected-area" aria-live="polite">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Zm0-8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" /></svg>
        <span>{{ selectedArea }}</span>
        <button type="button" aria-label="ล้างพื้นที่ที่เลือก" @click="clearSelectedArea">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg>
        </button>
      </div>

      <label class="map-location-tools__search">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.2" /><path d="m16 16 4.2 4.2" /></svg>
        <input
          v-model="query"
          type="search"
          placeholder="ค้นหาเมือง จังหวัด หรือสถานที่..."
          aria-label="ค้นหาพื้นที่บนแผนที่"
          @focus="showResults = true"
          @keydown.enter.prevent="selectFirstResult"
        />
        <button v-if="query" type="button" aria-label="ล้างคำค้นหา" @click="clearSearch">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg>
        </button>
      </label>
    </div>

    <Transition name="map-search-results">
      <section v-if="showResults && normalizedQuery" class="map-location-tools__results" aria-label="ผลการค้นหาพื้นที่">
        <p v-if="results.length" class="map-location-tools__results-title">
          {{ isSearching ? 'กำลังค้นหาสถานที่…' : 'เลือกพื้นที่' }}
        </p>
        <button
          v-for="area in results"
          :key="`${area.label}-${area.center.join('-')}`"
          type="button"
          class="map-location-tools__result"
          @click="selectArea(area)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Zm0-8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" /></svg>
          <span>{{ area.label }}</span>
          <small>{{ area.description || 'ดูเหตุการณ์ในพื้นที่นี้' }}</small>
        </button>
        <p v-if="!results.length" class="map-location-tools__empty">ไม่พบพื้นที่ที่ค้นหา</p>
      </section>
    </Transition>

    <p v-if="locationError" class="map-location-tools__error" role="alert">{{ locationError }}</p>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

defineProps({
  isLocating: { type: Boolean, default: false },
  locationError: { type: String, default: '' }
})

const emit = defineEmits(['locate', 'select', 'clear-selection'])
const config = useRuntimeConfig()
const toolsRoot = ref(null)
const query = ref('')
const showResults = ref(false)
const selectedArea = ref('')
const remoteResults = ref([])
const isSearching = ref(false)
let searchTimer = null
let activeSearchId = 0

const area = (label, center, aliases = []) => ({ label, center, aliases, zoom: 8.2, description: 'จังหวัด' })
const areas = [
  area('กรุงเทพมหานคร', [100.5018, 13.7563], ['กรุงเทพ', 'กรุงเทพฯ', 'บางกอก']),
  area('กระบี่', [98.91, 8.09]), area('กาญจนบุรี', [99.53, 14.02]), area('กาฬสินธุ์', [103.5, 16.43]),
  area('กำแพงเพชร', [99.52, 16.482]), area('ขอนแก่น', [102.83, 16.44]), area('จันทบุรี', [102.1, 12.61]),
  area('ฉะเชิงเทรา', [101.08, 13.69]), area('ชลบุรี', [100.985, 13.36]), area('ชัยนาท', [100.125, 15.185]),
  area('ชัยภูมิ', [102.03, 15.8]), area('ชุมพร', [99.18, 10.49]), area('เชียงราย', [99.8325, 19.9105]),
  area('เชียงใหม่', [98.9853, 18.7883]), area('ตรัง', [99.61, 7.56]), area('ตราด', [102.51, 12.24]),
  area('ตาก', [99.126, 16.875]), area('นครนายก', [101.213, 14.206]), area('นครปฐม', [100.061, 13.819]),
  area('นครพนม', [104.78, 17.4]), area('นครราชสีมา', [102.1, 14.97]), area('นครศรีธรรมราช', [100.1, 8.43]),
  area('นครสวรรค์', [100.119, 15.704]), area('นนทบุรี', [100.514, 13.86]), area('นราธิวาส', [101.82, 6.43]),
  area('น่าน', [100.775, 18.785]), area('บึงกาฬ', [103.65, 18.36]), area('บุรีรัมย์', [103.1, 14.995]),
  area('ปทุมธานี', [100.526, 14.02]), area('ประจวบคีรีขันธ์', [99.79, 11.81]), area('ปราจีนบุรี', [101.37, 14.05]),
  area('ปัตตานี', [101.25, 6.87]), area('พระนครศรีอยุธยา', [100.57, 14.353], ['อยุธยา']), area('พะเยา', [99.898, 19.166]),
  area('พังงา', [98.53, 8.45]), area('พัทลุง', [100.08, 7.62]), area('พิจิตร', [100.348, 16.443]),
  area('พิษณุโลก', [100.264, 16.821]), area('เพชรบุรี', [99.94, 13.11]), area('เพชรบูรณ์', [101.16, 16.419]),
  area('แพร่', [100.141, 18.145]), area('ภูเก็ต', [98.34, 7.88]),
  area('มหาสารคาม', [103.3, 16.18]), area('มุกดาหาร', [104.72, 16.54]), area('แม่ฮ่องสอน', [97.967, 19.3]),
  area('ยโสธร', [104.15, 15.79]), area('ยะลา', [101.28, 6.54]), area('ร้อยเอ็ด', [103.65, 16.05]),
  area('ระนอง', [98.62, 9.96]), area('ระยอง', [101.275, 12.68]), area('ราชบุรี', [99.82, 13.53]),
  area('ลพบุรี', [100.653, 14.799]), area('ลำปาง', [99.504, 18.288]), area('ลำพูน', [98.993, 18.574]),
  area('เลย', [101.73, 17.49]), area('ศรีสะเกษ', [104.33, 15.12]), area('สกลนคร', [104.15, 17.15]),
  area('สงขลา', [100.59, 7.18]), area('สตูล', [100.07, 6.62]), area('สมุทรปราการ', [100.595, 13.599]),
  area('สมุทรสงคราม', [100, 13.414]), area('สมุทรสาคร', [100.273, 13.548]), area('สระแก้ว', [102.07, 13.82]),
  area('สระบุรี', [100.91, 14.53]), area('สิงห์บุรี', [100.396, 14.893]), area('สุโขทัย', [99.823, 17.007]),
  area('สุพรรณบุรี', [100.12, 14.474]), area('สุราษฎร์ธานี', [99.32, 9.13]), area('สุรินทร์', [103.49, 14.88]),
  area('หนองคาย', [102.75, 17.87]), area('หนองบัวลำภู', [102.42, 17.2]), area('อ่างทอง', [100.45, 14.589]),
  area('อำนาจเจริญ', [104.625, 15.865]), area('อุดรธานี', [102.8, 17.4]), area('อุตรดิตถ์', [100.096, 17.62]),
  area('อุทัยธานี', [100.024, 15.383]), area('อุบลราชธานี', [104.86, 15.23])
]

const normalizedQuery = computed(() => query.value.trim().replace('ฯ', ''))
const results = computed(() => {
  const term = normalizedQuery.value
  if (!term) return []
  const localResults = areas.filter((item) => `${item.label} ${item.aliases.join(' ')}`.replace('ฯ', '').includes(term))
  const localNames = new Set(localResults.map((item) => item.label))
  return [...localResults, ...remoteResults.value.filter((item) => !localNames.has(item.label))].slice(0, 8)
})

const searchMapboxPlaces = async (term) => {
  if (!config.public.mapboxToken) return

  const requestId = ++activeSearchId
  isSearching.value = true

  try {
    const response = await $fetch('https://api.mapbox.com/search/geocode/v6/forward', {
      query: {
        q: term,
        country: 'th',
        language: 'th',
        limit: 5,
        types: 'place,locality,neighborhood,address,poi',
        access_token: config.public.mapboxToken,
      },
    })

    if (requestId !== activeSearchId) return

    remoteResults.value = (response.features || [])
      .map((feature) => {
        const center = feature.geometry?.coordinates
        if (!Array.isArray(center) || center.length < 2) return null

        const properties = feature.properties || {}
        return {
          label: properties.name_preferred || properties.name || feature.text || feature.place_name || term,
          description: properties.place_formatted || feature.place_formatted || 'สถานที่',
          center: [Number(center[0]), Number(center[1])],
          zoom: 14,
        }
      })
      .filter((item) => item && item.center.every(Number.isFinite))
  } catch {
    if (requestId === activeSearchId) remoteResults.value = []
  } finally {
    if (requestId === activeSearchId) isSearching.value = false
  }
}

watch(normalizedQuery, (term) => {
  remoteResults.value = []
  isSearching.value = false
  activeSearchId += 1
  if (searchTimer) clearTimeout(searchTimer)
  if (term.length < 2) return

  searchTimer = setTimeout(() => { void searchMapboxPlaces(term) }, 450)
})

const closeResults = () => { showResults.value = false }
const clearSearch = () => { query.value = ''; showResults.value = false }
const selectArea = (item) => {
  selectedArea.value = item.label
  clearSearch()
  emit('select', item)
}
const clearSelectedArea = () => {
  selectedArea.value = ''
  emit('clear-selection')
}
const selectFirstResult = () => {
  if (results.value[0]) selectArea(results.value[0])
}
const handleDocumentClick = (event) => {
  if (toolsRoot.value && !toolsRoot.value.contains(event.target)) closeResults()
}

onMounted(() => document.addEventListener('click', handleDocumentClick))
onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<style scoped>
.map-location-tools { position: absolute; z-index: 4; top: 1rem; left: 1rem; width: min(34rem, calc(100% - 6rem)); }
.map-location-tools__bar { display: flex; align-items: stretch; gap: .45rem; }
.map-location-tools__current-location, .map-location-tools__selected-area, .map-location-tools__search { min-height: 2.65rem; border: 1px solid #c9ddfa; border-radius: .75rem; background: #fff; box-shadow: 0 .5rem 1.2rem rgb(30 64 175 / 16%); }
.map-location-tools__current-location { display: inline-flex; flex: 0 0 auto; align-items: center; gap: .42rem; padding: .55rem .75rem; color: #1d4ed8; font: inherit; font-size: .78rem; font-weight: 800; cursor: pointer; }
.map-location-tools__current-location:hover { border-color: #2563eb; background: #eff6ff; }
.map-location-tools__current-location:disabled { cursor: wait; opacity: .75; }
.map-location-tools__current-location svg, .map-location-tools__selected-area > svg, .map-location-tools__result > svg { width: 1.08rem; height: 1.08rem; flex: 0 0 auto; fill: currentColor; }
.map-location-tools__selected-area { display: inline-flex; min-width: 0; flex: 0 1 auto; align-items: center; gap: .42rem; padding: .32rem .38rem .32rem .7rem; color: #1d4ed8; font-size: .78rem; font-weight: 800; }
.map-location-tools__selected-area > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.map-location-tools__selected-area button { display: grid; width: 1.7rem; height: 1.7rem; flex: 0 0 auto; padding: 0; place-items: center; border: 0; border-radius: .5rem; background: #eaf2ff; color: #3565b5; cursor: pointer; }
.map-location-tools__selected-area button:hover { background: #d9e8ff; color: #1d4ed8; }
.map-location-tools__selected-area button svg { width: .9rem; height: .9rem; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 2; }
.map-location-tools__search { display: flex; min-width: 0; flex: 1; align-items: center; gap: .42rem; padding: 0 .7rem; color: #5d78a5; }
.map-location-tools__search > svg { width: 1.05rem; height: 1.05rem; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 2; }
.map-location-tools__search input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: #163b72; font: inherit; font-size: .8rem; }
.map-location-tools__search input::placeholder { color: #8094b5; opacity: 1; }
.map-location-tools__search:focus-within { border-color: #2563eb; box-shadow: 0 0 0 3px rgb(37 99 235 / 18%), 0 .5rem 1.2rem rgb(30 64 175 / 16%); }
.map-location-tools__search button { display: grid; width: 1.45rem; height: 1.45rem; padding: 0; place-items: center; border: 0; border-radius: 50%; background: #eaf2ff; color: #3565b5; cursor: pointer; }
.map-location-tools__search button:hover { background: #d9e8ff; color: #1d4ed8; }
.map-location-tools__search button svg { width: .9rem; height: .9rem; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 2; }
.map-location-tools__current-location:focus-visible, .map-location-tools__selected-area button:focus-visible, .map-location-tools__search button:focus-visible, .map-location-tools__result:focus-visible { outline: 3px solid rgb(37 99 235 / 34%); outline-offset: 2px; }
.map-location-tools__results { width: min(21rem, 100%); max-height: min(22rem, calc(100dvh - 9rem)); margin-top: .5rem; overflow: auto; border: 1px solid #dbeafe; border-radius: .85rem; background: #fff; box-shadow: 0 .85rem 2rem rgb(30 64 175 / 22%); }
.map-location-tools__results-title { margin: 0; padding: .8rem .9rem .38rem; color: #6981a7; font-size: .7rem; font-weight: 800; }
.map-location-tools__result { display: grid; width: 100%; grid-template-columns: 1.1rem minmax(0, 1fr); column-gap: .55rem; padding: .58rem .78rem; border: 0; background: transparent; color: #1e3a8a; font: inherit; font-size: .8rem; font-weight: 800; text-align: left; cursor: pointer; }
.map-location-tools__result:hover { background: #eff6ff; color: #2563eb; }
.map-location-tools__result small { grid-column: 2; margin-top: .05rem; color: #7288aa; font-size: .68rem; font-weight: 650; }
.map-location-tools__empty { margin: 0; padding: .9rem; color: #6d819f; font-size: .78rem; font-weight: 700; }
.map-location-tools__error { width: fit-content; max-width: min(26rem, 100%); margin: .5rem 0 0; padding: .5rem .65rem; border-radius: .6rem; background: #fff7f7; color: #b91c1c; font-size: .72rem; font-weight: 700; box-shadow: 0 .4rem .9rem rgb(127 29 29 / 12%); }
.map-search-results-enter-active, .map-search-results-leave-active { transition: opacity 160ms ease, transform 190ms cubic-bezier(.22, 1, .36, 1); }
.map-search-results-enter-from, .map-search-results-leave-to { opacity: 0; transform: translateY(-.35rem) scale(.985); }
@media (prefers-reduced-motion: reduce) { .map-search-results-enter-active, .map-search-results-leave-active { transition: none; } }
@media (max-width: 48rem) { .map-location-tools { top: .75rem; left: .75rem; width: calc(100% - 5rem); } .map-location-tools__bar { align-items: stretch; } .map-location-tools__current-location span { display: none; } .map-location-tools__current-location { width: 2.65rem; justify-content: center; padding: 0; } .map-location-tools__selected-area { max-width: 10rem; } .map-location-tools__search input { font-size: .76rem; } }
</style>
