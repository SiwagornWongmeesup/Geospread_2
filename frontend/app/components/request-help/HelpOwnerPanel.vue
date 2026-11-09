<template>
  <!-- กล่องของเจ้าของคำขอ: เลือกผู้ช่วย, ติดต่อผู้ช่วย, ปิด/ยกเลิกคำขอ -->
  <div class="owner-panel">
    <!-- ยังไม่มีเบอร์และ LINE ในโปรไฟล์: ผู้ช่วยจะติดต่อไม่ได้ -->
    <p v-if="isOpen && !hasAnyContact" class="owner-panel__notice owner-panel__notice--warn">
      {{ t('helpDetail.noContactOwner') }}
      <NuxtLink to="/profile">{{ t('helpDetail.addContact') }}</NuxtLink>
    </p>

    <!-- ===== มีผู้ช่วยแล้ว ===== -->
    <template v-if="statusKey === 'accepted' && acceptedOffer">
      <p class="owner-panel__notice owner-panel__notice--good" role="status">
        {{ t('helpDetail.youAccepted', { name: helperName(acceptedOffer) }) }}
      </p>

      <HelpContactCard
        :title="t('helpDetail.helperContactTitle')"
        :name="helperName(acceptedOffer)"
        :phone="acceptedOffer.contact?.phone"
        :line-id="acceptedOffer.contact?.line_id"
        :empty-text="t('helpDetail.helperNoContact')"
      />
      <p class="owner-panel__hint">{{ t('helpDetail.youShared', { channels: sharedChannelsText }) }}</p>

      <button type="button" class="owner-panel__button owner-panel__button--primary owner-panel__button--wide" :disabled="isBusy" @click="runStatusAction('resolve')">
        {{ t('helpDetail.markResolved') }}
      </button>

      <!-- ผู้ช่วยไม่มา: ต้องกดยืนยันอีกครั้ง -->
      <div v-if="confirmingAction === 'release_helper'" class="owner-panel__confirm">
        <p>{{ t('helpDetail.confirmRelease') }}</p>
        <div class="owner-panel__row">
          <button type="button" class="owner-panel__button owner-panel__button--danger" :disabled="isBusy" @click="runStatusAction('release_helper')">
            {{ t('helpDetail.confirmReleaseButton') }}
          </button>
          <button type="button" class="owner-panel__button" :disabled="isBusy" @click="confirmingAction = null">{{ t('helpDetail.cancel') }}</button>
        </div>
      </div>
      <button v-else type="button" class="owner-panel__button owner-panel__button--wide" :disabled="isBusy" @click="confirmingAction = 'release_helper'">
        {{ t('helpDetail.releaseHelper') }}
      </button>

      <button v-if="!acceptedOffer.is_reported" type="button" class="owner-panel__link" @click="emit('report', acceptedOffer)">
        {{ t('helpDetail.reportUser', { name: helperName(acceptedOffer) }) }}
      </button>
    </template>

    <!-- ===== ปิดแล้ว: ได้รับความช่วยเหลือ / ยกเลิก / หมดเวลา ===== -->
    <p v-else-if="statusKey !== 'pending'" class="owner-panel__notice owner-panel__notice--muted" role="status">
      {{ t(`helpDetail.closedSummary.${statusKey}`) }}
    </p>

    <!-- ===== รายการข้อเสนอ ===== -->
    <p v-if="statusKey === 'pending' && !listedOffers.length" class="owner-panel__hint">{{ t('helpDetail.noOffersOwner') }}</p>
    <h3 v-if="statusKey !== 'pending' && listedOffers.length" class="owner-panel__subtitle">{{ t('helpDetail.otherOffers') }}</h3>

    <ul v-if="listedOffers.length" class="owner-panel__offers">
      <li v-for="offer in listedOffers" :key="offer.offer_id" class="offer">
        <div class="offer__head">
          <strong>{{ helperName(offer) }}</strong>
          <span class="offer__status" :class="`offer__status--${offer.offer_status}`">{{ t(`helpDetail.offerStatus.${offer.offer_status}`) }}</span>
        </div>

        <!-- ข้อมูลให้ผู้ขอใช้ตัดสินใจ: สมัครเมื่อไหร่ เคยช่วยสำเร็จกี่ครั้ง -->
        <p class="offer__meta">
          <span v-if="isNewAccount(offer)" class="offer__badge">{{ t('helpDetail.newAccount') }}</span>
          <span>{{ t('helpDetail.memberSince', { date: formatMonthYear(offer.helper_since) }) }}</span>
          <span aria-hidden="true">•</span>
          <span>{{ helpedText(offer) }}</span>
          <template v-if="!offer.has_contact">
            <span aria-hidden="true">•</span>
            <span>{{ t('helpDetail.helperNoContactShort') }}</span>
          </template>
        </p>

        <p v-if="offer.message" class="offer__message">{{ offer.message }}</p>
        <time class="offer__time" :datetime="offer.created_at">{{ formatRelativeTime(offer.created_at, t) }}</time>

        <!-- ตอบได้เฉพาะข้อเสนอที่ยังรอ และคำขอยังรอความช่วยเหลือ -->
        <div v-if="offer.offer_status === 'pending' && statusKey === 'pending'" class="offer__actions">
          <!-- ขั้นยืนยัน: เลือกว่าจะแชร์ช่องทางไหนให้ผู้ช่วย -->
          <fieldset v-if="confirmingOfferId === offer.offer_id" class="offer__share">
            <legend>{{ t('helpDetail.shareLegend') }}</legend>

            <!-- มีเบอร์หรือ LINE ในโปรไฟล์: เลือกช่องที่จะแชร์ -->
            <template v-if="hasAnyContact">
              <label :class="{ 'is-disabled': !myContact.has_phone }">
                <input v-model="sharePhone" type="checkbox" :disabled="!myContact.has_phone">
                <span>{{ t('helpDetail.sharePhone') }}</span>
                <small v-if="!myContact.has_phone">{{ t('helpDetail.notInProfile') }}</small>
              </label>
              <label :class="{ 'is-disabled': !myContact.has_line }">
                <input v-model="shareLine" type="checkbox" :disabled="!myContact.has_line">
                <span>{{ t('helpDetail.shareLine') }}</span>
                <small v-if="!myContact.has_line">{{ t('helpDetail.notInProfile') }}</small>
              </label>
            </template>
            <!-- ไม่มีทั้งสองฝ่าย: ติดต่อกันไม่ได้ ต้องเพิ่มในโปรไฟล์ก่อน -->
            <p v-else-if="!offer.has_contact" class="offer__share-warn">
              {{ t('helpDetail.bothNoContact') }}
              <NuxtLink to="/profile">{{ t('helpDetail.addContact') }}</NuxtLink>
            </p>
            <!-- ผู้ขอไม่มี แต่ผู้ช่วยมี: รับได้ แล้วผู้ขอติดต่อไปเอง -->
            <p v-else class="offer__share-note">{{ t('helpDetail.youContactHelper') }}</p>

            <p>{{ t('helpDetail.confirmAccept') }}</p>
            <div class="owner-panel__row">
              <button
                type="button"
                class="owner-panel__button owner-panel__button--primary"
                :disabled="isBusy || !canConfirmAccept(offer)"
                @click="respondToOffer(offer, 'accept')"
              >
                {{ t('helpDetail.confirmAcceptButton') }}
              </button>
              <button type="button" class="owner-panel__button" :disabled="isBusy" @click="confirmingOfferId = null">{{ t('helpDetail.cancel') }}</button>
            </div>
          </fieldset>

          <template v-else>
            <button type="button" class="owner-panel__button owner-panel__button--primary" :disabled="isBusy" @click="startAccept(offer)">
              {{ t('helpDetail.accept') }}
            </button>
            <button type="button" class="owner-panel__button" :disabled="isBusy" @click="respondToOffer(offer, 'decline')">
              {{ t('helpDetail.decline') }}
            </button>
          </template>
        </div>

        <button v-if="!offer.is_reported" type="button" class="owner-panel__link owner-panel__link--small" @click="emit('report', offer)">
          {{ t('helpDetail.report') }}
        </button>
      </li>
    </ul>

    <p v-if="errorMessage" class="owner-panel__error" role="alert">{{ errorMessage }}</p>

    <!-- ===== ยกเลิกคำขอ (ยังรอ หรือ มีผู้ช่วยแล้ว) ===== -->
    <div v-if="isOpen" class="owner-panel__cancel">
      <div v-if="confirmingAction === 'cancel'" class="owner-panel__confirm">
        <p>{{ t('helpDetail.confirmCancelRequest') }}</p>
        <div class="owner-panel__row">
          <button type="button" class="owner-panel__button owner-panel__button--danger" :disabled="isBusy" @click="runStatusAction('cancel')">
            {{ t('helpDetail.confirmCancelRequestButton') }}
          </button>
          <button type="button" class="owner-panel__button" :disabled="isBusy" @click="confirmingAction = null">{{ t('helpDetail.keepRequest') }}</button>
        </div>
      </div>
      <button v-else type="button" class="owner-panel__link" @click="confirmingAction = 'cancel'">{{ t('helpDetail.cancelRequest') }}</button>
    </div>
  </div>
