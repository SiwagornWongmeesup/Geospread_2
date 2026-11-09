<script setup>
// หน้ารายละเอียดคำขอความช่วยเหลือ (/help-requests/:id)
// - ทุกคนเห็น: ประเภท, จำนวนคน, รายละเอียด, รูป (กดดูเต็มจอด้วย VueEasyLightbox), จำนวนผู้เสนอช่วย
// - ผู้ช่วย: เสนอช่วย → รอผู้ขอตอบ → ได้รับเลือกแล้วเห็นช่องทางติดต่อที่ผู้ขอแชร์ + พิกัดจริง / ถอนตัวได้
// - เจ้าของคำขอ: เลือกผู้ช่วย, ปิดคำขอ, เปลี่ยนผู้ช่วย, ยกเลิก (อยู่ใน HelpOwnerPanel)
// - คนอื่นเห็นแค่ตำแหน่งคร่าวๆ (~500 ม.) backend เป็นคนปัดพิกัดมาให้
// ข้อมูลมาจาก GET /help-requests/:id (backend เลือกข้อมูลให้ตามสิทธิ์ของคนที่เปิดดู)
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import VueEasyLightbox from 'vue-easy-lightbox'
import LoginRequiredNotice from '~/components/common/LoginRequiredNotice.vue'
import HelpContactCard from '~/components/request-help/HelpContactCard.vue'
import EmergencyCallStrip from '~/components/common/EmergencyCallStrip.vue'
import HelpOwnerPanel from '~/components/request-help/HelpOwnerPanel.vue'
import HelpReportDialog from '~/components/request-help/HelpReportDialog.vue'
import { getApiErrorMessage } from '~/utils/apiError'
import { getHelpRequestIcon, getHelpRequestLabel } from '~/composables/useHelpRequestIcon'
import { usePlaceNames } from '~/composables/usePlaceNames'
import { formatRelativeTime } from '~/composables/useHomeDashboard'

definePageMeta({
  showRightPanel: false,
})

const route = useRoute()
const config = useRuntimeConfig()
const { t, locale } = useLocale()
const { getToken } = useAuth()
const apiBase = config.public.apiBase || 'http://localhost:5000'

const helpRequestId = computed(() => Number(route.params.helpRequestId))

const request = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')

useHead(() => {
  if (request.value) {
    return { title: `${requestTitle.value} | GeoSpread` }
  }
  return { title: `${t('helpDetail.pageTitle')} | GeoSpread` }
})

// ---- โหลดข้อมูล ----

// ส่ง token ไปด้วยถ้าล็อกอินอยู่ backend จะได้ส่งข้อมูลตามสิทธิ์ (รายการข้อเสนอ, เบอร์ติดต่อ)
const authHeaders = () => {
  const token = getToken()
  if (!token) {
    return {}
  }
  return { Authorization: `Bearer ${token}` }
}

const loadRequest = async () => {
  closeImageLightbox()
  errorMessage.value = ''

  if (!Number.isInteger(helpRequestId.value) || helpRequestId.value < 1) {
    isLoading.value = false
    errorMessage.value = t('helpDetail.invalidLink')
    return
  }

  isLoading.value = true
  try {
    const response = await $fetch(`${apiBase}/help-requests/${helpRequestId.value}`, { headers: authHeaders() })
    request.value = response.data
  } catch (error) {
    console.error('โหลดรายละเอียดคำขอความช่วยเหลือไม่สำเร็จ', error)
    request.value = null
    if (error?.statusCode === 404) {
      errorMessage.value = t('helpDetail.notFound')
    } else {
      errorMessage.value = t('helpDetail.loadFailedText')
    }
  } finally {
    isLoading.value = false
  }
}

// ---- ข้อความส่วนหัว ----

const requestTitle = computed(() => {
  if (!request.value) {
    return ''
  }
  if (request.value.help_type === 'other' && request.value.custom_help_type) {
    return request.value.custom_help_type
  }
  return getHelpRequestLabel(request.value.help_type, t)
})

const requestIcon = computed(() => getHelpRequestIcon(request.value?.help_type))

