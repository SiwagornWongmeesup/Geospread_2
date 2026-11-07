<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import VueEasyLightbox from 'vue-easy-lightbox'
import { getIncidentIconUrl } from '~/composables/useIncidentIcon'
import { usePlaceNames } from '~/composables/usePlaceNames'
import { getReportStatusTone } from '~/composables/useHomeDashboard'

definePageMeta({
  showRightPanel: false,
})

const route = useRoute()
const config = useRuntimeConfig()
const { t, locale } = useLocale()
const apiBase = config.public.apiBase || 'http://localhost:5000'

const incident = ref(null)
const report = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')
const isLightboxVisible = ref(false)
const lightboxIndex = ref(0)

const incidentId = computed(() => Number(route.params.incidentId))
const reportId = computed(() => Number(route.params.reportId))

const incidentTitle = computed(() => {
  const title = String(incident.value?.title || '').trim()
  if (!title) return incident.value?.type_name || t('incident.reportedTitle')

  return title.replace(/\s*—\s*รอตรวจสอบ$/, '')
})

const incidentTypeName = computed(() => incident.value?.type_name || t('incident.generic'))

const incidentIconUrl = computed(() => {
  return getIncidentIconUrl({
    typeCode: incident.value?.type_code,
    iconName: incident.value?.icon_name,
  })
})

const { loadPlaceNames, getPlaceLabel } = usePlaceNames()

// ตำแหน่งของรายงานนี้ ในรูปแบบที่ usePlaceNames ใช้ (ต้องมี id, lat, lng)
const reportPlace = computed(() => {
  if (!report.value) {
    return null
  }

  return {
    id: `report-${report.value.report_id}`,
    lat: Number(report.value.lat),
    lng: Number(report.value.lng),
  }
})

// ชื่อสถานที่ของรายงานนี้ พอ Mapbox ส่งชื่อมา ค่านี้จะเปลี่ยนเองอัตโนมัติ
const reportPlaceLabel = computed(() => {
  if (!reportPlace.value) {
    return t('place.reportedArea')
  }
  return getPlaceLabel(reportPlace.value)
})

// โหลดรายงานเสร็จเมื่อไหร่ ให้หาชื่อสถานที่ของรายงานนั้น
watch(reportPlace, (place) => {
  if (!place) {
    return
  }
  if (!Number.isFinite(place.lat) || !Number.isFinite(place.lng)) {
    return
  }
  loadPlaceNames([place])
})

const reporterInitial = computed(() => {
  const name = String(report.value?.reporter_name || '').trim()
  return name ? name.slice(0, 1).toUpperCase() : '?'
})

const mediaList = computed(() => {
  if (!Array.isArray(report.value?.media)) return []

  return report.value.media.filter((media) => media?.media_url)
})

const imageUrls = computed(() => {
  return mediaList.value
    .filter((media) => media.media_type === 'image')
    .map((media) => media.media_url)
})

const formattedCreatedAt = computed(() => {
  const date = new Date(report.value?.created_at)
  if (Number.isNaN(date.getTime())) return t('reportDetail.unknownTime')

  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
})

// เหตุที่หมดอายุแล้วไม่แสดงบนแผนที่ แต่ลิงก์เดิมยังเปิดได้ จึงบอกผู้อ่านว่าเหตุนี้สิ้นสุดแล้ว
const incidentEndedLabel = computed(() => {
  if (!incident.value?.is_expired) return ''

  const date = new Date(incident.value.expires_at)
  if (Number.isNaN(date.getTime())) return t('reportDetail.incidentEnded')

  const time = new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
  return t('reportDetail.incidentEndedAt', { time })
})

const getMediaLabel = (media) => {
  if (media?.media_type === 'video') return t('reportDetail.mediaVideo')
  if (media?.media_type === 'image') return t('reportDetail.mediaImage')
  return t('reportDetail.mediaFile')
}

const openImageLightbox = (media) => {
  const imageIndex = imageUrls.value.indexOf(media.media_url)

  if (imageIndex === -1) return

  lightboxIndex.value = imageIndex
  isLightboxVisible.value = true
}

const closeImageLightbox = () => {
  isLightboxVisible.value = false
}

const handleLightboxIndexChange = (oldIndex, newIndex) => {
  lightboxIndex.value = newIndex
}

const goToLightboxImage = (index) => {
  if (index < 0 || index >= imageUrls.value.length) return
  lightboxIndex.value = index
}

