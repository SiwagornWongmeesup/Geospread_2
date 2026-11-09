<template>
  <!-- พื้นที่ที่ติดตาม: ระบบยังไม่มีข้อมูลพื้นที่ที่ติดตามจริง จึงแสดงสถานะว่างพร้อมทางไปเพิ่มพื้นที่
       (ไม่แสดงรายการตัวอย่าง เพราะจะทำให้ผู้ใช้เข้าใจผิดว่าเป็นพื้นที่ของตัวเอง) -->
  <section class="followed-card" :aria-labelledby="titleId">
    <span class="followed-card__icon" aria-hidden="true"><img src="/icons/Location.svg" alt="" /></span>
    <div class="followed-card__text">
      <h2 :id="titleId">{{ t('profilePage.followedTitle') }}</h2>
      <strong>{{ t('profilePage.followedEmpty') }}</strong>
      <p>{{ t('profilePage.followedEmptyHint') }}</p>
    </div>
    <NuxtLink to="/followed-locations" class="followed-card__action">{{ t('profilePage.addFollowed') }}</NuxtLink>
  </section>
</template>

<script setup>
const { t } = useLocale()
const titleId = useId()
</script>

<style scoped>
.followed-card {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  align-content: start;
  align-items: start;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
}

.followed-card__icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 50%;
  background: var(--gs-action-tint);
}

.followed-card__icon img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.followed-card__text {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.followed-card h2 {
  margin: 0 0 4px;
  color: var(--gs-ink);
  font-size: 18px;
  font-weight: 800;
}

.followed-card strong {
  color: var(--gs-ink);
  font-size: 15px;
  font-weight: 700;
}

.followed-card p {
  margin: 0;
  color: var(--gs-ink-2);
  font-size: 14px;
  line-height: 1.5;
}

.followed-card__action {
  grid-column: 2;
  justify-self: start;
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  padding: 0 16px;
  border: 1px solid var(--gs-action);
  border-radius: var(--gs-radius-sm);
  color: var(--gs-action);
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.followed-card__action:hover {
  background: var(--gs-action-tint);
}

.followed-card__action:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

@media (max-width: 720px) {
  .followed-card {
    grid-template-columns: 48px minmax(0, 1fr);
  }

  .followed-card__action {
    grid-column: 1 / -1;
    justify-content: center;
  }
}
</style>