// สถานะของคำขอ: หมดอายุแล้วถือว่าปิด แม้สถานะในฐานข้อมูลยังเป็น pending
const statusKey = computed(() => {
  if (!request.value) {
    return 'pending'
  }
  if (request.value.request_status === 'pending' && request.value.is_expired) {
    return 'expired'
  }
  return request.value.request_status
})

const formatDateTime = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  let dateLocale = 'th-TH'
  if (locale.value === 'en') {
    dateLocale = 'en-GB'
  }
  return new Intl.DateTimeFormat(dateLocale, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const requesterName = computed(() => {
  if (request.value?.requester_name) {
    return request.value.requester_name
  }
  return t('helpDetail.anonymousRequester')
})

// ตัวอักษรในวงกลมแทนรูป: ไม่มีชื่อใช้ "?"
// ชื่อไทยที่ขึ้นต้นด้วยสระหน้า (เ แ โ ใ ไ) ใช้พยัญชนะตัวถัดไปแทน เช่น "ใจดี" → "จ"
const requesterInitial = computed(() => {
  const name = String(request.value?.requester_name || '').trim()
  if (!name) {
    return '?'
  }
  const withoutLeadingVowel = name.replace(/^[เแโใไ]+/, '')
  let firstLetter = withoutLeadingVowel.charAt(0)
  if (!firstLetter) {
    firstLetter = name.charAt(0)
  }
  return firstLetter.toUpperCase()
})

// ชื่อสถานที่ของคำขอ พอ Mapbox ส่งชื่อมา ค่านี้จะเปลี่ยนเอง
const { loadPlaceNames, getPlaceLabel } = usePlaceNames()
const requestPlace = computed(() => {
  if (!request.value) {
    return null
  }
  return { id: `help-${request.value.help_request_id}`, lat: Number(request.value.lat), lng: Number(request.value.lng) }
})
const placeLabel = computed(() => {
  if (!requestPlace.value) {
    return t('place.helpArea')
  }
  return getPlaceLabel(requestPlace.value)
})
watch(requestPlace, (place) => {
  if (place && Number.isFinite(place.lat) && Number.isFinite(place.lng)) {
    loadPlaceNames([place])
  }
})

// ---- รูป + lightbox (แบบเดียวกับหน้ารายละเอียดรายงาน) ----

const imageUrls = computed(() => {
  const urls = []
  for (const media of request.value?.media ?? []) {
    if (media.media_type === 'image' && media.media_url) {
      urls.push(media.media_url)
    }
  }
  return urls
})

const isLightboxVisible = ref(false)
const lightboxIndex = ref(0)

const openImageLightbox = (index) => {
  lightboxIndex.value = index
  isLightboxVisible.value = true
}
const closeImageLightbox = () => {
  isLightboxVisible.value = false
}
const handleLightboxIndexChange = (oldIndex, newIndex) => {
  lightboxIndex.value = newIndex
}
const goToLightboxImage = (index) => {
  if (index >= 0 && index < imageUrls.value.length) {
    lightboxIndex.value = index
  }
}

// ---- เสนอช่วยเหลือ (ผู้ช่วย) ----

const emptyViewer = { is_logged_in: false, is_owner: false, is_accepted_helper: false, my_offer: null, can_offer: false, can_report_requester: false }
const viewer = computed(() => request.value?.viewer ?? emptyViewer)
const offerMessage = ref('')
const isSendingOffer = ref(false)
const offerError = ref('')
const offerBox = ref(null)
const offerInput = ref(null)

const sendOffer = async () => {
  isSendingOffer.value = true
  offerError.value = ''
  try {
    await $fetch(`${apiBase}/help-requests/${helpRequestId.value}/offers`, {
      method: 'POST',
      headers: authHeaders(),
      body: { message: offerMessage.value.trim() },
    })
    offerMessage.value = ''
    await loadRequest()
  } catch (error) {
    offerError.value = getApiErrorMessage(error, t('helpDetail.offerFailed'))
  } finally {
    isSendingOffer.value = false
  }
}

// ผู้ช่วยยังไม่มีเบอร์และ LINE ในโปรไฟล์: ผู้ขอจะติดต่อกลับไม่ได้ ต้องเตือนให้เพิ่ม
const helperHasNoContact = computed(() => {
  const myContact = viewer.value.my_contact
  if (!myContact || viewer.value.is_owner) {
    return false
  }
  return !myContact.has_phone && !myContact.has_line
})

// ---- ถอนข้อเสนอ (ผู้ช่วย) ต้องกดยืนยันอีกครั้ง ----

const isConfirmingWithdraw = ref(false)
const isWithdrawing = ref(false)
const withdrawError = ref('')

const withdrawOffer = async () => {
  isWithdrawing.value = true
  withdrawError.value = ''
  try {
    const response = await $fetch(`${apiBase}/help-requests/${helpRequestId.value}/offers/${viewer.value.my_offer.offer_id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: { action: 'withdraw' },
    })
    request.value = response.data
    isConfirmingWithdraw.value = false
  } catch (error) {
    withdrawError.value = getApiErrorMessage(error, t('helpDetail.withdrawFailed'))
  } finally {
    isWithdrawing.value = false
  }
}

// ข้อความสถานะข้อเสนอของฉัน เมื่อไม่ได้รอและไม่ได้รับเลือกแล้ว (ถูกปฏิเสธ / ถอนตัว / ถูกเปลี่ยนผู้ช่วย)
const myOfferClosedText = computed(() => {
  const status = viewer.value.my_offer?.offer_status
  if (status === 'withdrawn') {
    return t('helpDetail.yourOfferWithdrawn')
  }
  if (status === 'released') {
    return t('helpDetail.yourOfferReleased')
  }
  if (status === 'accepted') {
    return t('helpDetail.yourOfferClosed')
  }
  return t('helpDetail.yourOfferDeclined')
})

// ---- รายงานผู้ใช้ ----

// { offerId, name } ของคนที่กำลังรายงาน / null = หน้าต่างปิดอยู่
const reportTarget = ref(null)

// เจ้าของรายงานผู้ช่วย (ส่ง offer มาจาก HelpOwnerPanel)
const openReportHelper = (offer) => {
  let name = t('helpDetail.anonymousHelper')
  if (offer.helper_name) {
    name = offer.helper_name
  }
  reportTarget.value = { offerId: offer.offer_id, name }
}

// ผู้ช่วยรายงานผู้ขอ
const openReportRequester = () => {
  reportTarget.value = { offerId: null, name: requesterName.value }
}

// ข้อมูลใหม่จาก HelpOwnerPanel หลังรับข้อเสนอ / เปลี่ยนสถานะ
const handleOwnerUpdate = (updatedRequest) => {
  request.value = updatedRequest
}

// ลิงก์เส้นทางไปจุดที่ขอความช่วยเหลือ (สำหรับผู้ช่วยที่ได้รับอนุมัติ)
const directionsUrl = computed(() => {
  if (!request.value) {
    return ''
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${request.value.lat},${request.value.lng}`
})

// หน้าที่กลับมาหลังเข้าสู่ระบบ (เปิดกล่องเสนอช่วยให้เลย)
const loginRedirect = computed(() => `/help-requests/${helpRequestId.value}?offer=1`)

// เปิดจากปุ่ม "เสนอช่วยเหลือ" บนแผนที่ (?offer=1): เลื่อนไปที่กล่องเสนอช่วย และโฟกัสช่องข้อความ
const focusOfferBoxIfAsked = async () => {
  if (route.query.offer !== '1') {
    return
  }
  await nextTick()
  if (offerBox.value) {
    offerBox.value.scrollIntoView({ block: 'center' })
  }
  if (offerInput.value) {
    offerInput.value.focus({ preventScroll: true })
  }
}

const goBack = () => {
  const previousPath = window.history.state?.back
  if (previousPath) {
    navigateTo(previousPath)
    return
  }
  navigateTo('/help-requests')
}

onMounted(async () => {
  await loadRequest()
  await focusOfferBoxIfAsked()
})

watch(helpRequestId, loadRequest)
</script>

<template>
  <main class="help-detail-page">
    <div class="help-detail-page__content">
      <button type="button" class="help-detail-page__back" @click="goBack">
        <img src="/icons/Previous-item.svg" alt="" aria-hidden="true">
        {{ t('helpDetail.back') }}
      </button>

      <p v-if="isLoading && !request" class="help-detail-page__state" aria-live="polite">{{ t('helpDetail.loading') }}</p>

      <section v-else-if="errorMessage" class="help-detail-page__state help-detail-page__state--error" role="alert">
        <h1>{{ t('helpDetail.loadFailed') }}</h1>
        <p>{{ errorMessage }}</p>
        <button type="button" class="help-detail-page__retry" @click="loadRequest">{{ t('helpDetail.retry') }}</button>
      </section>

      <div v-else-if="request" class="help-detail">
        <!-- ===== หัว: ประเภท สถานะ จำนวนคน ผู้ขอ เวลา สถานที่ ===== -->
        <header class="help-detail__hero help-detail__card">
          <div class="help-detail__title-row">
            <span class="help-detail__icon" aria-hidden="true"><img :src="requestIcon" alt=""></span>
            <div>
              <span class="help-detail__status" :class="`help-detail__status--${statusKey}`">{{ t(`helpDetail.status.${statusKey}`) }}</span>
              <h1>{{ requestTitle }}</h1>
            </div>
          </div>

          <p class="help-detail__people">{{ t('help.peopleNeedHelp', { count: request.people_count }) }}</p>

          <div class="help-detail__byline">
            <span class="help-detail__avatar" aria-hidden="true">{{ requesterInitial }}</span>
            <strong>{{ requesterName }}</strong>
            <span class="help-detail__dot" aria-hidden="true">•</span>
            <time :datetime="request.created_at" :title="formatDateTime(request.created_at)">
              {{ t('helpDetail.requestedAt', { time: formatRelativeTime(request.created_at, t) }) }}
            </time>
            <span class="help-detail__dot" aria-hidden="true">•</span>
            <span class="help-detail__place">
              <img src="/icons/Location.svg" alt="" aria-hidden="true">
              {{ placeLabel }}
            </span>
            <span v-if="request.location_is_approximate" class="help-detail__approx" :title="t('helpDetail.approxLocationHint')">
              {{ t('helpDetail.approxLocation') }}
            </span>
          </div>
        </header>

        <!-- ===== กล่องเสนอช่วย / ข้อเสนอ (จอคอมอยู่คอลัมน์ขวา มือถืออยู่ต่อจากหัว) ===== -->
        <aside ref="offerBox" class="help-detail__panel help-detail__card" :aria-label="t('helpDetail.panelLabel')">
          <h2>{{ t('helpDetail.offersTitle') }}</h2>
          <p class="help-detail__offer-count">
            <template v-if="request.offer_count > 0">{{ t('help.offersCount', { count: request.offer_count }) }}</template>
            <template v-else>{{ t('help.noOffersYet') }}</template>
          </p>

          <!-- เจ้าของคำขอ: เลือกผู้ช่วย / ติดต่อผู้ช่วย / ปิดหรือยกเลิกคำขอ -->
          <HelpOwnerPanel
            v-if="viewer.is_owner"
            :request="request"
            :status-key="statusKey"
            @updated="handleOwnerUpdate"
            @report="openReportHelper"
          />

          <!-- ยังไม่เข้าสู่ระบบ -->
          <template v-else-if="!viewer.is_logged_in">
            <p class="help-detail__hint">{{ t('help.exactLocationHidden') }}</p>
            <LoginRequiredNotice :message="t('helpDetail.loginToOffer')" :redirect="loginRedirect" />
          </template>

          <!-- ผู้ช่วยที่ได้รับเลือก: ช่องทางติดต่อที่ผู้ขอแชร์ + เส้นทาง + ถอนตัว -->
          <template v-else-if="viewer.is_accepted_helper">
            <p class="help-detail__notice help-detail__notice--good" role="status">{{ t('helpDetail.yourOfferAccepted') }}</p>
            <HelpContactCard
              :title="t('helpDetail.requesterContactTitle')"
              :name="requesterName"
              :phone="request.contact?.phone"
              :line-id="request.contact?.line_id"
              :empty-text="t('helpDetail.requesterNoContact')"
            />
            <a :href="directionsUrl" target="_blank" rel="noopener noreferrer" class="help-detail__button help-detail__button--wide">
              {{ t('helpDetail.directions') }}
            </a>

            <div v-if="isConfirmingWithdraw" class="help-detail__confirm">
              <p>{{ t('helpDetail.confirmWithdrawAccepted') }}</p>
              <div class="help-detail__row">
                <button type="button" class="help-detail__button help-detail__button--danger" :disabled="isWithdrawing" @click="withdrawOffer">
                  {{ t('helpDetail.confirmWithdrawButton') }}
                </button>
                <button type="button" class="help-detail__button" :disabled="isWithdrawing" @click="isConfirmingWithdraw = false">{{ t('helpDetail.cancel') }}</button>
              </div>
            </div>
            <button v-else type="button" class="help-detail__button help-detail__button--wide" @click="isConfirmingWithdraw = true">
              {{ t('helpDetail.cannotGo') }}
            </button>
            <p v-if="withdrawError" class="help-detail__error" role="alert">{{ withdrawError }}</p>
          </template>

          <!-- เคยเสนอแล้ว: บอกสถานะ (รออยู่ถอนได้) -->
          <template v-else-if="viewer.my_offer">
            <template v-if="viewer.my_offer.offer_status === 'pending'">
              <p class="help-detail__notice" role="status">{{ t('helpDetail.yourOfferPending') }}</p>
              <p v-if="viewer.my_offer.message" class="help-detail__quote">“{{ viewer.my_offer.message }}”</p>
              <p v-if="helperHasNoContact" class="help-detail__notice help-detail__notice--warn">
                {{ t('helpDetail.selfNoContact') }}
                <NuxtLink to="/profile">{{ t('helpDetail.addContact') }}</NuxtLink>
              </p>
              <div v-if="isConfirmingWithdraw" class="help-detail__confirm">
                <p>{{ t('helpDetail.confirmWithdraw') }}</p>
                <div class="help-detail__row">
                  <button type="button" class="help-detail__button help-detail__button--danger" :disabled="isWithdrawing" @click="withdrawOffer">
                    {{ t('helpDetail.confirmWithdrawButton') }}
                  </button>
                  <button type="button" class="help-detail__button" :disabled="isWithdrawing" @click="isConfirmingWithdraw = false">{{ t('helpDetail.cancel') }}</button>
                </div>
              </div>
              <button v-else type="button" class="help-detail__link" @click="isConfirmingWithdraw = true">{{ t('helpDetail.withdrawOffer') }}</button>
              <p v-if="withdrawError" class="help-detail__error" role="alert">{{ withdrawError }}</p>
            </template>
            <p v-else class="help-detail__notice help-detail__notice--muted" role="status">{{ myOfferClosedText }}</p>
          </template>

          <!-- เสนอช่วยได้ -->
          <form v-else-if="viewer.can_offer" class="help-detail__offer-form" @submit.prevent="sendOffer">
            <label>
              <span>{{ t('helpDetail.offerMessageLabel') }} <small>{{ t('report.optional') }}</small></span>
              <textarea
                ref="offerInput"
                v-model="offerMessage"
                maxlength="500"
                rows="3"
                :placeholder="t('helpDetail.offerMessagePlaceholder')"
              ></textarea>
            </label>
            <p v-if="helperHasNoContact" class="help-detail__notice help-detail__notice--warn">
              {{ t('helpDetail.selfNoContact') }}
              <NuxtLink to="/profile">{{ t('helpDetail.addContact') }}</NuxtLink>
            </p>
            <p v-else class="help-detail__hint">{{ t('helpDetail.offerContactNote') }}</p>
            <p class="help-detail__hint help-detail__hint--strong">{{ t('helpDetail.noChargeRule') }}</p>
            <button type="submit" class="help-detail__button help-detail__button--primary help-detail__button--wide" :disabled="isSendingOffer">
              {{ isSendingOffer ? t('helpDetail.sendingOffer') : t('help.offerHelp') }}
            </button>
            <p v-if="offerError" class="help-detail__error" role="alert">{{ offerError }}</p>
          </form>

          <!-- มีผู้ช่วยแล้ว / คำขอปิดแล้ว -->
          <p v-else-if="statusKey === 'accepted'" class="help-detail__notice help-detail__notice--muted">{{ t('help.alreadyHasHelper') }}</p>
          <p v-else class="help-detail__notice help-detail__notice--muted">{{ t('helpDetail.closedForOffers') }}</p>

          <!-- ผู้ที่เคยเสนอช่วย รายงานผู้ขอได้ -->
          <button v-if="viewer.can_report_requester" type="button" class="help-detail__link help-detail__link--small" @click="openReportRequester">
            {{ t('helpDetail.reportUser', { name: requesterName }) }}
          </button>

          <!-- สายด่วน: กดโทรได้ทุกสถานะ ไม่ต้องรอคนเสนอช่วย -->
          <EmergencyCallStrip class="help-detail__hotlines" />
        </aside>

        <!-- ===== รายละเอียด ===== -->
        <section class="help-detail__body help-detail__card" aria-labelledby="help-description-title">
          <h2 id="help-description-title">{{ t('helpDetail.descriptionTitle') }}</h2>
          <p class="help-detail__description">{{ request.description }}</p>
        </section>

        <!-- ===== รูป (กดแล้วเปิดเต็มจอ) ===== -->
        <section class="help-detail__media help-detail__card" aria-labelledby="help-media-title">
          <div class="help-detail__media-heading">
            <h2 id="help-media-title">{{ t('helpDetail.photosTitle') }}</h2>
            <span v-if="imageUrls.length">{{ t('helpDetail.photoCount', { count: imageUrls.length }) }}</span>
          </div>
          <p v-if="!imageUrls.length" class="help-detail__empty">{{ t('helpDetail.noPhotos') }}</p>
          <div v-else class="help-detail__photos" :class="`help-detail__photos--${Math.min(imageUrls.length, 3)}`">
            <button
              v-for="(url, index) in imageUrls.slice(0, 3)"
              :key="url"
              type="button"
              class="help-detail__photo"
              :aria-label="t('reportDetail.imageOf', { index: index + 1, total: imageUrls.length })"
              @click="openImageLightbox(index)"
            >
              <img :src="url" :alt="t('helpDetail.photoAlt', { index: index + 1 })">
              <span v-if="index === 2 && imageUrls.length > 3" class="help-detail__more">+ {{ imageUrls.length - 3 }}</span>
            </button>
          </div>
        </section>
      </div>
    </div>

    <HelpReportDialog
      v-if="request"
      :open="reportTarget !== null"
      :help-request-id="helpRequestId"
      :target-name="reportTarget?.name ?? ''"
      :offer-id="reportTarget?.offerId ?? null"
      @close="reportTarget = null"
      @reported="loadRequest"
    />

    <VueEasyLightbox
      :visible="isLightboxVisible"
      :imgs="imageUrls"
      :index="lightboxIndex"
      @hide="closeImageLightbox"
      @on-index-change="handleLightboxIndexChange"
    >
      <template #toolbar>
        <div v-if="imageUrls.length > 1" class="lightbox-dots" role="tablist" :aria-label="t('reportDetail.chooseImage')">
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
.help-detail-page {
  min-height: 100%;
  padding: 24px;
  background: var(--gs-paper);
}

.help-detail-page__content {
  width: min(1180px, 100%);
  margin: 0 auto;
}

.help-detail-page__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 4px;
  border: 0;
  background: transparent;
  color: var(--gs-action);
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.help-detail-page__back img {
  width: 20px;
  height: 20px;
}

.help-detail-page__back:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.help-detail-page__state {
  margin: 16px 0 0;
  padding: 32px;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
  color: var(--gs-muted);
  text-align: center;
}

.help-detail-page__state--error h1 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 22px;
}

.help-detail-page__state--error p {
  margin: 8px 0 0;
}

.help-detail-page__retry {
  margin-top: 16px;
  min-height: 40px;
  padding: 0 16px;
  border: 0;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-action);
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

/* ===== โครงหน้า: จอคอม 2 คอลัมน์ (เนื้อหา | กล่องเสนอช่วย) มือถือเรียงลงมา ===== */
.help-detail {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  grid-template-areas:
    'hero panel'
    'body panel'
    'media panel';
  align-items: start;
  gap: 16px 20px;
  margin-top: 12px;
}

.help-detail__hero { grid-area: hero; }
.help-detail__body { grid-area: body; }
.help-detail__media { grid-area: media; }

.help-detail__panel {
  position: sticky;
  top: 16px;
  grid-area: panel;
}

.help-detail__card {
  padding: 24px 28px;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
}

.help-detail__card h2 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
}