</template>

<script setup>
import HelpContactCard from '~/components/request-help/HelpContactCard.vue'
import { formatRelativeTime } from '~/composables/useHomeDashboard'
import { getApiErrorMessage } from '~/utils/apiError'

const props = defineProps({
  // ข้อมูลจาก GET /help-requests/:id (มุมมองของเจ้าของ)
  request: { type: Object, required: true },
  // pending | accepted | resolved | cancelled | expired
  statusKey: { type: String, required: true },
})

// updated: ส่งข้อมูลคำขอล่าสุดกลับไปให้หน้าแม่, report: เปิดหน้าต่างรายงานผู้ช่วยคนนั้น
const emit = defineEmits(['updated', 'report'])

const { t, locale } = useLocale()
const { getToken } = useAuth()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:5000'

const NEW_ACCOUNT_DAYS = 7

const isBusy = ref(false)
const errorMessage = ref('')
const confirmingOfferId = ref(null)
// 'release_helper' | 'cancel' | null : ปุ่มที่กำลังรอให้กดยืนยัน
const confirmingAction = ref(null)
const sharePhone = ref(false)
const shareLine = ref(false)

const myContact = computed(() => props.request.viewer?.my_contact ?? { has_phone: false, has_line: false })
const hasAnyContact = computed(() => myContact.value.has_phone || myContact.value.has_line)
const isOpen = computed(() => props.statusKey === 'pending' || props.statusKey === 'accepted')

