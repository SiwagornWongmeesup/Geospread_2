<template>
  <!-- เมนูรวมของหน้าโปรไฟล์บนมือถือ: เมนูจาก sidebar ที่ไม่มีในแถบล่าง + ภาษา + ออกจากระบบ -->
  <div class="profile-menu">
    <section v-for="group in menuGroups" :key="group.label" class="profile-menu__group">
      <h2 class="profile-menu__title">{{ t(group.label) }}</h2>
      <ul class="profile-menu__list">
        <li v-for="item in group.items" :key="item.to">
          <NuxtLink :to="item.to" class="profile-menu__row">
            <span class="profile-menu__icon" aria-hidden="true"><img :src="item.icon" alt="" /></span>
            <span class="profile-menu__label">{{ t(item.label) }}</span>
            <svg class="profile-menu__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section class="profile-menu__group">
      <h2 class="profile-menu__title">{{ t('profilePage.preferences') }}</h2>
      <ul class="profile-menu__list">
        <li v-for="item in settingsItems" :key="item.to">
          <NuxtLink :to="item.to" class="profile-menu__row">
            <span class="profile-menu__icon" aria-hidden="true"><img :src="item.icon" alt="" /></span>
            <span class="profile-menu__label">{{ t(item.label) }}</span>
            <svg class="profile-menu__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
          </NuxtLink>
        </li>
        <li>
          <div class="profile-menu__row profile-menu__row--static">
            <span class="profile-menu__icon" aria-hidden="true"><img src="/icons/Internet.svg" alt="" /></span>
            <span class="profile-menu__label">{{ t('profilePage.language') }}</span>
            <AuthLanguageSwitch />
          </div>
        </li>
      </ul>
    </section>

    <button v-if="isLoggedIn" type="button" class="profile-menu__logout" @click="$emit('logout')">
      {{ t('header.logout') }}
    </button>
  </div>
</template>

<script setup>
import AuthLanguageSwitch from '~/components/auth/AuthLanguageSwitch.vue'
import { getMobileProfileMenu, getMobileSettingsItems } from '~/utils/navMenu'

defineProps({
  isLoggedIn: { type: Boolean, default: false },
})

defineEmits(['logout'])

const { t } = useLocale()
const menuGroups = getMobileProfileMenu()
const settingsItems = getMobileSettingsItems()

</script>

<style scoped>
.profile-menu {
  display: grid;
  gap: 18px;
}

.profile-menu__title {
  margin: 0 0 8px 4px;
  color: #52708b;
  font-size: 13px;
  font-weight: 750;
}

.profile-menu__list {
  overflow: hidden;
  margin: 0;
  padding: 0;
  border: 1px solid #dce5f2;
  border-radius: 14px;
  background: #fff;
  list-style: none;
}

.profile-menu__list > li + li,
.profile-menu__list > li + li .profile-menu__row {
  border-top: 1px solid #edf2f8;
}

.profile-menu__row {
  display: grid;
  min-height: 56px;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  color: #102968;
  text-decoration: none;
}

.profile-menu__row:active {
  background: #f3f7fc;
}

.profile-menu__row--static:active {
  background: transparent;
}

.profile-menu__row:focus-visible {
  outline: 3px solid rgb(11 95 204 / 40%);
  outline-offset: -3px;
}

.profile-menu__icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 10px;
  background: #eef4fb;
}

.profile-menu__icon img {
  width: 20px;
  height: 20px;
}

.profile-menu__label {
  font-size: 15px;
  font-weight: 700;
}

.profile-menu__chevron {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: #7d93ad;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.profile-menu__logout {
  min-height: 52px;
  border: 1px solid #f2c4c6;
  border-radius: 14px;
  background: #fff;
  color: #be2631;
  font: inherit;
  font-size: 15px;
  font-weight: 750;
  cursor: pointer;
}

.profile-menu__logout:focus-visible {
  outline: 3px solid rgb(190 38 49 / 35%);
  outline-offset: 2px;
}
</style>
