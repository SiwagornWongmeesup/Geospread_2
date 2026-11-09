<script setup>
// หน้ากิจกรรมชุมชนของแอดมิน (หน้าตัวอย่าง: ข้อมูลจำลองจาก data/adminMockData.js)
import AdminMockNotice from '~/components/admin/mock/AdminMockNotice.vue'
import AdminPanel from '~/components/admin/mock/AdminPanel.vue'
import { mockEvents } from '~/data/adminMockData'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const { t, tm } = useLocale()
const actionMessage = ref('')

const events = computed(() => {
  const texts = tm('adminMock.events.rows')
  return mockEvents.map((event) => {
    const text = texts[event.index]
    // เปอร์เซ็นต์ที่นั่งที่มีคนลงชื่อแล้ว ใช้วาดแถบ
    const fillPercent = Math.round((event.joined / event.capacity) * 100)
    return { ...event, title: text.title, date: text.date, place: text.place, fillPercent }
  })
})

const pillTone = (status) => {
  if (status === 'upcoming') {
    return 'active'
  }
  if (status === 'ongoing') {
    return 'waiting'
  }
  return 'done'
}

const runAction = (action) => {
  actionMessage.value = t('adminMock.actionNotice', { action })
}
</script>

<template>
  <div class="mock-page">
    <p class="mock-page__intro">{{ t('adminMock.events.intro') }}</p>
    <AdminMockNotice :message="actionMessage" @close="actionMessage = ''" />

    <AdminPanel :title="t('admin.menu.events')" flush>
      <template #actions>
        <button type="button" class="admin-button admin-button--primary" @click="runAction(t('adminMock.events.create'))">
          {{ t('adminMock.events.create') }}
        </button>
      </template>

      <table class="admin-table">
        <thead>
          <tr>
            <th scope="col">{{ t('adminMock.th.event') }}</th>
            <th scope="col">{{ t('adminMock.th.date') }}</th>
            <th scope="col">{{ t('adminMock.th.place') }}</th>
            <th scope="col">{{ t('adminMock.th.joined') }}</th>
            <th scope="col">{{ t('adminMock.th.status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in events" :key="event.id">
            <td><strong>{{ event.title }}</strong></td>
            <td class="admin-muted nowrap">{{ event.date }}</td>
            <td class="admin-muted">{{ event.place }}</td>
            <td>
              <div class="capacity">
                <span class="nowrap">{{ event.joined }} / {{ event.capacity }}</span>
                <span class="capacity__bar" aria-hidden="true"><span :style="{ width: `${event.fillPercent}%` }"></span></span>
              </div>
            </td>
            <td><span class="admin-pill" :class="`admin-pill--${pillTone(event.status)}`">{{ t(`adminMock.events.status.${event.status}`) }}</span></td>
          </tr>
        </tbody>
      </table>
    </AdminPanel>
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

.capacity {
  display: grid;
  gap: 6px;
  min-width: 120px;
  font-variant-numeric: tabular-nums;
}

.capacity__bar {
  display: block;
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--gs-surface-sunken);
}

.capacity__bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--gs-help);
}

.nowrap {
  white-space: nowrap;
}
</style>