const acceptedOffer = computed(() => {
  for (const offer of props.request.offers ?? []) {
    if (offer.offer_status === 'accepted') {
      return offer
    }
  }
  return null
})

// ตอนมีผู้ช่วยแล้ว ผู้ช่วยแสดงด้านบนแยกต่างหาก รายการด้านล่างจึงไม่ต้องซ้ำ
const listedOffers = computed(() => {
  const offers = props.request.offers ?? []
  if (props.statusKey === 'accepted' && acceptedOffer.value) {
    return offers.filter((offer) => offer.offer_id !== acceptedOffer.value.offer_id)
  }
  return offers
})

// ช่องทางที่แชร์ให้ผู้ช่วยไปแล้ว เช่น "เบอร์โทรและ LINE"
const sharedChannelsText = computed(() => {
  const channels = []
  if (props.request.share_phone) {
    channels.push(t('helpDetail.sharePhone'))
  }
  if (props.request.share_line) {
    channels.push(t('helpDetail.shareLine'))
  }
  return channels.join(t('helpDetail.and'))
})

const helperName = (offer) => {
  if (offer.helper_name) {
    return offer.helper_name
  }
  return t('helpDetail.anonymousHelper')
}

const helpedText = (offer) => {
  if (offer.helped_count > 0) {
    return t('helpDetail.helpedCount', { count: offer.helped_count })
  }
  return t('helpDetail.neverHelped')
}

// สมัครไม่ถึง 7 วัน = บัญชีใหม่ (ให้ผู้ขอระวังมากขึ้น)
const isNewAccount = (offer) => {
  const createdAt = new Date(offer.helper_since).getTime()
  if (Number.isNaN(createdAt)) {
    return false
  }
  const ageInDays = (Date.now() - createdAt) / (24 * 60 * 60 * 1000)
  return ageInDays < NEW_ACCOUNT_DAYS
}

const formatMonthYear = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }
  let dateLocale = 'th-TH'
  if (locale.value === 'en') {
    dateLocale = 'en-GB'
  }
  return new Intl.DateTimeFormat(dateLocale, { month: 'short', year: 'numeric' }).format(date)
}

// กดยืนยันรับได้ไหม:
// - ผู้ขอมีช่องทางติดต่อ: ต้องติ๊กแชร์อย่างน้อย 1 ช่อง
// - ผู้ขอไม่มี: รับได้ถ้าผู้ช่วยมีช่องทางติดต่อ (ผู้ขอติดต่อไปเอง)
const canConfirmAccept = (offer) => {
  if (hasAnyContact.value) {
    return sharePhone.value || shareLine.value
  }
  return Boolean(offer.has_contact)
}

// กด "รับข้อเสนอ": เปิดขั้นยืนยัน ติ๊กช่องทางที่มีในโปรไฟล์ไว้ให้ก่อน
const startAccept = (offer) => {
  sharePhone.value = myContact.value.has_phone
  shareLine.value = myContact.value.has_line
  confirmingOfferId.value = offer.offer_id
}

const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` })

const respondToOffer = async (offer, action) => {
  isBusy.value = true
  errorMessage.value = ''
  try {
    const body = { action }
    if (action === 'accept') {
      body.share_phone = sharePhone.value
      body.share_line = shareLine.value
    }
    const response = await $fetch(`${apiBase}/help-requests/${props.request.help_request_id}/offers/${offer.offer_id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body,
    })
    confirmingOfferId.value = null
    emit('updated', response.data)
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('helpDetail.respondFailed'))
  } finally {
    isBusy.value = false
  }
}

