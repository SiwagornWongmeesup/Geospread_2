<template>
  <div
    ref="toolsRoot"
    class="map-location-tools"
    :class="{ 'map-location-tools--pick': variant === 'pick' }"
    @keydown.esc="closeResults"
  >
    <div class="map-location-tools__bar">
      <button
        v-if="variant === 'browse' && !selectedArea"
        type="button"
        class="map-location-tools__current-location"
        :disabled="isLocating"
        @click="$emit('locate')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Zm0-8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" /></svg>
        <span>{{ isLocating ? t('location.locating') : t('location.useCurrent') }}</span>
      </button>
      <div v-else-if="variant === 'browse'" class="map-location-tools__selected-area" aria-live="polite">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Zm0-8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" /></svg>
        <span>{{ selectedArea }}</span>
        <button type="button" :aria-label="t('search.clearArea')" @click="clearSelectedArea">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg>
        </button>
      </div>

      <label class="map-location-tools__search">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.2" /><path d="m16 16 4.2 4.2" /></svg>
        <input
          v-model="query"
          type="search"
          :placeholder="variant === 'pick' ? t('search.pickPlaceholder') : t('search.browsePlaceholder')"
          :aria-label="variant === 'pick' ? t('search.pickLabel') : t('search.browseLabel')"
          @focus="showResults = true"
          @input="showResults = true"
          @keydown.enter.prevent="selectFirstResult"
        />
        <button v-if="query" type="button" :aria-label="t('search.clearQuery')" @click="clearSearch">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg>
        </button>
      </label>
    </div>

    <Transition name="map-search-results">
      <section v-if="showResults && normalizedQuery" class="map-location-tools__results" :aria-label="t('search.resultsLabel')">
        <p v-if="results.length" class="map-location-tools__results-title">
          {{ isSearching ? t('search.searching') : variant === 'pick' ? t('search.pickTitle') : t('search.browseTitle') }}
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
          <small>{{ area.description || (variant === 'pick' ? t('search.pinHere') : t('search.viewArea')) }}</small>
        </button>
        <p v-if="coordinateInput.status === 'error'" class="map-location-tools__empty map-location-tools__empty--error">
          {{ t(coordinateInput.messageKey) }}
        </p>
        <p v-else-if="!results.length" class="map-location-tools__empty">
          {{ isSearching ? t('search.searching') : t('search.noResults') }}
        </p>
      </section>
    </Transition>

    <p v-if="locationError" class="map-location-tools__error" role="alert">{{ locationError }}</p>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { parseCoordinates } from '~/utils/parseCoordinates'

const props = defineProps({
  isLocating: { type: Boolean, default: false },
  locationError: { type: String, default: '' },
  // browse = หน้าแรก (เลื่อนดูพื้นที่) | pick = ฟอร์มเลือกตำแหน่ง (ปักหมุด) ไม่มีปุ่มตำแหน่งปัจจุบันซ้ำ
  variant: { type: String, default: 'browse' },
})

const emit = defineEmits(['locate', 'select', 'clear-selection'])
const config = useRuntimeConfig()
const { t, locale } = useLocale()
const toolsRoot = ref(null)
const query = ref('')
const showResults = ref(false)
const selectedArea = ref('')
const remoteResults = ref([])
const isSearching = ref(false)
let searchTimer = null
let activeSearchId = 0

