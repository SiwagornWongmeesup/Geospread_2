<script setup>
// ---------------------------------------------------------------------------
// Settings Page
// คอม: เมนูหมวดด้านซ้าย (กดแล้วเลื่อนไปหมวดนั้น) + การ์ดการตั้งค่าด้านขวา
// มือถือ: การ์ดเรียงลงมา ไม่มีเมนูหมวด
// การตั้งค่าตอนนี้เป็นข้อมูลจำลอง (ดู composables/useSettings.js) ส่วนภาษาใช้ของจริงจาก useLocale
// ---------------------------------------------------------------------------
import SettingRow from '~/components/settings/SettingRow.vue'
import { radiusOptions } from '~/composables/useSettings'

definePageMeta({
  showRightPanel: false
})

const { t, locale, locales, setLocale } = useLocale()
const { isMobile } = useResponsiveView()
const { isLoggedIn, logout } = useAuth()
const { settings, loadSettings, updateSetting } = useSettings()

useHead({ title: () => `${t('nav.settings')} | GeoSpread` })

onMounted(loadSettings)

const sections = ['account', 'notifications', 'display', 'privacy']
const activeSection = ref('account')

const goToSection = (id) => {
  activeSection.value = id
  document.getElementById(`settings-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// แจ้งสั้นๆ ว่าบันทึกแล้ว (ประกาศให้ screen reader ด้วย)
const savedNotice = ref('')
let noticeTimer = null
const change = (key, value) => {
  updateSetting(key, value)
  savedNotice.value = t('settingsPage.savedNotice')
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => { savedNotice.value = '' }, 2000)
}
onBeforeUnmount(() => clearTimeout(noticeTimer))

const radiusLabel = (meters) => t('units.kilometers', { value: meters / 1000 })

const confirmLogout = () => {
  if (confirm(t('header.logoutConfirm'))) logout()
}
</script>

<template>
  <section class="settings-page" :class="{ 'settings-page--mobile': isMobile }">
    <header class="settings-page__head">
      <h1>{{ t('nav.settings') }}</h1>
      <p>{{ t('settingsPage.intro') }}</p>
    </header>

    <div v-if="!isLoggedIn" class="settings-card settings-guest">
      <strong>{{ t('settingsPage.guestTitle') }}</strong>
      <div class="settings-guest__actions">
        <NuxtLink to="/login" class="settings-button settings-button--primary">{{ t('header.login') }}</NuxtLink>
        <NuxtLink to="/register" class="settings-button">{{ t('header.register') }}</NuxtLink>
      </div>
    </div>

    <div v-else class="settings-layout">
      <!-- เมนูหมวด (เฉพาะจอคอม) -->
      <nav class="settings-nav" :aria-label="t('settingsPage.sectionsLabel')">
        <button
          v-for="id in sections"
          :key="id"
          type="button"
          class="settings-nav__item"
          :class="{ 'settings-nav__item--active': activeSection === id }"
          @click="goToSection(id)"
        >
          {{ t(`settingsPage.sections.${id}`) }}
        </button>
      </nav>

      <div class="settings-content">
        <p class="settings-page__notice">{{ t('settingsPage.mockNotice') }}</p>

        <!-- บัญชี -->
        <section :id="'settings-account'" class="settings-card" aria-labelledby="settings-account-title">
          <h2 id="settings-account-title">{{ t('settingsPage.sections.account') }}</h2>
          <NuxtLink to="/profile" class="settings-link">
            <SettingRow :label="t('settingsPage.account.profile')" :hint="t('settingsPage.account.profileHint')">
              <svg class="settings-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
            </SettingRow>
          </NuxtLink>
          <NuxtLink to="/forgot-password" class="settings-link">
            <SettingRow :label="t('settingsPage.account.password')" :hint="t('settingsPage.account.passwordHint')">
              <svg class="settings-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
            </SettingRow>
          </NuxtLink>
          <SettingRow :label="t('settingsPage.account.logout')" :hint="t('settingsPage.account.logoutHint')">
            <button type="button" class="settings-button" @click="confirmLogout">{{ t('settingsPage.account.logout') }}</button>
          </SettingRow>
          <SettingRow :label="t('settingsPage.account.delete')" :hint="t('settingsPage.account.deleteHint')" disabled>
            <button type="button" class="settings-button settings-button--danger" disabled>{{ t('settingsPage.account.delete') }}</button>
          </SettingRow>
        </section>

        <!-- การแจ้งเตือน -->
        <section id="settings-notifications" class="settings-card" aria-labelledby="settings-notifications-title">
          <h2 id="settings-notifications-title">{{ t('settingsPage.sections.notifications') }}</h2>
          <SettingRow
            :label="t('settingsPage.notifications.nearby')"
            :hint="t('settingsPage.notifications.nearbyHint')"
            :toggle="settings.notifyNearbyIncidents"
            @update:toggle="change('notifyNearbyIncidents', $event)"
          />
          <SettingRow
            :label="t('settingsPage.notifications.help')"
            :hint="t('settingsPage.notifications.helpHint')"
            :toggle="settings.notifyHelpRequests"
            @update:toggle="change('notifyHelpRequests', $event)"
          />
          <SettingRow
            v-slot="{ labelId }"
            :label="t('settingsPage.notifications.radius')"
            :hint="t('settingsPage.notifications.radiusHint')"
            :disabled="!settings.notifyNearbyIncidents && !settings.notifyHelpRequests"
          >
            <div class="segmented" role="radiogroup" :aria-labelledby="labelId">
              <button
                v-for="meters in radiusOptions"
                :key="meters"
                type="button"
                role="radio"
                class="segmented__option"
                :aria-checked="settings.notifyRadius === meters"
                :disabled="!settings.notifyNearbyIncidents && !settings.notifyHelpRequests"
                @click="change('notifyRadius', meters)"
              >
                {{ radiusLabel(meters) }}
              </button>
            </div>
          </SettingRow>
          <SettingRow
            :label="t('settingsPage.notifications.reports')"
            :hint="t('settingsPage.notifications.reportsHint')"
            :toggle="settings.notifyReportUpdates"
            @update:toggle="change('notifyReportUpdates', $event)"
          />
          <SettingRow
            :label="t('settingsPage.notifications.email')"
            :hint="t('settingsPage.notifications.emailHint')"
            :toggle="settings.notifyEmail"
            @update:toggle="change('notifyEmail', $event)"
          />
        </section>

        <!-- การแสดงผล -->
        <section id="settings-display" class="settings-card" aria-labelledby="settings-display-title">
          <h2 id="settings-display-title">{{ t('settingsPage.sections.display') }}</h2>
          <SettingRow v-slot="{ labelId }" :label="t('settingsPage.display.language')" :hint="t('settingsPage.display.languageHint')">
            <div class="segmented" role="radiogroup" :aria-labelledby="labelId">
              <button
                v-for="option in locales"
                :key="option.code"
                type="button"
                role="radio"
                class="segmented__option"
                :lang="option.code"
                :aria-checked="locale === option.code"
                @click="setLocale(option.code)"
              >
                {{ option.label }}
              </button>
            </div>
          </SettingRow>
        </section>

        <!-- ความเป็นส่วนตัว -->
        <section id="settings-privacy" class="settings-card" aria-labelledby="settings-privacy-title">
          <h2 id="settings-privacy-title">{{ t('settingsPage.sections.privacy') }}</h2>
          <SettingRow
            :label="t('settingsPage.privacy.showName')"
            :hint="t('settingsPage.privacy.showNameHint')"
            :toggle="settings.showNameOnReports"
            @update:toggle="change('showNameOnReports', $event)"
          />
          <SettingRow
            :label="t('settingsPage.privacy.location')"
            :hint="t('settingsPage.privacy.locationHint')"
            :toggle="settings.shareLocation"
            @update:toggle="change('shareLocation', $event)"
          />
        </section>
      </div>
    </div>

    <p class="settings-toast" role="status" aria-live="polite">
      <span v-if="savedNotice">{{ savedNotice }}</span>
    </p>
  </section>
</template>

<style scoped>
.settings-page {
  display: grid;
  /* ใช้เต็มความกว้างของพื้นที่เนื้อหา ไม่ให้เหลือที่ว่างบนจอคอม */
  gap: 16px;
  padding: 0 16px 32px;
}

.settings-page--mobile {
  max-width: none;
  /* layout มือถือไม่เลื่อนให้ (overflow: hidden) หน้านี้จึงเลื่อนเอง */
  height: 100%;
  overflow-y: auto;
  align-content: start;
  padding: 16px;
}

.settings-page__head h1 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 24px;
  font-weight: 800;
}

.settings-page__head p {
  margin: 4px 0 0;
  color: var(--gs-muted);
  font-size: 14px;
}

.settings-page__notice {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid #ecd9b0;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-pending-tint);
  color: var(--gs-pending);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
}

/* คอม: เมนูหมวดซ้าย + เนื้อหาขวา */
.settings-layout {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  align-items: start;
  gap: 24px;
}

.settings-nav {
  position: sticky;
  top: 0;
  display: grid;
  gap: 4px;
}

.settings-nav__item {
  min-height: 42px;
  padding: 8px 12px;
  border: 0;
  border-radius: var(--gs-radius-sm);
  background: transparent;
  color: var(--gs-ink-2);
  font-size: 14px;
  font-weight: 650;
  text-align: left;
  cursor: pointer;
}

.settings-nav__item:hover {
  background: var(--gs-action-tint);
  color: var(--gs-action);
}

.settings-nav__item--active,
.settings-nav__item--active:hover {
  background: var(--gs-action);
  color: #fff;
}

.settings-nav__item:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

.settings-content {
  display: grid;
  align-items: start;
  gap: 16px;
  min-width: 0;
}

/* จอกว้างมาก: การ์ดวาง 2 คอลัมน์ ไม่ให้เหลือพื้นที่ว่างด้านขวา (แถบแจ้งข้อมูลจำลองกินเต็มแถว) */
@media (min-width: 1440px) {
  .settings-content {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .settings-page__notice {
    grid-column: 1 / -1;
  }
}

.settings-card {
  padding: 8px 20px 8px;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
  scroll-margin-top: 12px;
}

.settings-card h2 {
  margin: 12px 0 4px;
  color: var(--gs-ink);
  font-size: 17px;
  font-weight: 800;
}

/* แถวที่เป็นลิงก์ทั้งแถว */
.settings-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.settings-link:hover :deep(.setting-row__label) {
  color: var(--gs-action);
}

.settings-link:focus-visible {
  border-radius: var(--gs-radius-sm);
  outline: none;
  box-shadow: var(--gs-focus);
}

.settings-chevron {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  fill: none;
  stroke: var(--gs-muted);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

/* ตัวเลือกแบบปุ่มติดกัน (รัศมี, ภาษา) */
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
  min-width: 52px;
  height: 32px;
  padding: 0 10px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--gs-muted);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.segmented__option:hover:not(:disabled) {
  color: var(--gs-ink);
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

.segmented__option:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.settings-button {
  display: inline-flex;
  flex: 0 0 auto;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface);
  color: var(--gs-ink-2);
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.settings-button:hover:not(:disabled) {
  background: var(--gs-surface-sunken);
}

.settings-button--primary {
  border-color: var(--gs-action);
  background: var(--gs-action);
  color: #fff;
}

.settings-button--primary:hover {
  background: var(--gs-action-hover);
}

.settings-button--danger {
  border-color: #efc2c0;
  color: var(--gs-danger);
}

.settings-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.settings-button:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

.settings-guest {
  display: grid;
  gap: 12px;
  padding: 20px;
  color: var(--gs-ink);
}

.settings-guest__actions {
  display: flex;
  gap: 10px;
}

/* แจ้งว่าบันทึกแล้ว ลอยมุมล่าง */
.settings-toast {
  position: fixed;
  z-index: 300;
  right: 24px;
  bottom: 24px;
  margin: 0;
}

.settings-toast span {
  display: block;
  padding: 10px 14px;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-ink);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 8px 20px rgb(23 32 46 / 20%);
}

/* จอแคบ: ไม่มีเมนูหมวด การ์ดเรียงลงมา ตัวควบคุมลงไปอยู่ใต้ข้อความ */
@media (max-width: 928px) {
  .settings-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .settings-nav {
    display: none;
  }
}

@media (max-width: 560px) {
  .settings-card {
    padding: 4px 16px;
  }

  .settings-card :deep(.setting-row:has(.segmented)) {
    flex-direction: column;
    align-items: stretch;
  }

  .settings-toast {
    right: 16px;
    bottom: calc(86px + env(safe-area-inset-bottom));
    left: 16px;
  }
}
</style>