// resolve | cancel | release_helper
const runStatusAction = async (action) => {
  isBusy.value = true
  errorMessage.value = ''
  try {
    const response = await $fetch(`${apiBase}/help-requests/${props.request.help_request_id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: { action },
    })
    confirmingAction.value = null
    emit('updated', response.data)
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('helpDetail.statusFailed'))
  } finally {
    isBusy.value = false
  }
}
</script>

<style scoped>
.owner-panel {
  display: grid;
  gap: 12px;
}

.owner-panel__notice {
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--gs-radius-sm);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}

.owner-panel__notice--good { background: var(--gs-help-tint); color: var(--gs-help); }
.owner-panel__notice--warn { background: var(--gs-pending-tint); color: var(--gs-pending); }
.owner-panel__notice--muted { background: var(--gs-surface-sunken); color: var(--gs-muted); }

.owner-panel__notice a {
  margin-left: 4px;
  color: inherit;
  text-underline-offset: 3px;
}

.owner-panel__hint {
  margin: 0;
  color: var(--gs-muted);
  font-size: 13px;
  line-height: 1.55;
}

.owner-panel__subtitle {
  margin: 4px 0 0;
  color: var(--gs-ink-2);
  font-size: 14px;
  font-weight: 700;
}

.owner-panel__error {
  margin: 0;
  color: var(--gs-danger);
  font-size: 14px;
}

.owner-panel__row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.owner-panel__confirm {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
}

.owner-panel__confirm p {
  margin: 0;
  color: var(--gs-ink-2);
  font-size: 13px;
  line-height: 1.5;
}

.owner-panel__cancel {
  padding-top: 4px;
}

/* ---- ปุ่ม ---- */
.owner-panel__button {
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
  cursor: pointer;
  transition: background-color 140ms ease;
}

.owner-panel__button:hover {
  background: var(--gs-surface-sunken);
}

.owner-panel__button--primary {
  border-color: var(--gs-help);
  background: var(--gs-help);
  color: #ffffff;
}

.owner-panel__button--primary:hover {
  background: var(--gs-help-hover);
}

.owner-panel__button--danger {
  border-color: var(--gs-danger);
  background: var(--gs-danger);
  color: #ffffff;
}

.owner-panel__button--danger:hover {
  background: var(--gs-danger);
  filter: brightness(0.92);
}

.owner-panel__button--wide {
  width: 100%;
  min-height: 44px;
}

.owner-panel__button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.owner-panel__link {
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

.owner-panel__link:hover {
  color: var(--gs-danger);
}

.owner-panel__link--small {
  font-size: 12px;
}

.owner-panel__button:focus-visible,
.owner-panel__link:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

/* ---- ข้อเสนอแต่ละรายการ ---- */
.owner-panel__offers {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.offer {
  display: grid;
  gap: 4px;
  padding: 12px;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius-sm);
}

.offer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.offer__status {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.offer__status--pending { background: var(--gs-pending-tint); color: var(--gs-pending); }
.offer__status--accepted { background: var(--gs-help-tint); color: var(--gs-help); }
.offer__status--declined,
.offer__status--withdrawn,
.offer__status--released { background: var(--gs-surface-sunken); color: var(--gs-muted); }

.offer__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 6px;
  margin: 0;
  color: var(--gs-muted);
  font-size: 12px;
}

.offer__badge {
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--gs-pending-tint);
  color: var(--gs-pending);
  font-weight: 700;
}

.offer__message {
  margin: 2px 0 0;
  color: var(--gs-ink-2);
  font-size: 14px;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.offer__time {
  color: var(--gs-muted);
  font-size: 12px;
}

.offer__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

/* ขั้นยืนยันรับข้อเสนอ: เลือกช่องทางติดต่อ */
.offer__share {
  display: grid;
  flex-basis: 100%;
  gap: 6px;
  margin: 0;
  padding: 10px 12px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
}

.offer__share legend {
  padding: 0 4px;
  color: var(--gs-ink);
  font-size: 13px;
  font-weight: 700;
}

.offer__share label {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  color: var(--gs-ink);
  font-size: 14px;
  cursor: pointer;
}

.offer__share label.is-disabled {
  color: var(--gs-muted);
  cursor: not-allowed;
}

.offer__share input {
  width: 18px;
  height: 18px;
  accent-color: var(--gs-help);
}

.offer__share small {
  color: var(--gs-muted);
  font-size: 12px;
}

.offer__share p {
  margin: 0;
  color: var(--gs-ink-2);
  font-size: 13px;
  line-height: 1.5;
}

.offer__share .offer__share-warn {
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--gs-pending-tint);
  color: var(--gs-pending);
  font-weight: 600;
}

.offer__share-warn a {
  margin-left: 4px;
  color: inherit;
  text-underline-offset: 3px;
}

.offer__share .offer__share-note {
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--gs-help-tint);
  color: var(--gs-help);
  font-weight: 600;
}
</style>