// ชื่อจังหวัดภาษาอังกฤษ ใช้แสดงตอนเลือกภาษาอังกฤษ และให้พิมพ์ค้นหาเป็นภาษาอังกฤษได้
const provinceNamesEn = {
  'กรุงเทพมหานคร': 'Bangkok',
  'กระบี่': 'Krabi',
  'กาญจนบุรี': 'Kanchanaburi',
  'กาฬสินธุ์': 'Kalasin',
  'กำแพงเพชร': 'Kamphaeng Phet',
  'ขอนแก่น': 'Khon Kaen',
  'จันทบุรี': 'Chanthaburi',
  'ฉะเชิงเทรา': 'Chachoengsao',
  'ชลบุรี': 'Chonburi',
  'ชัยนาท': 'Chai Nat',
  'ชัยภูมิ': 'Chaiyaphum',
  'ชุมพร': 'Chumphon',
  'เชียงราย': 'Chiang Rai',
  'เชียงใหม่': 'Chiang Mai',
  'ตรัง': 'Trang',
  'ตราด': 'Trat',
  'ตาก': 'Tak',
  'นครนายก': 'Nakhon Nayok',
  'นครปฐม': 'Nakhon Pathom',
  'นครพนม': 'Nakhon Phanom',
  'นครราชสีมา': 'Nakhon Ratchasima',
  'นครศรีธรรมราช': 'Nakhon Si Thammarat',
  'นครสวรรค์': 'Nakhon Sawan',
  'นนทบุรี': 'Nonthaburi',
  'นราธิวาส': 'Narathiwat',
  'น่าน': 'Nan',
  'บึงกาฬ': 'Bueng Kan',
  'บุรีรัมย์': 'Buriram',
  'ปทุมธานี': 'Pathum Thani',
  'ประจวบคีรีขันธ์': 'Prachuap Khiri Khan',
  'ปราจีนบุรี': 'Prachinburi',
  'ปัตตานี': 'Pattani',
  'พระนครศรีอยุธยา': 'Phra Nakhon Si Ayutthaya',
  'พะเยา': 'Phayao',
  'พังงา': 'Phang Nga',
  'พัทลุง': 'Phatthalung',
  'พิจิตร': 'Phichit',
  'พิษณุโลก': 'Phitsanulok',
  'เพชรบุรี': 'Phetchaburi',
  'เพชรบูรณ์': 'Phetchabun',
  'แพร่': 'Phrae',
  'ภูเก็ต': 'Phuket',
  'มหาสารคาม': 'Maha Sarakham',
  'มุกดาหาร': 'Mukdahan',
  'แม่ฮ่องสอน': 'Mae Hong Son',
  'ยโสธร': 'Yasothon',
  'ยะลา': 'Yala',
  'ร้อยเอ็ด': 'Roi Et',
  'ระนอง': 'Ranong',
  'ระยอง': 'Rayong',
  'ราชบุรี': 'Ratchaburi',
  'ลพบุรี': 'Lopburi',
  'ลำปาง': 'Lampang',
  'ลำพูน': 'Lamphun',
  'เลย': 'Loei',
  'ศรีสะเกษ': 'Sisaket',
  'สกลนคร': 'Sakon Nakhon',
  'สงขลา': 'Songkhla',
  'สตูล': 'Satun',
  'สมุทรปราการ': 'Samut Prakan',
  'สมุทรสงคราม': 'Samut Songkhram',
  'สมุทรสาคร': 'Samut Sakhon',
  'สระแก้ว': 'Sa Kaeo',
  'สระบุรี': 'Saraburi',
  'สิงห์บุรี': 'Sing Buri',
  'สุโขทัย': 'Sukhothai',
  'สุพรรณบุรี': 'Suphan Buri',
  'สุราษฎร์ธานี': 'Surat Thani',
  'สุรินทร์': 'Surin',
  'หนองคาย': 'Nong Khai',
  'หนองบัวลำภู': 'Nong Bua Lamphu',
  'อ่างทอง': 'Ang Thong',
  'อำนาจเจริญ': 'Amnat Charoen',
  'อุดรธานี': 'Udon Thani',
  'อุตรดิตถ์': 'Uttaradit',
  'อุทัยธานี': 'Uthai Thani',
  'อุบลราชธานี': 'Ubon Ratchathani',
}

