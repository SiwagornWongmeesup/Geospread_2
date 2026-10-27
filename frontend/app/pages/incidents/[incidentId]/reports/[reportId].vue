<script setup>
import { computed, onMounted, ref, watch } from 'vue'

definePageMeta({
  showRightPanel: false,
})

const route = useRoute()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:5000'

const report = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')

const incidentId = computed(() => Number(route.params.incidentId))
const reportId = computed(() => Number(route.params.reportId))

const mediaList = computed(() => {
  if (!Array.isArray(report.value?.media)) return []

  return report.value.media.filter((media) => media?.media_url)
})

const formattedCreatedAt = computed(() => {
  const date = new Date(report.value?.created_at)
  if (Number.isNaN(date.getTime())) return 'ไม่ทราบเวลาที่รายงาน'

  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
})

const getMediaLabel = (media) => {
  if (media?.media_type === 'video') return 'วิดีโอจากผู้รายงาน'
  if (media?.media_type === 'image') return 'รูปภาพจากผู้รายงาน'
  return 'ไฟล์แนบจากผู้รายงาน'
}

const loadReport = async () => {
  report.value = null
  errorMessage.value = ''

  if (!Number.isInteger(incidentId.value) || !Number.isInteger(reportId.value)) {
    isLoading.value = false
    errorMessage.value = 'ลิงก์รายงานไม่ถูกต้อง'
    return
  }

  isLoading.value = true

  try {
    const response = await $fetch(
      `${apiBase}/incidents/${incidentId.value}/reports/${reportId.value}`,
    )
    report.value = response.data
  } catch (error) {
    console.error('ไม่สามารถโหลดรายละเอียดรายงานได้', error)
    errorMessage.value = 'ไม่พบรายงานนี้ หรือรายงานอาจไม่อยู่ในกลุ่มเหตุการณ์นี้'
  } finally {
    isLoading.value = false
  }
}

const goBackToMap = () => {
  void navigateTo('/')
}

onMounted(() => {
  void loadReport()
})

watch([incidentId, reportId], () => {
  void loadReport()
})
</script>

<template>
  <main class="report-detail-page">
    <section class="report-detail-page__content" aria-labelledby="report-detail-title">
      <button type="button" class="report-detail-page__back" @click="goBackToMap">
        <span aria-hidden="true">←</span>
        กลับไปแผนที่เหตุการณ์
      </button>

      <p v-if="isLoading" class="report-detail-page__state" aria-live="polite">
        กำลังโหลดรายละเอียดรายงาน…
      </p>

      <section v-else-if="errorMessage" class="report-detail-page__state report-detail-page__state--error" role="alert">
        <h1 id="report-detail-title">เปิดรายงานไม่สำเร็จ</h1>
        <p>{{ errorMessage }}</p>
        <button type="button" class="report-detail-page__retry" @click="loadReport">ลองอีกครั้ง</button>
      </section>

      <article v-else-if="report" class="report-detail">
        <header class="report-detail__header">
          <div class="report-detail__avatar" aria-hidden="true">
            {{ String(report.reporter_name || '?').slice(0, 1).toUpperCase() }}
          </div>

          <div class="report-detail__reporter">
            <p>รายงานโดย</p>
            <h1 id="report-detail-title">{{ report.reporter_name || 'ไม่ระบุชื่อผู้รายงาน' }}</h1>
            <time :datetime="report.created_at">{{ formattedCreatedAt }}</time>
          </div>

          <span class="report-detail__status">รอตรวจสอบ</span>
        </header>

        <section class="report-detail__section" aria-labelledby="report-description-title">
          <h2 id="report-description-title">รายละเอียดที่รายงาน</h2>
          <p class="report-detail__description">{{ report.description || 'ผู้รายงานไม่ได้ระบุรายละเอียดเพิ่มเติม' }}</p>
        </section>

        <section class="report-detail__section" aria-labelledby="report-media-title">
          <div class="report-detail__section-heading">
            <h2 id="report-media-title">รูปภาพและสื่อแนบ</h2>
            <span>{{ mediaList.length }} ไฟล์</span>
          </div>

          <p v-if="!mediaList.length" class="report-detail__empty">ไม่มีสื่อแนบในรายงานนี้</p>

          <div v-else class="report-detail__media-grid">
            <figure v-for="media in mediaList" :key="media.media_id" class="report-detail__media">
              <img
                v-if="media.media_type === 'image'"
                :src="media.media_url"
                :alt="getMediaLabel(media)"
              >
              <video
                v-else-if="media.media_type === 'video'"
                :src="media.media_url"
                controls
                preload="metadata"
              >
                เบราว์เซอร์นี้ไม่รองรับการเล่นวิดีโอ
              </video>
              <a v-else :href="media.media_url" target="_blank" rel="noopener noreferrer">
                เปิด{{ getMediaLabel(media) }}
              </a>
            </figure>
          </div>
        </section>

        <footer class="report-detail__footer">
          <span>เลขที่รายงาน #{{ report.report_id }}</span>
          <span>เหตุการณ์ #{{ incidentId }}</span>
        </footer>
      </article>
    </section>
  </main>
