<template>
  <section class="nearby-incidents" aria-labelledby="nearby-incidents-heading">
    <div class="nearby-incidents__header">
      <div>
        <h2 id="nearby-incidents-heading">{{ title }}</h2>
        <p>เหตุการณ์ล่าสุดที่เกิดขึ้นใกล้ตำแหน่งปัจจุบันของคุณ</p>
      </div>
      <NuxtLink v-if="viewAllTo" :to="viewAllTo" class="nearby-incidents__view-all">
        ดูทั้งหมด
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
      </NuxtLink>
    </div>

    <p v-if="isLoading" class="nearby-incidents__state">กำลังโหลดเหตุการณ์บนแผนที่...</p>
    <p v-else-if="errorMessage" class="nearby-incidents__state nearby-incidents__state--error">{{ errorMessage }}</p>
    <p v-else-if="!incidents.length" class="nearby-incidents__state">ยังไม่มีเหตุการณ์ที่แสดงบนแผนที่</p>

    <div v-else class="nearby-incidents__list">
      <NuxtLink
        v-for="incident in incidents.slice(0, 4)"
        :key="incident.id"
        :to="incidentDetailPath(incident)"
        class="incident-card"
        :class="{ 'incident-card--selected': selectedIncidentId === incident.id }"
        :aria-label="`เปิดเหตุการณ์ ${incident.title || 'ที่เลือก'}`"
      >
        <div class="incident-card__media" :class="{ 'incident-card__media--empty': !incident.imageUrl }">
          <img v-if="incident.imageUrl" class="incident-card__photo" :src="incident.imageUrl" :alt="incident.title" />
          <div v-else class="incident-card__empty-media" aria-label="ไม่มีรูปภาพ">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m4 18 5.2-5.2 3.1 3.1 2.4-2.4L20 18" /></svg>
          </div>

          <span class="incident-card__category">
            <img :src="incident.iconUrl || '/Alert.svg'" alt="" />
            {{ incident.category || 'เหตุการณ์' }}
          </span>
          <span class="incident-card__status" :class="`incident-card__status--${incident.statusTone || 'pending'}`">
            {{ incident.statusLabel || 'รอตรวจสอบ' }}
          </span>
        </div>

        <div class="incident-card__body">
          <h3 :title="previewText(incident)">{{ previewText(incident) }}</h3>
          <p class="incident-card__location">{{ incident.areaLabel || 'พื้นที่ที่รายงาน' }}</p>
          <div class="incident-card__meta">
            <span>{{ incident.distanceFromUserLabel || 'ยังไม่ทราบระยะทาง' }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ incident.time || 'เมื่อสักครู่' }}</span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'เหตุการณ์ใกล้คุณ' },
  viewAllTo: { type: String, default: '/incidents' },
  selectedIncidentId: { type: String, default: null },
  incidents: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  errorMessage: { type: String, default: null },
})

const previewText = (incident) => String(incident?.description || '').trim()
  || incident?.title
  || 'ยังไม่มีรายละเอียดเพิ่มเติม'

const incidentDetailPath = (incident) => `/incidents/${incident.sourceId}`
</script>

<style scoped>
.nearby-incidents { padding: 1rem; border: 1px solid #dfe8f4; border-radius: 1rem; background: #fff; }
.nearby-incidents__header { display: flex; align-items: start; justify-content: space-between; gap: .75rem; margin-bottom: 1rem; }
.nearby-incidents h2 { margin: 0; color: #102968; font-size: 1.05rem; }
.nearby-incidents__header p { margin: .2rem 0 0; color: #536f98; font-size: .76rem; }
.nearby-incidents__view-all { display: inline-flex; flex: 0 0 auto; align-items: center; gap: .28rem; color: #2563eb; font-size: .82rem; font-weight: 800; text-decoration: none; }
.nearby-incidents__view-all svg { width: .92rem; height: .92rem; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2; }
.nearby-incidents__view-all:hover { color: #164ec2; text-decoration: underline; text-underline-offset: .2rem; }
.nearby-incidents__view-all:focus-visible, .incident-card:focus-visible { outline: 3px solid rgb(37 99 235 / 30%); outline-offset: 3px; }
.nearby-incidents__list { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-auto-rows: 1fr; gap: .8rem; }
.nearby-incidents__state { margin: 0; padding: .9rem; border: 1px dashed #cdd9e8; border-radius: .75rem; background: #f8fbff; color: #526e95; font-size: .82rem; font-weight: 700; }
.nearby-incidents__state--error { border-color: #fecaca; background: #fff7f7; color: #b91c1c; }
.incident-card { display: flex; min-width: 0; height: 100%; flex-direction: column; overflow: hidden; border: 1px solid #e0e8f3; border-radius: .875rem; background: #fff; color: inherit; text-decoration: none; transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease; }
.incident-card:hover, .incident-card--selected { border-color: #1976e9; box-shadow: 0 .5rem 1.25rem rgb(19 104 204 / 14%); transform: translateY(-2px); }
.incident-card__media { position: relative; display: grid; width: 100%; aspect-ratio: 16 / 9; place-items: center; overflow: hidden; background: #eef4fb; }
.incident-card__photo { width: 100%; height: 100%; object-fit: cover; }
.incident-card__empty-media { color: #8494b2; }
.incident-card__empty-media svg { width: 2.3rem; height: 2.3rem; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.6; }
.incident-card__category, .incident-card__status { position: absolute; top: .55rem; max-width: calc(100% - 1.1rem); padding: .28rem .5rem; overflow: hidden; border-radius: 999px; font-size: .66rem; font-weight: 800; line-height: 1; text-overflow: ellipsis; white-space: nowrap; }
.incident-card__category { left: .55rem; display: inline-flex; align-items: center; gap: .25rem; background: rgb(255 255 255 / 93%); color: #24528e; }
.incident-card__category img { width: .78rem; height: .78rem; object-fit: contain; }
.incident-card__status { right: .55rem; color: #fff; box-shadow: 0 .18rem .65rem rgb(11 29 60 / 20%); }
.incident-card__status--pending { background: #df7b29; }
.incident-card__status--ongoing { background: #2563eb; }
.incident-card__status--verified { background: #25805b; }
.incident-card__body { display: grid; width: 100%; align-content: start; gap: .28rem; padding: .72rem .78rem .8rem; }
.incident-card h3 { display: -webkit-box; min-height: 2.55em; margin: 0; overflow: hidden; color: #152b56; font-size: .88rem; font-weight: 800; line-height: 1.28; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.incident-card__location { margin: 0; overflow: hidden; color: #55739d; font-size: .72rem; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.incident-card__meta { display: flex; min-width: 0; gap: .3rem; margin-top: .2rem; overflow: hidden; color: #627d9f; font-size: .67rem; font-weight: 650; white-space: nowrap; }
.incident-card__meta span { overflow: hidden; text-overflow: ellipsis; }
@media (max-width: 84rem) { .nearby-incidents__list { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 46rem) { .nearby-incidents__list { grid-template-columns: 1fr; } .incident-card__body { padding: .85rem .9rem .95rem; } .incident-card h3 { font-size: 1rem; } }
</style>