/* ---- หัว ---- */
.help-detail__title-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.help-detail__icon {
  display: grid;
  flex: 0 0 auto;
  width: 56px;
  height: 56px;
  place-items: center;
  border-radius: 50%;
  background: var(--gs-help-tint);
}

.help-detail__icon img {
  width: 32px;
  height: 32px;
}

.help-detail__title-row h1 {
  /* ภาษาไทยมีวรรณยุกต์ซ้อนด้านบน ต้องให้บรรทัดสูงพอ ชื่อยาวให้ขึ้นบรรทัดใหม่ */
  margin: 6px 0 0;
  color: var(--gs-ink);
  font-size: clamp(26px, 3.2vw, 36px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.help-detail__status {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.help-detail__status--pending { background: var(--gs-pending-tint); color: var(--gs-pending); }
.help-detail__status--accepted,
.help-detail__status--in_progress { background: var(--gs-help-tint); color: var(--gs-help); }
.help-detail__status--resolved { background: #e3f1e8; color: var(--gs-verified); }
.help-detail__status--cancelled,
.help-detail__status--expired { background: var(--gs-surface-sunken); color: var(--gs-muted); }

.help-detail__people {
  margin: 16px 0 0;
  color: var(--gs-help);
  font-size: 17px;
  font-weight: 700;
}

.help-detail__byline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  color: var(--gs-muted);
  font-size: 14px;
}

.help-detail__avatar {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 50%;
  background: var(--gs-action-tint);
  color: var(--gs-action);
  font-weight: 700;
}

.help-detail__byline strong {
  color: var(--gs-ink);
}

.help-detail__dot {
  color: var(--gs-line-strong);
}

.help-detail__place {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.help-detail__place img {
  width: 16px;
  height: 16px;
}

/* ---- รายละเอียด ---- */
.help-detail__description {
  max-width: 70ch;
  margin: 12px 0 0;
  color: var(--gs-ink-2);
  font-size: 16px;
  line-height: 1.75;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* ---- รูป ---- */
.help-detail__media-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.help-detail__media-heading span {
  color: var(--gs-muted);
  font-size: 14px;
}

.help-detail__photos {
  display: grid;
  grid-auto-rows: 180px;
  gap: 8px;
  margin-top: 14px;
}

.help-detail__photos--1 { grid-template-columns: minmax(0, 1fr); grid-auto-rows: 320px; }
.help-detail__photos--2 { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 240px; }
.help-detail__photos--3 { grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); }
.help-detail__photos--3 .help-detail__photo:first-child { grid-row: span 2; }

.help-detail__photo {
  position: relative;
  overflow: hidden;
  padding: 0;
  border: 0;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface-sunken);
  cursor: zoom-in;
}

.help-detail__photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.help-detail__photo:hover img {
  transform: scale(1.03);
}

.help-detail__photo:focus-visible {
  outline: 3px solid var(--gs-action);
  outline-offset: -3px;
}

.help-detail__more {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(23 32 46 / 55%);
  color: #ffffff;
  font-size: 26px;
  font-weight: 700;
}

/* ---- กล่องเสนอช่วย ---- */
.help-detail__panel {
  display: grid;
  gap: 12px;
}

.help-detail__offer-count {
  margin: -6px 0 0;
  color: var(--gs-muted);
  font-size: 14px;
}

.help-detail__hint,
.help-detail__empty {
  margin: 0;
  color: var(--gs-muted);
  font-size: 14px;
  line-height: 1.55;
}

.help-detail__notice {
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-action-tint);
  color: var(--gs-action);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}

.help-detail__notice--good { background: var(--gs-help-tint); color: var(--gs-help); }
.help-detail__notice--warn { background: var(--gs-pending-tint); color: var(--gs-pending); }
.help-detail__notice--muted { background: var(--gs-surface-sunken); color: var(--gs-muted); }

.help-detail__notice a {
  margin-left: 4px;
  color: inherit;
  text-underline-offset: 3px;
}

.help-detail__error {
  margin: 0;
  color: var(--gs-danger);
  font-size: 14px;
}

.help-detail__offer-form {
  display: grid;
  gap: 10px;
}

.help-detail__offer-form label {
  display: grid;
  gap: 6px;
  color: var(--gs-ink);
  font-size: 14px;
  font-weight: 600;
}

.help-detail__offer-form small {
  color: var(--gs-muted);
  font-weight: 400;
}

.help-detail__offer-form textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
  color: var(--gs-ink);
  font: inherit;
  font-size: 15px;
  resize: vertical;
}

.help-detail__offer-form textarea:focus-visible {
  outline: none;
  border-color: var(--gs-help);
  box-shadow: var(--gs-focus);
}

/* ปุ่ม */
.help-detail__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface);
  color: var(--gs-ink);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 140ms ease;
}

