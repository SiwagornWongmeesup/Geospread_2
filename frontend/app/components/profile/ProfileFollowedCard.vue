<template>
  <!-- พื้นที่ที่ติดตาม: สรุปแต่ละพื้นที่ (รัศมี เหตุการณ์ตอนนี้ การแจ้งเตือน) + ลิงก์ไปจัดการ (ข้อมูลจำลอง) -->
  <section class="followed-card" :aria-labelledby="titleId">
    <div class="followed-card__head">
      <h2 :id="titleId">{{ t('profilePage.followedTitle') }}</h2>
      <NuxtLink to="/followed-locations">{{ t('profilePage.manageFollowed') }}</NuxtLink>
    </div>

    <ul class="followed-list">
      <li v-for="location in locations" :key="location.id" class="followed-item">
        <span class="followed-item__icon" aria-hidden="true"><img src="/icons/Location.svg" alt="" /></span>
        <span class="followed-item__text">
          <strong>{{ location.name }}</strong>
          <span>{{ location.area }} · {{ t('profilePage.followedRadius', { value: location.radiusKm }) }}</span>
        </span>
        <span class="followed-item__meta">
          <span :class="{ 'followed-item__incidents--active': location.incidentCount > 0 }">
            {{ incidentLabel(location) }}
          </span>
          <span class="followed-item__notify" :class="{ 'followed-item__notify--off': !location.notify }">
            {{ notifyLabel(location) }}
          </span>
        </span>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { mockFollowedLocations } from '~/composables/useProfile'

const { t, tm } = useLocale()
const titleId = useId()

// รวมข้อมูลพื้นที่กับชื่อพื้นที่ตามภาษาที่เลือก
const locations = computed(() => {
  const texts = tm('profilePage.mockFollowed')
  return mockFollowedLocations.map((location) => {
    const text = texts[location.index]
    return { ...location, name: text.name, area: text.area }
  })
})

// ข้อความจำนวนเหตุการณ์ในพื้นที่ตอนนี้
const incidentLabel = (location) => {
  if (location.incidentCount > 0) {
    return t('profilePage.followedIncidents', { count: location.incidentCount })
  }
  return t('profilePage.followedNoIncidents')
}

// ข้อความสถานะการแจ้งเตือนของพื้นที่
const notifyLabel = (location) => {
  if (location.notify) {
    return t('profilePage.notifyOn')
  }
  return t('profilePage.notifyOff')
}
</script>

<style scoped>
.followed-card {
  display: grid;
  gap: 8px;
  padding: 20px;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
}

.followed-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.followed-card__head h2 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 17px;
  font-weight: 800;
}

.followed-card__head a {
  color: var(--gs-action);
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.followed-card__head a:hover {
  text-decoration: underline;
}

/* จอกว้าง: พื้นที่เรียงเป็นช่องข้างกัน / จอแคบ: เรียงลงมา */
.followed-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.followed-item {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 10px 12px;
  padding: 14px;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface-sunken);
}

.followed-item__icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 50%;
  background: var(--gs-action-tint);
}

.followed-item__icon img {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.followed-item__text {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.followed-item__text strong {
  color: var(--gs-ink);
  font-size: 15px;
  font-weight: 750;
  line-height: 1.45;
}

.followed-item__text span {
  overflow: hidden;
  color: var(--gs-muted);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.followed-item__meta {
  display: flex;
  flex-wrap: wrap;
  grid-column: 1 / -1;
  align-items: center;
  justify-content: space-between;
  gap: 6px 12px;
  color: var(--gs-muted);
  font-size: 13px;
  font-weight: 600;
}

.followed-item__meta .followed-item__incidents--active {
  color: var(--gs-danger);
  font-weight: 700;
}

.followed-item__notify {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--gs-help-tint);
  color: var(--gs-help);
}

.followed-item__notify--off {
  background: var(--gs-surface);
  color: var(--gs-muted);
  box-shadow: inset 0 0 0 1px var(--gs-line);
}
</style>
