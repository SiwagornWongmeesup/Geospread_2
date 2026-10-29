<template>
  <section class="help-requests" aria-labelledby="help-requests-heading">
    <header class="help-requests__header">
      <h2 id="help-requests-heading">{{ title }}</h2>
      <NuxtLink to="/help-requests">ดูทั้งหมด</NuxtLink>
    </header>

    <p v-if="!requests.length" class="help-requests__empty">
      ยังไม่มีคำขอความช่วยเหลือที่เปิดอยู่ในตอนนี้
    </p>

    <div v-else class="help-requests__list">
      <article v-for="request in requests" :key="request.id" class="help-request-card">
        <img class="help-request-card__icon" :src="request.iconUrl || '/icons/Life-saving.svg'" alt="" aria-hidden="true" />
        <div class="help-request-card__content">
          <h3>{{ request.title }}</h3>
          <p>{{ request.distanceFromUserLabel || request.areaLabel }} · {{ request.time }}</p>
          <small>{{ request.description || `${request.peopleCount} คนต้องการความช่วยเหลือ` }}</small>
          <NuxtLink to="/help-requests">ดูรายละเอียด</NuxtLink>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'คำขอความช่วยเหลือใกล้ฉัน',
  },
})

const { helpRequestCards: requests, publicMapItems, isLoadingMap, fetchPublicMapItems } = useHomeDashboard()

// หน้า /help-requests ใช้คอมโพเนนต์นี้เดี่ยวๆ จึงต้องโหลดข้อมูลเองถ้ายังไม่มี
onMounted(() => {
  if (!publicMapItems.value.length && !isLoadingMap.value) void fetchPublicMapItems()
})
</script>

<style scoped>
.help-requests {
  padding: 1.1rem 1.25rem 1.25rem;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
}

.help-requests__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.help-requests h2 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 1.05rem;
  font-weight: 700;
}

.help-requests__header a {
  color: var(--gs-action);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: var(--gs-line-strong);
  text-underline-offset: 0.2em;
}

.help-requests__header a:hover {
  text-decoration-color: currentColor;
}

.help-requests__empty {
  margin: 0.5rem 0 0;
  color: var(--gs-muted);
  font-size: 0.875rem;
}

.help-requests__list {
  display: grid;
}

.help-request-card {
  display: grid;
  grid-template-columns: 2.25rem minmax(0, 1fr);
  gap: 0.75rem;
  padding: 0.85rem 0;
}

.help-request-card + .help-request-card {
  border-top: 1px solid var(--gs-line);
}

.help-request-card__icon {
  width: 2.25rem;
  height: 2.25rem;
  padding: 0.45rem;
  box-sizing: border-box;
  border-radius: 50%;
  background: var(--gs-help-tint);
}

.help-request-card__content {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr) auto;
  column-gap: 0.75rem;
  align-items: start;
}

.help-request-card h3 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.4;
}

.help-request-card p {
  grid-column: 1;
  margin: 0.15rem 0 0.25rem;
  color: var(--gs-muted);
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}

.help-request-card small {
  display: -webkit-box;
  grid-column: 1;
  overflow: hidden;
  color: var(--gs-ink-2);
  font-size: 0.85rem;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.help-request-card a {
  grid-column: 2;
  grid-row: 1 / span 3;
  align-self: center;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--gs-help);
  border-radius: var(--gs-radius-sm);
  color: var(--gs-help);
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.help-request-card a:hover {
  background: var(--gs-help-tint);
}

.help-request-card a:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}
</style>