.help-detail__button:hover {
  background: var(--gs-surface-sunken);
}

.help-detail__button--primary {
  border-color: var(--gs-help);
  background: var(--gs-help);
  color: #ffffff;
}

.help-detail__button--primary:hover {
  background: var(--gs-help-hover);
}

.help-detail__button--wide {
  width: 100%;
  min-height: 44px;
}

.help-detail__button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.help-detail__button:focus-visible,
.help-detail-page__back:focus-visible,
.help-detail-page__retry:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

.help-detail__button--danger {
  border-color: var(--gs-danger);
  background: var(--gs-danger);
  color: #ffffff;
}

.help-detail__button--danger:hover {
  background: var(--gs-danger);
  filter: brightness(0.92);
}

/* ปุ่มแบบลิงก์ สำหรับคำสั่งรอง เช่น ถอนข้อเสนอ, รายงาน */
.help-detail__link {
  justify-self: start;
  padding: 4px 0;
  border: 0;
  background: transparent;
  color: var(--gs-muted);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.help-detail__link:hover {
  color: var(--gs-danger);
}

.help-detail__link--small {
  font-size: 12px;
}

.help-detail__link:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

/* กล่องยืนยันก่อนทำสิ่งที่ย้อนกลับไม่ได้ */
.help-detail__confirm {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
}

.help-detail__confirm p {
  margin: 0;
  color: var(--gs-ink-2);
  font-size: 13px;
  line-height: 1.5;
}

.help-detail__row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.help-detail__quote {
  margin: 0;
  color: var(--gs-ink-2);
  font-size: 14px;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.help-detail__hint--strong {
  color: var(--gs-ink-2);
  font-weight: 600;
}

/* ป้ายตำแหน่งโดยประมาณ (คนทั่วไปเห็นพิกัดที่ปัดแล้ว ~500 ม.) */
.help-detail__approx {
  padding: 2px 8px;
  border: 1px dashed var(--gs-line-strong);
  border-radius: 999px;
  color: var(--gs-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: help;
}

/* สายด่วน: เว้นระยะจากส่วนเสนอช่วย */
.help-detail__hotlines {
  margin-top: 4px;
}

/* จุดเลือกรูปใน lightbox (แบบเดียวกับหน้ารายงาน) */
.lightbox-dots {
  position: absolute;
  bottom: 24px;
  left: 50%;
  z-index: 1;
  display: flex;
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
}

.dot.active {
  background-color: #ffab00;
}

.dot:focus-visible {
  outline: 2px solid #ffab00;
  outline-offset: 3px;
}

/* ===== จอแคบ: เรียงลงมา กล่องเสนอช่วยอยู่ต่อจากหัว ===== */
@media (max-width: 960px) {
  .help-detail {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'hero'
      'panel'
      'body'
      'media';
  }

  .help-detail__panel {
    position: static;
  }
}

@media (max-width: 640px) {
  .help-detail-page {
    padding: 16px;
  }

  .help-detail__card {
    padding: 20px 18px;
  }

  .help-detail__icon {
    width: 44px;
    height: 44px;
  }

  .help-detail__icon img {
    width: 26px;
    height: 26px;
  }

  .help-detail__photos--1 { grid-auto-rows: 220px; }
  .help-detail__photos--2 { grid-auto-rows: 160px; }
  .help-detail__photos { grid-auto-rows: 120px; }
}
</style>
