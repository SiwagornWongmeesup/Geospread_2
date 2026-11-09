<script setup>
// หน้าตั้งค่าระบบของแอดมิน (หน้าตัวอย่าง: เปลี่ยนค่าได้บนหน้า แต่ยังไม่บันทึกลงระบบ)
import AdminMockNotice from '~/components/admin/mock/AdminMockNotice.vue'
import AdminPanel from '~/components/admin/mock/AdminPanel.vue'
import SettingRow from '~/components/settings/SettingRow.vue'
import { mockSystemSettings } from '~/data/adminMockData'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const { t } = useLocale()

// ค่าบนหน้านี้อยู่แค่ในหน่วยความจำ รีเฟรชแล้วกลับเป็นค่าเริ่มต้น
const settings = reactive({ ...mockSystemSettings })

const reportLimitOptions = [3, 5, 10]
const reportExpireOptions = [12, 24, 48]
const matchDistanceOptions = [100, 300, 500]
const helpExpireOptions = [12, 24, 48]
</script>

<template>
  <div class="mock-page">
    <p class="mock-page__intro">{{ t('adminMock.settings.intro') }}</p>
    <AdminMockNotice />

    <div class="settings-grid">
      <AdminPanel :title="t('adminMock.settings.reportsTitle')">
        <SettingRow
          :label="t('adminMock.settings.requireVerified')"
          :hint="t('adminMock.settings.requireVerifiedHint')"
          :toggle="settings.requireVerifiedEmail"
          @update:toggle="settings.requireVerifiedEmail = $event"
        />
        <SettingRow v-slot="{ labelId }" :label="t('adminMock.settings.reportLimit')">
          <div class="segmented" role="radiogroup" :aria-labelledby="labelId">
            <button
              v-for="value in reportLimitOptions"
              :key="value"
              type="button"
              role="radio"
              class="segmented__option"
              :aria-checked="settings.reportLimitPerHour === value"
              @click="settings.reportLimitPerHour = value"
            >
              {{ t('adminMock.settings.perHour', { value }) }}
            </button>
          </div>
        </SettingRow>
        <SettingRow v-slot="{ labelId }" :label="t('adminMock.settings.expireHours')">
          <div class="segmented" role="radiogroup" :aria-labelledby="labelId">
            <button
              v-for="value in reportExpireOptions"
              :key="value"
              type="button"
              role="radio"
              class="segmented__option"
              :aria-checked="settings.reportExpireHours === value"
              @click="settings.reportExpireHours = value"
            >
              {{ t('adminMock.settings.hours', { value }) }}
            </button>
          </div>
        </SettingRow>
      </AdminPanel>

      <div class="settings-stack">
        <AdminPanel :title="t('adminMock.settings.matchingTitle')">
          <SettingRow v-slot="{ labelId }" :label="t('adminMock.settings.matchDistance')" :hint="t('adminMock.settings.matchDistanceHint')">
            <div class="segmented" role="radiogroup" :aria-labelledby="labelId">
              <button
                v-for="value in matchDistanceOptions"
                :key="value"
                type="button"
                role="radio"
                class="segmented__option"
                :aria-checked="settings.matchDistanceMeters === value"
                @click="settings.matchDistanceMeters = value"
              >
                {{ t('adminMock.settings.meters', { value }) }}
              </button>
            </div>
          </SettingRow>
        </AdminPanel>

        <AdminPanel :title="t('adminMock.settings.helpTitle')">
          <SettingRow v-slot="{ labelId }" :label="t('adminMock.settings.helpExpire')">
            <div class="segmented" role="radiogroup" :aria-labelledby="labelId">
              <button
                v-for="value in helpExpireOptions"
                :key="value"
                type="button"
                role="radio"
                class="segmented__option"
                :aria-checked="settings.helpExpireHours === value"
                @click="settings.helpExpireHours = value"
              >
                {{ t('adminMock.settings.hours', { value }) }}
              </button>
            </div>
          </SettingRow>
        </AdminPanel>
      </div>
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

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 16px;
}

.settings-stack {
  display: grid;
  gap: 16px;
}

/* ตัวเลือกแบบปุ่มติดกัน (แบบเดียวกับหน้าตั้งค่าของผู้ใช้) */
.segmented {
  display: inline-flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 2px;
  padding: 3px;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface-sunken);
  box-shadow: inset 0 0 0 1px var(--gs-line);
}

.segmented__option {
  min-width: 56px;
  height: 36px;
  padding: 0 10px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--gs-ink-2);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.segmented__option[aria-checked='true'] {
  background: var(--gs-surface);
  color: var(--gs-ink);
  box-shadow: 0 1px 2px rgb(23 32 46 / 12%), inset 0 0 0 1px var(--gs-line);
}

.segmented__option:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

@media (max-width: 1100px) {
  .settings-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 560px) {
  .mock-page :deep(.setting-row:has(.segmented)) {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