</template>

<style scoped>
.report-detail-page { min-height: 100%; padding: 28px; background: #f2f7fd; }
.report-detail-page__content { width: min(860px, 100%); margin: 0 auto; }
.report-detail-page__back { display: inline-flex; align-items: center; gap: 8px; padding: 8px 0; border: 0; background: transparent; color: #225ea9; cursor: pointer; font: inherit; font-size: 14px; font-weight: 800; }
.report-detail-page__back:hover { color: #0a4f9f; text-decoration: underline; text-underline-offset: 3px; }
.report-detail-page__back:focus-visible, .report-detail-page__retry:focus-visible { outline: 3px solid rgb(37 99 235 / 35%); outline-offset: 3px; }
.report-detail-page__state { margin: 20px 0 0; padding: 28px; border-radius: 14px; background: #ffffff; color: #50729f; font-size: 15px; font-weight: 700; text-align: center; }
.report-detail-page__state--error h1 { margin: 0; color: #153d77; font-size: 20px; }
.report-detail-page__state--error p { margin: 8px 0 0; }
.report-detail-page__retry { margin-top: 18px; padding: 10px 16px; border: 0; border-radius: 10px; background: #1672dc; color: #ffffff; cursor: pointer; font: inherit; font-size: 14px; font-weight: 800; }
.report-detail { margin-top: 16px; overflow: hidden; border-radius: 16px; background: #ffffff; box-shadow: 0 12px 28px rgb(22 64 118 / 12%); }
.report-detail__header { display: flex; align-items: center; gap: 12px; padding: 24px; background: #f8fbff; }
.report-detail__avatar { display: grid; width: 50px; height: 50px; flex: 0 0 auto; place-items: center; border-radius: 50%; background: #dcecff; color: #1c5dac; font-size: 20px; font-weight: 850; }
.report-detail__reporter { min-width: 0; }
.report-detail__reporter p { margin: 0; color: #6d86a9; font-size: 13px; font-weight: 700; }
.report-detail__reporter h1 { margin: 2px 0; overflow: hidden; color: #123b78; font-size: 22px; font-weight: 850; line-height: 1.25; text-overflow: ellipsis; white-space: nowrap; }
.report-detail__reporter time { color: #6680a4; font-size: 13px; font-weight: 650; }
.report-detail__status { margin-left: auto; padding: 7px 10px; border-radius: 999px; background: #fff0d5; color: #996007; font-size: 12px; font-weight: 850; white-space: nowrap; }
.report-detail__section { padding: 24px; border-top: 1px solid #e3edf8; }
.report-detail__section h2 { margin: 0; color: #183f7a; font-size: 17px; font-weight: 850; line-height: 1.3; }
.report-detail__description { margin: 12px 0 0; color: #32557e; font-size: 16px; font-weight: 550; line-height: 1.7; white-space: pre-wrap; }
.report-detail__section-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.report-detail__section-heading span { color: #6380a8; font-size: 13px; font-weight: 750; }
.report-detail__empty { margin: 12px 0 0; color: #6d86a9; font-size: 14px; }
.report-detail__media-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
.report-detail__media { min-width: 0; margin: 0; overflow: hidden; border-radius: 12px; background: #eaf2fb; }
.report-detail__media img, .report-detail__media video { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
.report-detail__media a { display: block; padding: 18px; color: #176bd0; font-size: 14px; font-weight: 800; text-decoration: none; }
.report-detail__media a:hover { text-decoration: underline; text-underline-offset: 3px; }
.report-detail__footer { display: flex; flex-wrap: wrap; gap: 8px 16px; padding: 16px 24px; color: #6a82a2; border-top: 1px solid #e3edf8; font-size: 12px; font-weight: 700; }

@media (max-width: 640px) {
  .report-detail-page { padding: 16px; }
  .report-detail__header { align-items: flex-start; padding: 18px; }
  .report-detail__status { margin-left: 0; }
  .report-detail__section { padding: 18px; }
  .report-detail__media-grid { grid-template-columns: 1fr; }
  .report-detail__footer { padding: 14px 18px; }
}
</style>
