<script setup>
// หน้าคำขอความช่วยเหลือของแอดมิน (หน้าตัวอย่าง: ข้อมูลจำลองจาก data/adminMockData.js)
import AdminMockNotice from '~/components/admin/mock/AdminMockNotice.vue'
import AdminPanel from '~/components/admin/mock/AdminPanel.vue'
import { mockHelpRequests } from '~/data/adminMockData'
import { getHelpRequestIcon, getHelpRequestLabel } from '~/composables/useHelpRequestIcon'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const { t, tm } = useLocale()
const filters = ['all', 'pending', 'in_progress', 'resolved']
const activeFilter = ref('all')
const actionMessage = ref('')

// รวมตัวเลข/สถานะกับข้อความตามภาษาที่เลือก
const requests = computed(() => {
  const texts = tm('adminMock.help.rows')
  return mockHelpRequests.map((request) => {
    const text = texts[request.index]
    return {
      ...request,
      title: getHelpRequestLabel(request.helpType, t),
      icon: getHelpRequestIcon(request.helpType),
      detail: text.detail,
      area: text.area,
      time: text.time,
    }
  })
})

const visibleRequests = computed(() => {
  if (activeFilter.value === 'all') {
    return requests.value
  }
  return requests.value.filter((request) => request.status === activeFilter.value)
})

// สถานะ → สีของป้าย
const pillTone = (status) => {
  if (status === 'pending') {
    return 'waiting'
  }
  if (status === 'in_progress') {
    return 'active'
  }
  return 'done'
}

const filterLabel = (filter) => {
  if (filter === 'all') {
    return t('adminMock.all')
  }
  return t(`adminMock.help.status.${filter}`)
}

const runAction = (action) => {
  actionMessage.value = t('adminMock.actionNotice', { action })
}
</script>

<template>
  <div class="mock-page">
    <p class="mock-page__intro">{{ t('adminMock.help.intro') }}</p>
    <AdminMockNotice :message="actionMessage" @close="actionMessage = ''" />

    <AdminPanel :title="t('admin.menu.requests')" flush>
      <template #actions>
        <div class="chips" role="group" :aria-label="t('adminMock.filterLabel')">
          <button
            v-for="filter in filters"
            :key="filter"
            type="button"
            class="chip"
            :aria-pressed="activeFilter === filter"
            @click="activeFilter = filter"
          >
            {{ filterLabel(filter) }}
          </button>
        </div>
      </template>

      <table class="admin-table">
        <thead>
          <tr>
            <th scope="col">{{ t('adminMock.th.request') }}</th>
            <th scope="col">{{ t('adminMock.th.people') }}</th>
            <th scope="col">{{ t('adminMock.th.area') }}</th>
            <th scope="col">{{ t('adminMock.th.status') }}</th>
            <th scope="col">{{ t('adminMock.th.time') }}</th>
            <th scope="col"><span class="sr-only">{{ t('usersTrust.th.actions') }}</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in visibleRequests" :key="request.id">
            <td>
              <div class="item">
                <img :src="request.icon" alt="" class="item__icon">
                <span class="item__text">
                  <strong>{{ request.title }}</strong>
                  <span>{{ request.detail }}</span>
                </span>
              </div>
            </td>
            <td>{{ request.people }}</td>
            <td class="admin-muted">{{ request.area }}</td>
            <td><span class="admin-pill" :class="`admin-pill--${pillTone(request.status)}`">{{ t(`adminMock.help.status.${request.status}`) }}</span></td>
            <td class="admin-muted nowrap">{{ request.time }}</td>
            <td>
              <button v-if="request.status === 'pending'" type="button" class="admin-button" @click="runAction(t('adminMock.help.assign'))">
                {{ t('adminMock.help.assign') }}
              </button>
            </td>
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

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid var(--gs-line-strong);
  border-radius: 999px;
  background: var(--gs-surface);
  color: var(--gs-ink-2);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.chip[aria-pressed='true'] {
  border-color: var(--gs-action);
  background: var(--gs-action);
  color: #fff;
}

.chip:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

.item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 260px;
}

.item__icon {
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  object-fit: contain;
}

.item__text {
  display: grid;
  gap: 2px;
}

.item__text strong {
  font-weight: 700;
}

.item__text span {
  color: var(--gs-ink-2);
}

.nowrap {
  white-space: nowrap;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
