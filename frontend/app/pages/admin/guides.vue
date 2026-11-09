<script setup>
// หน้าคู่มือความปลอดภัยของแอดมิน
// หมวดและหัวข้อเป็นของจริง (utils/emergencyGuides.js ชุดเดียวกับหน้า /safety-guide)
// วันที่แก้ไขและปุ่มแก้ไขยังเป็นตัวอย่าง (ยังไม่มีระบบแก้คู่มือ)
import AdminMockNotice from '~/components/admin/mock/AdminMockNotice.vue'
import AdminPanel from '~/components/admin/mock/AdminPanel.vue'
import { guideCategories } from '~/utils/emergencyGuides'
import { mockGuideUpdatedDates } from '~/data/adminMockData'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const { t, locale } = useLocale()
const actionMessage = ref('')

const formatDate = (isoDate) => {
  let dateLocale = 'th-TH'
  if (locale.value === 'en') {
    dateLocale = 'en-GB'
  }
  return new Intl.DateTimeFormat(dateLocale, { dateStyle: 'medium' }).format(new Date(`${isoDate}T12:00:00`))
}

// ใส่วันที่แก้ไขให้หัวข้อตามลำดับที่เรียงในคู่มือ
const categories = computed(() => {
  let topicNumber = 0
  return guideCategories.map((category) => {
    const topics = category.topics.map((topic) => {
      const updated = mockGuideUpdatedDates[topicNumber] ?? mockGuideUpdatedDates[0]
      topicNumber = topicNumber + 1
      return { id: topic, updated: formatDate(updated) }
    })
    return { id: category.id, topics }
  })
})

const runAction = (action) => {
  actionMessage.value = t('adminMock.actionNotice', { action })
}
</script>

<template>
  <div class="mock-page">
    <p class="mock-page__intro">{{ t('adminMock.guides.intro') }}</p>
    <AdminMockNotice :message="actionMessage" @close="actionMessage = ''" />

    <div class="guide-grid">
      <AdminPanel v-for="category in categories" :key="category.id" :title="t(`guideCategories.${category.id}`)" flush>
        <ul class="topics">
          <li v-for="topic in category.topics" :key="topic.id" class="topic">
            <span class="topic__text">
              <strong>{{ t(`guideTopics.${topic.id}`) }}</strong>
              <span>{{ t('adminMock.guides.published') }} · {{ t('adminMock.guides.updated', { date: topic.updated }) }}</span>
            </span>
            <span class="topic__actions">
              <NuxtLink :to="{ path: '/safety-guide', hash: `#${topic.id}` }" class="admin-button">{{ t('adminMock.guides.view') }}</NuxtLink>
              <button type="button" class="admin-button" @click="runAction(t('adminMock.guides.edit'))">{{ t('adminMock.guides.edit') }}</button>
            </span>
          </li>
        </ul>
      </AdminPanel>
    </div>
  </div>
</template>

<style scoped>
.mock-page {
  display: grid;
  gap: 16px;
}

.mock-page__intro {
  margin: 0;
  color: var(--gs-ink-2);
  font-size: 15px;
}

/* หมวดคู่มือวางเป็นคอลัมน์ตามความกว้างจอ */
.guide-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  align-items: start;
  gap: 16px;
}

.topics {
  margin: 0;
  padding: 0;
  list-style: none;
}

.topic {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--gs-line);
}

.topic:last-child {
  border-bottom: 0;
}

.topic__text {
  display: grid;
  gap: 2px;
}

.topic__text strong {
  font-size: 15px;
}

.topic__text span {
  color: var(--gs-ink-2);
  font-size: 14px;
}

.topic__actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 640px) {
  .guide-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .topic {
    padding: 14px 16px;
  }
}
</style>