const loadReport = async () => {
  closeImageLightbox()
  incident.value = null
  report.value = null
  errorMessage.value = ''

  if (!Number.isInteger(incidentId.value) || !Number.isInteger(reportId.value)) {
    isLoading.value = false
    errorMessage.value = t('reportDetail.invalidLink')
    return
  }

  isLoading.value = true

  try {
    const [reportResponse, incidentResponse] = await Promise.all([
      $fetch(`${apiBase}/incidents/${incidentId.value}/reports/${reportId.value}`),
      $fetch(`${apiBase}/incidents/${incidentId.value}`),
    ])

    report.value = reportResponse.data
    incident.value = incidentResponse.data?.incident || null
  } catch (error) {
    console.error('ไม่สามารถโหลดรายละเอียดรายงานได้', error)
    errorMessage.value = t('reportDetail.notFound')
  } finally {
    isLoading.value = false
  }
}

const goBackToMap = () => {
  navigateTo('/')
}

onMounted(() => {
  loadReport()
})

watch([incidentId, reportId], () => {
  loadReport()
})
</script>

<template>
  <main class="report-detail-page">
    <section class="report-detail-page__content" aria-labelledby="report-detail-title">
      <button type="button" class="report-detail-page__back" @click="goBackToMap">
        <img src="/icons/Previous-item.svg" alt="" aria-hidden="true">
        {{ t('reportDetail.backToMap') }}
      </button>

      <p v-if="isLoading" class="report-detail-page__state" aria-live="polite">
        {{ t('reportDetail.loading') }}
      </p>

      <section v-else-if="errorMessage" class="report-detail-page__state report-detail-page__state--error" role="alert">
        <h1 id="report-detail-title">{{ t('reportDetail.loadFailed') }}</h1>
        <p>{{ errorMessage }}</p>
        <button type="button" class="report-detail-page__retry" @click="loadReport">{{ t('reportDetail.retry') }}</button>
      </section>

      <article v-else-if="report && incident" class="report-detail">
        <header class="report-detail__hero">
          <div class="report-detail__type-row">
            <div class="report-detail__type-icon" aria-hidden="true">
              <img :src="incidentIconUrl" alt="">
            </div>
            <h1 id="report-detail-title">{{ incidentTitle }}</h1>
            <span>{{ t(`status.${getReportStatusTone(report?.report_status)}`) }}</span>
          </div>

          <p v-if="incidentEndedLabel" class="report-detail__ended" role="status">
            {{ incidentEndedLabel }}
          </p>


          <div class="report-detail__byline">
            <div class="report-detail__avatar" aria-hidden="true">
              <img v-if="report.reporter_profile" :src="report.reporter_profile" alt="">
              <span v-else>{{ reporterInitial }}</span>
            </div>

            <strong>{{ report.reporter_name || t('reportDetail.anonymousReporter') }}</strong>
            <span class="report-detail__separator" aria-hidden="true">•</span>
            <time :datetime="report.created_at">{{ t('reportDetail.reportedAt', { time: formattedCreatedAt }) }}</time>
            <span class="report-detail__separator" aria-hidden="true">•</span>
            <span class="report-detail__location">
              <img src="/icons/Location.svg" alt="" aria-hidden="true">
              {{ reportPlaceLabel }}
            </span>
          </div>
        </header>

        <section class="report-detail__body" aria-labelledby="report-description-title">
          <h2 id="report-description-title">{{ t('reportDetail.descriptionTitle') }}</h2>
          <p class="report-detail__description">
            {{ report.description || t('reportDetail.noDescription') }}
          </p>
        </section>

        <section class="report-detail__media-section" aria-labelledby="report-media-title">
          <div class="report-detail__media-heading">
            <h2 id="report-media-title">{{ t('reportDetail.mediaTitle') }}</h2>
            <span v-if="mediaList.length">{{ t('reportDetail.fileCount', { count: mediaList.length }) }}</span>
          </div>

          <p v-if="!mediaList.length" class="report-detail__empty">
            {{ t('reportDetail.noMedia') }}
          </p>

          <div v-else class="report-detail__media-grid">
            <figure
              v-for="(media, index) in mediaList.slice(0, 3)"
              :key="media.media_id"
              class="report-detail__media"
            >
              <button
                v-if="media.media_type === 'image'"
                type="button"
                class="report-detail__media-button"
                :aria-label="t('reportDetail.openFullscreen', { media: getMediaLabel(media) })"
                @click="openImageLightbox(media)"
              >
                <img
                  :src="media.media_url"
                  :alt="getMediaLabel(media)"
                >
                <span v-if="index === 2 && mediaList.length > 3" class="report-detail__more-media">
                  + {{ mediaList.length - 3 }}
                </span>
              </button>
              <video
                v-else-if="media.media_type === 'video'"
                :src="media.media_url"
                controls
                preload="metadata"
              >
                {{ t('reportDetail.videoUnsupported') }}
              </video>
              <a v-else :href="media.media_url" target="_blank" rel="noopener noreferrer">
                {{ t('reportDetail.openMedia', { media: getMediaLabel(media) }) }}
              </a>
              <span v-if="media.media_type !== 'image' && index === 2 && mediaList.length > 3" class="report-detail__more-media">
                + {{ mediaList.length - 3 }}
              </span>
            </figure>
          </div>
        </section>
      </article>
    </section>

    <VueEasyLightbox
      :visible="isLightboxVisible"
      :imgs="imageUrls"
      :index="lightboxIndex"
      @hide="closeImageLightbox"
      @on-index-change="handleLightboxIndexChange"
    >
      <template #toolbar>
        <div
          v-if="imageUrls.length > 1"
          class="lightbox-dots"
          role="tablist"
          :aria-label="t('reportDetail.chooseImage')"
        >
          <button
            v-for="(image, index) in imageUrls"
            :key="image"
            type="button"
            class="dot"
            :class="{ active: index === lightboxIndex }"
            role="tab"
            :aria-selected="index === lightboxIndex"
            :aria-label="t('reportDetail.imageOf', { index: index + 1, total: imageUrls.length })"
            @click="goToLightboxImage(index)"
          ></button>
        </div>
      </template>
    </VueEasyLightbox>
  </main>