const area = (label, center, aliases = []) => ({ label, en: provinceNamesEn[label], center, aliases, zoom: 8.2, kind: 'province' })
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
// ถ้าผู้ใช้พิมพ์/วางพิกัดหรือลิงก์ Google Maps ให้ปักหมุดตามพิกัดแทนการค้นหาชื่อ
const coordinateInput = computed(() => parseCoordinates(query.value))
const results = computed(() => {
  const term = normalizedQuery.value
  if (!term) return []
  const coordinates = coordinateInput.value
  if (coordinates.status === 'ok') {
    return [{
      label: t('search.coordinateLabel', { lat: coordinates.lat.toFixed(6), lng: coordinates.lng.toFixed(6) }),
      description: coordinates.swapped ? t('search.coordinateSwapped') : t('search.coordinatePin'),
      center: [coordinates.lng, coordinates.lat],
      zoom: 16,
      kind: 'coordinates',
    }]
  }
  if (coordinates.status === 'error') return []
  const lowerTerm = term.toLowerCase()
  const localResults = areas
    .filter((item) => `${item.label} ${item.aliases.join(' ')} ${item.en}`.replace('ฯ', '').toLowerCase().includes(lowerTerm))
    .map((item) => ({
      ...item,
      label: locale.value === 'en' ? item.en : item.label,
      description: t('search.province'),
    }))
  const localNames = new Set(localResults.map((item) => item.label))
  return [...localResults, ...remoteResults.value.filter((item) => !localNames.has(item.label))].slice(0, 8)
})

