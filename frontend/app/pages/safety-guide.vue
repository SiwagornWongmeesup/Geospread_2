<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import EmergencyNumbers from '~/components/guide/EmergencyNumbers.vue'
import GuideTopic from '~/components/guide/GuideTopic.vue'
import GuideDesktop from '~/components/guide/GuideDesktop.vue'
import { getEmergencyGuide, guideCategories } from '~/utils/emergencyGuides'

const { t, locale } = useLocale()
const route = useRoute()
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

const openTopics = ref(new Set())
// ช่วงที่เลือกของแต่ละหัวข้อ เริ่มที่ "ระหว่างเกิด" เพราะคนที่เปิดตอนตกใจส่วนใหญ่อยู่ในเหตุแล้ว
const phaseByTopic = ref({})

const toggleTopic = (topic) => {
  const next = new Set(openTopics.value)
  if (next.has(topic)) next.delete(topic)
  else next.add(topic)
  openTopics.value = next
}

const selectPhase = (topic, phase) => {
  phaseByTopic.value = { ...phaseByTopic.value, [topic]: phase }
}

// เปิดจากหมุดหรือเมนูด้วย /safety-guide#flood: กางหัวข้อนั้นที่แท็บ "ระหว่างเกิด" แล้วเลื่อนไปหา
// (ทำหลัง mount เพราะตอน SSR เซิร์ฟเวอร์ไม่รู้ hash ของ URL)
const openTopicFromHash = async () => {
  if (!isMobile.value) return
  const topic = route.hash.slice(1)
  if (!guides.value[topic]) return

  openTopics.value = new Set([...openTopics.value, topic])
  selectPhase(topic, 'during')
  await nextTick()
  document.getElementById(topic)?.scrollIntoView({ block: 'start' })
}

onMounted(openTopicFromHash)
watch(() => route.hash, openTopicFromHash)
</script>

<template>
  <!-- จอคอม: ดูทีละหัวข้อ จัดเนื้อหาเป็นคอลัมน์ / มือถือ: รายการพับเปิดทีละหัวข้อ -->
  <div v-if="!isMobile" class="safety-guide-page">
    <GuideDesktop :guides="guides" />
  </div>

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
          :is-open="openTopics.has(topic)"
          :phase="phaseByTopic[topic] ?? 'during'"
          @toggle="toggleTopic"
          @select-phase="selectPhase"
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
