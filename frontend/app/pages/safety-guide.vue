<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import EmergencyNumbers from '~/components/guide/EmergencyNumbers.vue'
import GuideTopic from '~/components/guide/GuideTopic.vue'
import GuideDesktop from '~/components/guide/GuideDesktop.vue'
import { getEmergencyGuide, guideCategories } from '~/utils/emergencyGuides'

const { t, locale } = useLocale()
const route = useRoute()
const router = useRouter()
const { isMobile } = useResponsiveView()

definePageMeta({
  showRightPanel: false
})

useHead(() => ({ title: t('nav.safetyGuide') }))

// เปลี่ยนภาษาแล้วเนื้อหาคู่มือเปลี่ยนตาม (หัวข้อที่ยังไม่มีฉบับแปลจะแสดงภาษาไทย)
const guides = computed(() =>
  Object.fromEntries(
    guideCategories.flatMap((category) => category.topics).map((topic) => [topic, getEmergencyGuide(topic, locale.value)]),
  ),
)

// ---- มือถือ: หน้ารายการคู่มือ กับ หน้าคู่มือทีละเรื่อง ----
// เดิมเป็นรายการพับเปิด เปิดหลายเรื่องแล้วเนื้อหาต่อกันยาว ผู้ใช้อ่านแล้วงงว่าเรื่องไหนจบตรงไหน
// ตอนนี้กดชื่อเรื่องแล้วจะเหลือแค่คู่มือเรื่องนั้นเรื่องเดียว (URL เป็น /safety-guide#flood)
// ใช้ #ชื่อเรื่อง ใน URL ทำให้กดย้อนกลับของมือถือแล้วกลับมาหน้ารายการได้ และลิงก์เดิมที่ส่ง #flood มายังใช้ได้

// เรื่องที่กำลังเปิดอ่าน (null = อยู่หน้ารายการ)
// ตั้งค่าหลัง mount เพราะตอน SSR เซิร์ฟเวอร์ไม่รู้ hash ของ URL ถ้าตั้งเลยหน้าจอจะไม่ตรงกัน
const selectedTopic = ref(null)

// ช่วงที่เลือกของแต่ละหัวข้อ เริ่มที่ "ระหว่างเกิด" เพราะคนที่เปิดตอนตกใจส่วนใหญ่อยู่ในเหตุแล้ว
const phaseByTopic = ref({})

const selectPhase = (topic, phase) => {
  phaseByTopic.value = { ...phaseByTopic.value, [topic]: phase }
}

// อ่าน #ชื่อเรื่อง จาก URL แล้วเลือกเรื่องนั้น (ไม่มี หรือไม่รู้จัก = กลับหน้ารายการ)
const syncTopicFromHash = () => {
  const topic = route.hash.slice(1)
  if (guides.value[topic]) {
    selectedTopic.value = topic
  } else {
    selectedTopic.value = null
  }
}

// กดชื่อเรื่องในรายการ: เปิดหน้าคู่มือเรื่องนั้น (เพิ่มประวัติ กดย้อนกลับแล้วกลับมารายการ)
const openTopic = (topic) => {
  router.push({ hash: `#${topic}` })
}

// ปุ่มกลับไปรายการ: ถ้ามาจากหน้ารายการให้ย้อนกลับ (ตำแหน่งเลื่อนเดิมยังอยู่)
// ถ้าเปิดจากลิงก์ตรง ๆ ไม่มีหน้ารายการก่อนหน้า ให้เปลี่ยนไปหน้ารายการแทน
const backToList = () => {
  const previousPath = window.history.state?.back
  if (previousPath === '/safety-guide') {
    router.back()
    return
  }
  router.replace({ hash: '' })
}

onMounted(syncTopicFromHash)
watch(() => route.hash, syncTopicFromHash)
</script>

<template>
  <!-- จอคอม: ดูทีละหัวข้อ จัดเนื้อหาเป็นคอลัมน์ / มือถือ: หน้ารายการ แล้วกดเข้าไปอ่านทีละเรื่อง -->
  <div v-if="!isMobile" class="safety-guide-page">
    <GuideDesktop :guides="guides" />
  </div>

  <!-- มือถือ หน้าคู่มือเรื่องเดียว: ไม่แสดงเรื่องอื่น จะได้ไม่อ่านต่อกันจนงง -->
  <div v-else-if="selectedTopic" class="safety-guide-page">
    <EmergencyNumbers />

    <div class="safety-guide-page__content">
      <button type="button" class="safety-guide-page__back" @click="backToList">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m15 6-6 6 6 6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
        </svg>
        {{ t('safetyGuidePage.backToList') }}
      </button>

      <GuideTopic
        :key="selectedTopic"
        :topic="selectedTopic"
        :guide="guides[selectedTopic]"
        :is-open="true"
        :phase="phaseByTopic[selectedTopic] ?? 'during'"
        @toggle="backToList"
        @select-phase="selectPhase"
      />
    </div>
  </div>

  <!-- มือถือ หน้ารายการ: แสดงแค่ชื่อเรื่อง กดแล้วเข้าไปหน้าคู่มือเรื่องนั้น -->
  <div v-else class="safety-guide-page">
    <EmergencyNumbers />

    <div class="safety-guide-page__content">
      <header class="safety-guide-page__header">
        <h1>{{ t('nav.safetyGuide') }}</h1>
        <p>{{ t('safetyGuidePage.intro') }}</p>
      </header>

      <section
        v-for="category in guideCategories"
        :key="category.id"
        class="safety-guide-page__category"
        :aria-labelledby="`guide-category-title-${category.id}`"
      >
        <h2 :id="`guide-category-title-${category.id}`">{{ t(`guideCategories.${category.id}`) }}</h2>
        <GuideTopic
          v-for="topic in category.topics"
          :key="topic"
          :topic="topic"
          :guide="guides[topic]"
          :is-open="false"
          @toggle="openTopic"
        />
      </section>
    </div>
  </div>
</template>

<style scoped>
.safety-guide-page {
  min-height: 100%;
  background: var(--gs-surface);
}

.safety-guide-page__content {
  max-width: 52rem;
  padding: 2rem 1.5rem 3rem;
}

.safety-guide-page__header h1 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1.25;
  text-wrap: balance;
}

.safety-guide-page__header p {
  max-width: 60ch;
  margin: 0.5rem 0 0;
  color: var(--gs-muted);
  line-height: 1.6;
}

.safety-guide-page__category {
  margin-top: 2.5rem;
}

.safety-guide-page__category h2 {
  margin: 0 0 0.35rem;
  color: var(--gs-muted);
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.4;
}

/* ปุ่มกลับไปรายการคู่มือ (หน้าคู่มือเรื่องเดียวบนมือถือ) */
.safety-guide-page__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  margin: -8px 0 8px -8px;
  padding: 0 12px 0 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--gs-action);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.safety-guide-page__back svg {
  width: 20px;
  height: 20px;
}

.safety-guide-page__back:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

.safety-guide-page__category > :last-child {
  border-bottom: 1px solid var(--gs-line);
}

@media (max-width: 640px) {
  .safety-guide-page__content {
    padding: 1.5rem 1rem 2.5rem;
  }

  .safety-guide-page__header h1 {
    font-size: 1.5rem;
  }
}
</style>