</template>

<style scoped>
.report-detail-page {
  min-height: 100%;
  padding: 30px;
  background: #f5f9fe;
}

.report-detail-page__content {
  width: min(1040px, 100%);
  margin: 0 auto;
}

.report-detail-page__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border: 0;
  background: transparent;
  color: #176bd0;
  cursor: pointer;
  font: inherit;
  font-size: 15px;
  font-weight: 800;
}

.report-detail-page__back img {
  width: 20px;
  height: 20px;
}

.report-detail-page__back:hover {
  color: #0b55ae;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.report-detail-page__back:focus-visible,
.report-detail-page__retry:focus-visible {
  outline: 3px solid rgb(37 99 235 / 35%);
  outline-offset: 3px;
}

.report-detail-page__state {
  margin: 24px 0 0;
  padding: 32px;
  border-radius: 14px;
  background: #ffffff;
  color: #52749f;
  font-size: 15px;
  font-weight: 700;
  text-align: center;
}

.report-detail-page__state--error h1 {
  margin: 0;
  color: #163e78;
  font-size: 22px;
}

.report-detail-page__state--error p {
  margin: 8px 0 0;
}

.report-detail-page__retry {
  margin-top: 18px;
  padding: 10px 16px;
  border: 0;
  border-radius: 10px;
  background: #1672dc;
  color: #ffffff;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 800;
}

.report-detail {
  margin-top: 16px;
  overflow: hidden;
  border: 1px solid #dce8f5;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 16px 32px rgb(25 69 125 / 10%);
}

.report-detail__hero {
  padding: 34px 34px 28px;
}

.report-detail__type-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  min-width: 0;
}

.report-detail__type-icon {
  display: grid;
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: #e7f1ff;
}

.report-detail__type-icon img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.report-detail__type-row p {
  margin: 0;
  color: #1a5ea8;
  font-size: 19px;
  font-weight: 850;
}

.report-detail__ended {
  margin: 14px 0 0;
  padding: 10px 14px;
  border: 1px solid #d5dfeb;
  border-radius: 12px;
  background: #f2f5f9;
  color: #4a5f7c;
  font-size: 14px;
  font-weight: 750;
  line-height: 1.45;
}

.report-detail__type-row span {
  flex: 0 0 auto;
  padding: 7px 11px;
  border-radius: 999px;
  background: #fff0d5;
  color: #9a6108;
  font-size: 12px;
  font-weight: 850;
  white-space: nowrap;
}

.report-detail__type-row h1 {
  /* ภาษาไทยมีวรรณยุกต์ซ้อนด้านบน (เช่น ไม้โทใน "น้ำ") ต้องให้บรรทัดสูงพอ และห้ามตัดส่วนที่ล้นทิ้ง
     ไม่อย่างนั้นวรรณยุกต์จะหายไป ("น้ำท่วม" กลายเป็น "นำท่วม") ชื่อยาวให้ขึ้นบรรทัดใหม่แทนการตัด */
  min-width: 0;
  margin: 0;
  color: #102e61;
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.report-detail__byline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
  margin-top: 22px;
  color: #5e799f;
  font-size: 15px;
  font-weight: 650;
  line-height: 1.4;
}

