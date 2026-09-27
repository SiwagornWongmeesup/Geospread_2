<template>
  <section class="nearby-incidents" aria-labelledby="nearby-incidents-heading">
    <div class="nearby-incidents__header">
      <div>
        <p class="nearby-incidents__eyebrow">ติดตามสถานการณ์รอบตัวคุณ</p>
        <h2 id="nearby-incidents-heading">{{ title }}</h2>
      </div>
      <NuxtLink v-if="viewAllTo" :to="viewAllTo" class="nearby-incidents__view-all">
        ดูทั้งหมด
      </NuxtLink>
    </div>

    <p v-if="isLoading" class="nearby-incidents__state">กำลังโหลดเหตุการณ์บนแผนที่...</p>
    <p v-else-if="errorMessage" class="nearby-incidents__state nearby-incidents__state--error">{{ errorMessage }}</p>
    <p v-else-if="!incidents.length" class="nearby-incidents__state">ยังไม่มีเหตุการณ์ที่แสดงบนแผนที่</p>

    <div v-else class="nearby-incidents__list">
      <button
        v-for="incident in incidents"
        :key="incident.id"
        type="button"
        class="incident-card"
        :class="{ 'incident-card--selected': selectedIncidentId === incident.id }"
        @click="$emit('select', incident)"
      >
        <div class="incident-card__visual" :class="`incident-card__visual--${incident.tone}`">
          <span class="incident-card__icon-wrap" aria-hidden="true">
            <img class="incident-card__icon" :src="incident.iconUrl || '/Alert.svg'" alt="">
          </span>
          <span class="incident-card__badge">{{ incident.category }}</span>
        </div>
        <div class="incident-card__body">
          <div class="incident-card__category" :class="`incident-card__category--${incident.tone}`">
            <span class="incident-card__dot" aria-hidden="true" />
            {{ incident.category }}
          </div>
          <h3>{{ incident.title }}</h3>
          <p>{{ incident.location }}</p>
          <div class="incident-card__meta">
            <span>{{ incident.distance }}</span>
            <span>{{ incident.time }}</span>
          </div>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'เหตุการณ์ใกล้คุณ',
  },
  viewAllTo: {
    type: String,
    default: '/incidents',
  },
  selectedIncidentId: {
    type: String,
    default: null,
  },
  incidents: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: null,
  },
})

defineEmits(['select'])
</script>

<style scoped>
.nearby-incidents {
  padding: 1rem;
  border: 1px solid #dfe8f4;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 4px 16px rgb(31 72 125 / 6%);
}

.nearby-incidents__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.875rem;
}

.nearby-incidents__eyebrow {
  margin: 0 0 0.2rem;
  color: #6c7c93;
  font-size: 0.72rem;
  font-weight: 600;
}

.nearby-incidents h2 {
  margin: 0;
  color: #102968;
  font-size: 1.05rem;
}

.nearby-incidents__view-all {
  color: #2563eb;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
}

.nearby-incidents__view-all:hover {
  text-decoration: underline;
}

.nearby-incidents__list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.nearby-incidents__state {
  margin: 0;
  padding: 0.9rem;
  border: 1px dashed #cdd9e8;
  border-radius: 0.75rem;
  background: #f8fbff;
  color: #5d6f89;
  font-size: 0.82rem;
  font-weight: 700;
}

.nearby-incidents__state--error {
  border-color: #fecaca;
  background: #fff7f7;
  color: #b91c1c;
}

.incident-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #e0e8f3;
  border-radius: 0.75rem;
  background: #fff;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.incident-card:hover,
.incident-card:focus-visible,
.incident-card--selected {
  border-color: #1976e9;
  box-shadow: 0 6px 18px rgb(19 104 204 / 16%);
  outline: none;
  transform: translateY(-2px);
}

.incident-card__visual {
  position: relative;
  height: 4.5rem;
  overflow: hidden;
}

.incident-card__visual::before,
.incident-card__visual::after {
  position: absolute;
  content: '';
  border-radius: 50%;
  opacity: 0.5;
}

.incident-card__visual::before {
  top: -2.4rem;
  right: -0.8rem;
  width: 6rem;
  height: 6rem;
  background: rgb(255 255 255 / 38%);
}

.incident-card__visual::after {
  bottom: -1.6rem;
  left: 18%;
  width: 4rem;
  height: 4rem;
  background: rgb(255 255 255 / 24%);
}

.incident-card__visual--blue {
  background: #278cf0;
}

.incident-card__visual--red {
  background: #ed4249;
}

.incident-card__visual--orange {
  background: #f08a24;
}

.incident-card__visual--green {
  background: #23a66c;
}

.incident-card__visual--gray {
  background: #64748b;
}

.incident-card__icon-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  display: grid;
  width: 2.9rem;
  height: 2.9rem;
  place-items: center;
  border: 3px solid rgb(255 255 255 / 78%);
  border-radius: 50%;
  background: rgb(255 255 255 / 18%);
  transform: translate(-50%, -50%);
}

.incident-card__icon {
  width: 1.75rem;
  height: 1.75rem;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.incident-card__badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 92%);
  color: #213451;
  font-size: 0.67rem;
  font-weight: 700;
}

.incident-card__body {
  padding: 0.6rem;
}

.incident-card__category {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.35rem;
  font-size: 0.7rem;
  font-weight: 700;
}

.incident-card__dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: currentcolor;
}

.incident-card__category--blue {
  color: #1479ef;
}

.incident-card__category--red {
  color: #e52b35;
}

.incident-card__category--orange {
  color: #dc740e;
}

.incident-card__category--green {
  color: #138653;
}

.incident-card__category--gray {
  color: #64748b;
}

.incident-card h3 {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #152b56;
  font-size: 0.8rem;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.incident-card p {
  margin: 0.35rem 0;
  overflow: hidden;
  color: #71809a;
  font-size: 0.7rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.incident-card__meta {
  display: flex;
  gap: 0.4rem;
  color: #8290a5;
  font-size: 0.67rem;
}

.incident-card__meta span + span::before {
  margin-right: 0.4rem;
  content: '•';
}

@media (max-width: 84rem) {
  .nearby-incidents__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 46rem) {
  .nearby-incidents__list {
    grid-template-columns: 1fr;
  }
}
</style>
