<script setup>
// หน้าการแจ้งเตือนของแอดมิน: เขียนประกาศ + ประวัติการส่ง (หน้าตัวอย่าง: ยังไม่ส่งจริง)
import AdminMockNotice from '~/components/admin/mock/AdminMockNotice.vue'
import AdminPanel from '~/components/admin/mock/AdminPanel.vue'
import { mockNotifications } from '~/data/adminMockData'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const { t, tm, locale } = useLocale()
const actionMessage = ref('')

const audiences = ['all', 'area', 'followers']
const form = reactive({ title: '', message: '', audience: 'area' })

const history = computed(() => {
  const texts = tm('adminMock.notifications.rows')
  let numberLocale = 'th-TH'
  if (locale.value === 'en') {
    numberLocale = 'en-GB'
  }
  return mockNotifications.map((item) => {
    const text = texts[item.index]
    const reach = new Intl.NumberFormat(numberLocale).format(item.reach)
    return { ...item, title: text.title, sent: text.sent, reach }
  })
})

// กดส่ง: ยังเป็นตัวอย่าง แจ้งว่ายังไม่ได้ส่งจริง
const submit = () => {
  actionMessage.value = t('adminMock.actionNotice', { action: t('adminMock.notifications.send') })
}
</script>

<template>
  <div class="mock-page">
    <p class="mock-page__intro">{{ t('adminMock.notifications.intro') }}</p>
    <AdminMockNotice :message="actionMessage" @close="actionMessage = ''" />

    <div class="notify-grid">
      <AdminPanel :title="t('adminMock.notifications.composeTitle')">
        <form class="compose" @submit.prevent="submit">
          <label class="field">
            <span>{{ t('adminMock.notifications.titleLabel') }}</span>
            <input v-model.trim="form.title" type="text" :placeholder="t('adminMock.notifications.titlePlaceholder')" required>
          </label>
          <label class="field">
            <span>{{ t('adminMock.notifications.messageLabel') }}</span>
            <textarea v-model.trim="form.message" rows="4" :placeholder="t('adminMock.notifications.messagePlaceholder')" required></textarea>
          </label>
          <fieldset class="field">
            <legend>{{ t('adminMock.notifications.audienceLabel') }}</legend>
            <label v-for="audience in audiences" :key="audience" class="radio">
              <input v-model="form.audience" type="radio" name="audience" :value="audience">
              <span>{{ t(`adminMock.notifications.audience.${audience}`) }}</span>
            </label>
          </fieldset>
          <button type="submit" class="admin-button admin-button--primary">{{ t('adminMock.notifications.send') }}</button>
        </form>
      </AdminPanel>

      <AdminPanel :title="t('adminMock.notifications.historyTitle')" flush>
        <table class="admin-table">
          <thead>
            <tr>
              <th scope="col">{{ t('adminMock.th.title') }}</th>
              <th scope="col">{{ t('adminMock.th.audience') }}</th>
              <th scope="col">{{ t('adminMock.th.reach') }}</th>
              <th scope="col">{{ t('adminMock.th.sent') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in history" :key="item.id">
              <td><strong>{{ item.title }}</strong></td>
              <td class="admin-muted">{{ t(`adminMock.notifications.audience.${item.audience}`) }}</td>
              <td class="nowrap">{{ t('adminMock.notifications.people', { count: item.reach }) }}</td>
              <td class="admin-muted nowrap">{{ item.sent }}</td>
            </tr>
          </tbody>
        </table>
      </AdminPanel>
    </div>
  </div>
</template>

<style scoped>
.mock-page {
  display: grid;
  gap: 16px;
  color: var(--gs-ink);
}

.mock-page__intro {
  margin: 0;
  color: var(--gs-ink-2);
  font-size: 15px;
}

.notify-grid {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(0, 1.4fr);
  align-items: start;
  gap: 16px;
}

.compose {
  display: grid;
  gap: 16px;
}

.field {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  border: 0;
}

.field > span,
.field legend {
  padding: 0;
  color: var(--gs-ink-2);
  font-size: 14px;
  font-weight: 700;
}

.field input[type='text'],
.field textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface);
  color: var(--gs-ink);
  font: inherit;
  font-size: 15px;
  resize: vertical;
}

.field input[type='text'] {
  min-height: 44px;
}

.field input:focus,
.field textarea:focus {
  border-color: var(--gs-action);
  outline: none;
  box-shadow: var(--gs-focus);
}

.radio {
  display: flex;
  min-height: 40px;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  cursor: pointer;
}

.radio input {
  width: 18px;
  height: 18px;
  accent-color: var(--gs-action);
}

.compose .admin-button {
  justify-self: start;
  min-height: 44px;
}

.nowrap {
  white-space: nowrap;
}

@media (max-width: 1100px) {
  .notify-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