.report-detail__avatar {
  display: grid;
  width: 42px;
  height: 42px;
  overflow: hidden;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: #dcecff;
  color: #1b5cad;
  font-size: 16px;
  font-weight: 850;
}

.report-detail__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.report-detail__byline strong {
  color: #183e78;
  font-weight: 850;
}

.report-detail__separator {
  color: #a1b2c7;
}

.report-detail__location {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.report-detail__location img {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.report-detail__body,
.report-detail__media-section {
  padding: 28px 34px;
  border-top: 1px solid #dfebf7;
}

.report-detail__body h2,
.report-detail__media-heading h2 {
  margin: 0;
  color: #163e78;
  font-size: 23px;
  font-weight: 850;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.report-detail__description {
  max-width: 800px;
  margin: 14px 0 0;
  color: #375a85;
  font-size: 17px;
  font-weight: 550;
  line-height: 1.75;
  white-space: pre-wrap;
}

.report-detail__media-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.report-detail__media-heading span {
  color: #6280a8;
  font-size: 14px;
  font-weight: 750;
}

.report-detail__empty {
  margin: 14px 0 0;
  color: #6681a5;
  font-size: 15px;
}

.report-detail__media-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  grid-auto-rows: 172px;
  gap: 10px;
  margin-top: 18px;
}

.report-detail__media {
  position: relative;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  border-radius: 12px;
  background: #eaf2fb;
}

.report-detail__media:first-child:nth-last-child(1) {
  grid-column: 1 / -1;
}

.report-detail__media:first-child:nth-last-child(n + 3) {
  grid-row: span 2;
}

.report-detail__media-button {
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: zoom-in;
}

.report-detail__media-button:focus-visible {
  outline: 3px solid #176bd0;
  outline-offset: -3px;
}

.report-detail__media-button img,
.report-detail__media video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.report-detail__media a {
  display: block;
  padding: 18px;
  color: #176bd0;
  font-size: 14px;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.report-detail__more-media {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(7 28 58 / 55%);
  color: #ffffff;
  font-size: 28px;
  font-weight: 700;
}

.report-detail__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding: 16px 34px;
  color: #6b84a3;
  border-top: 1px solid #dfebf7;
  font-size: 12px;
  font-weight: 700;
}

.lightbox-dots {
  position: absolute;
  bottom: 24px;
  left: 50%;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  transform: translateX(-50%);
}

.dot {
  width: 10px;
  height: 10px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background-color: #e6e6e6;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.dot.active {
  background-color: #ffab00;
}

.dot:focus-visible {
  outline: 2px solid #ffab00;
  outline-offset: 3px;
}

@media (max-width: 700px) {
  .report-detail-page {
    padding: 16px;
  }

  .report-detail__hero,
  .report-detail__body,
  .report-detail__media-section {
    padding: 22px 20px;
  }

  .report-detail__type-row {
    gap: 10px 12px;
  }

  .report-detail__type-icon {
    width: 44px;
    height: 44px;
  }

  .report-detail__type-icon img {
    width: 26px;
    height: 26px;
  }

  .report-detail__type-row h1 {
    font-size: 26px;
  }

  /* ผู้แจ้ง: รูป | ชื่อ + เวลา (ซ้อนกัน) / สถานที่อยู่บรรทัดล่าง ตรงกับแนวชื่อ */
  .report-detail__byline {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr);
    column-gap: 10px;
    row-gap: 2px;
    font-size: 14px;
  }

  .report-detail__avatar {
    grid-row: span 2;
  }

  .report-detail__separator {
    display: none;
  }

  .report-detail__location {
    grid-column: 2;
    align-items: flex-start;
    margin-top: 6px;
  }

  .report-detail__location img {
    margin-top: 1px;
  }

  .report-detail__body h2,
  .report-detail__media-heading h2 {
    font-size: 19px;
  }

  .report-detail__description {
    font-size: 16px;
  }

  .report-detail__media-grid {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
    grid-auto-rows: 118px;
  }

  .report-detail__media:first-child:nth-last-child(1) {
    grid-row: span 2;
  }

  .report-detail__footer {
    padding: 16px 20px;
  }
}
</style>