const searchMapboxPlaces = async (term) => {
  if (!config.public.mapboxToken) return

  const requestId = ++activeSearchId
  isSearching.value = true

  try {
    // ใช้ Search Box API เพราะ Geocoding v6 ไม่รองรับ type 'poi' (ส่งไปจะได้ 422 และหาสถานที่อย่างตลาด/ห้างไม่เจอ)
    const response = await $fetch('https://api.mapbox.com/search/searchbox/v1/forward', {
      query: {
        q: term,
        country: 'th',
        language: locale.value,
        limit: 6,
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
          description: properties.full_address || properties.place_formatted || t('search.place'),
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
  if (term.length < 2 || coordinateInput.value.status !== 'none') return

  searchTimer = setTimeout(() => { void searchMapboxPlaces(term) }, 450)
})

const closeResults = () => { showResults.value = false }
const clearSearch = () => { query.value = ''; showResults.value = false }
const selectArea = (item) => {
  if (props.variant === 'browse') selectedArea.value = item.label
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
.map-location-tools__current-location, .map-location-tools__selected-area, .map-location-tools__search { min-height: 2.65rem; border: 1px solid var(--gs-line-strong); border-radius: var(--gs-radius-sm); background: var(--gs-surface); box-shadow: 0 2px 6px rgb(23 32 46 / 12%); }
.map-location-tools__current-location { display: inline-flex; flex: 0 0 auto; align-items: center; gap: .42rem; padding: .55rem .75rem; color: var(--gs-action); font: inherit; font-size: .85rem; font-weight: 600; cursor: pointer; }
.map-location-tools__current-location:hover { border-color: var(--gs-action); background: var(--gs-surface-sunken); }
.map-location-tools__current-location:disabled { cursor: wait; opacity: .75; }
.map-location-tools__current-location svg, .map-location-tools__selected-area > svg, .map-location-tools__result > svg { width: 1.08rem; height: 1.08rem; flex: 0 0 auto; fill: currentColor; }
.map-location-tools__selected-area { display: inline-flex; min-width: 0; flex: 0 1 auto; align-items: center; gap: .42rem; padding: .32rem .38rem .32rem .7rem; color: var(--gs-action); font-size: .85rem; font-weight: 600; }
.map-location-tools__selected-area > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.map-location-tools__selected-area button { display: grid; width: 1.7rem; height: 1.7rem; flex: 0 0 auto; padding: 0; place-items: center; border: 0; border-radius: .5rem; background: var(--gs-action-tint); color: var(--gs-action); cursor: pointer; }
.map-location-tools__selected-area button:hover { background: #d9dfe8; color: var(--gs-action-hover); }
.map-location-tools__selected-area button svg { width: .9rem; height: .9rem; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 2; }
.map-location-tools__search { display: flex; min-width: 0; flex: 1; align-items: center; gap: .42rem; padding: 0 .7rem; color: var(--gs-muted); }
.map-location-tools__search > svg { width: 1.05rem; height: 1.05rem; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 2; }
.map-location-tools__search input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--gs-ink); font: inherit; font-size: .875rem; }
.map-location-tools__search input::placeholder { color: var(--gs-muted); opacity: 1; }
.map-location-tools__search:focus-within { border-color: var(--gs-action); box-shadow: var(--gs-focus), 0 2px 6px rgb(23 32 46 / 12%); }
.map-location-tools__search button { display: grid; width: 1.45rem; height: 1.45rem; padding: 0; place-items: center; border: 0; border-radius: 50%; background: var(--gs-action-tint); color: var(--gs-action); cursor: pointer; }
.map-location-tools__search button:hover { background: #d9dfe8; color: var(--gs-action-hover); }
.map-location-tools__search button svg { width: .9rem; height: .9rem; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 2; }
.map-location-tools__current-location:focus-visible, .map-location-tools__selected-area button:focus-visible, .map-location-tools__search button:focus-visible, .map-location-tools__result:focus-visible { outline: 3px solid rgb(29 53 87 / 34%); outline-offset: 2px; }
.map-location-tools__results { width: min(21rem, 100%); max-height: min(22rem, calc(100dvh - 9rem)); margin-top: .5rem; overflow: auto; border: 1px solid var(--gs-line-strong); border-radius: var(--gs-radius); background: var(--gs-surface); box-shadow: 0 .5rem 1.25rem rgb(23 32 46 / 16%); }
.map-location-tools__results-title { margin: 0; padding: .8rem .9rem .38rem; color: var(--gs-muted); font-size: .78rem; font-weight: 600; }
.map-location-tools__result { display: grid; width: 100%; grid-template-columns: 1.1rem minmax(0, 1fr); column-gap: .55rem; padding: .58rem .78rem; border: 0; background: transparent; color: var(--gs-ink); font: inherit; font-size: .875rem; font-weight: 600; text-align: left; cursor: pointer; }
.map-location-tools__result:hover { background: var(--gs-surface-sunken); color: var(--gs-action); }
.map-location-tools__result small { grid-column: 2; margin-top: .05rem; color: var(--gs-muted); font-size: .78rem; font-weight: 500; }
.map-location-tools__empty { margin: 0; padding: .9rem; color: var(--gs-muted); font-size: .85rem; font-weight: 500; }
.map-location-tools__empty--error { color: var(--gs-danger-hover); line-height: 1.5; }
.map-location-tools--pick { width: calc(100% - 4.5rem); top: .75rem; left: .75rem; }
.map-location-tools--pick .map-location-tools__results { width: 100%; }
.map-location-tools__error { width: fit-content; max-width: min(26rem, 100%); margin: .5rem 0 0; padding: .5rem .65rem; border-radius: .6rem; background: var(--gs-danger-tint); color: var(--gs-danger-hover); font-size: .8rem; font-weight: 600; box-shadow: 0 .4rem .9rem rgb(127 29 29 / 12%); }
.map-search-results-enter-active, .map-search-results-leave-active { transition: opacity 160ms ease, transform 190ms cubic-bezier(.22, 1, .36, 1); }
.map-search-results-enter-from, .map-search-results-leave-to { opacity: 0; transform: translateY(-.35rem) scale(.985); }
@media (prefers-reduced-motion: reduce) { .map-search-results-enter-active, .map-search-results-leave-active { transition: none; } }
@media (max-width: 48rem) { .map-location-tools { top: .75rem; left: .75rem; width: calc(100% - 5rem); } .map-location-tools__bar { align-items: stretch; } .map-location-tools__current-location span { display: none; } .map-location-tools__current-location { width: 2.65rem; justify-content: center; padding: 0; } .map-location-tools__selected-area { max-width: 10rem; } .map-location-tools__search input { font-size: 1rem; } }
</style>
