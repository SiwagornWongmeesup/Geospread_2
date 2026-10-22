<script setup>
defineProps({
  incident: {
    type: Object,
    default: null,
  },
})

defineEmits(['close'])

const previewText = (incident) => String(incident?.description || '').trim()
  || incident?.title
  || 'ยังไม่มีรายละเอียดเพิ่มเติม'

</script>

<template>
  <article v-if="incident" class="incident-map-popup" aria-live="polite">
    <button
      class="incident-map-popup__close"
      type="button"
      aria-label="ปิดตัวอย่างเหตุการณ์"
      @click="$emit('close')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg>
    </button>

    <NuxtLink
      class="incident-map-popup__open"
      to="/incidents"
      :aria-label="`เปิดเหตุการณ์ ${incident.title || 'ที่เลือก'}`"
    >
      <div class="incident-map-popup__media" :class="{ 'incident-map-popup__media--empty': !incident.imageUrl }">
        <img v-if="incident.imageUrl" :src="incident.imageUrl" :alt="incident.title" />
        <img v-else :src="incident.iconUrl || '/Alert.svg'" alt="" />
      </div>

      <div class="incident-map-popup__content">
        <p class="incident-map-popup__category">
          <img :src="incident.iconUrl || '/Alert.svg'" alt="" />
          {{ incident.category || 'เหตุการณ์' }}
        </p>
        <h2 :title="previewText(incident)">{{ previewText(incident) }}</h2>
        <div class="incident-map-popup__details">
          <span
            class="incident-map-popup__status"
            :class="`incident-map-popup__status--${incident.statusTone || 'pending'}`"
          >
            {{ incident.statusLabel || 'รอตรวจสอบ' }}
          </span>
          <p>{{ incident.time || 'เมื่อสักครู่' }} · {{ incident.distanceFromUserLabel || 'ยังไม่ทราบระยะทาง' }}</p>
        </div>
      </div>

      <svg class="incident-map-popup__arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
    </NuxtLink>
  </article>
</template>

<style scoped>
.incident-map-popup { position: relative; width: min(19.5rem, 100%); overflow: hidden; border-radius: .9rem; background: #fff; box-shadow: 0 .75rem 1.75rem rgb(15 50 96 / 20%); }
.incident-map-popup__open { display: grid; grid-template-columns: 4rem minmax(0, 1fr) 1rem; align-items: center; gap: .75rem; padding: .75rem 2.9rem .75rem .75rem; color: inherit; text-decoration: none; }
.incident-map-popup__open:hover { background: #f8fbff; }
.incident-map-popup__open:focus-visible { outline: 3px solid rgb(37 99 235 / 35%); outline-offset: -3px; }
.incident-map-popup__media { display: grid; width: 4rem; height: 4rem; place-items: center; overflow: hidden; border-radius: .65rem; background: #e9f1fb; }
.incident-map-popup__media img { width: 100%; height: 100%; object-fit: cover; }
.incident-map-popup__media--empty img { width: 1.9rem; height: 1.9rem; object-fit: contain; filter: invert(31%) sepia(42%) saturate(1131%) hue-rotate(182deg) brightness(89%) contrast(86%); }
.incident-map-popup__content { min-width: 0; }
.incident-map-popup__category { display: flex; align-items: center; gap: .3rem; margin: 0; overflow: hidden; color: #3766a8; font-size: .69rem; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
.incident-map-popup__category img { width: .9rem; height: .9rem; object-fit: contain; }
.incident-map-popup h2 { display: -webkit-box; margin: .2rem 0 0; overflow: hidden; color: #152b56; font-size: .9rem; font-weight: 800; line-height: 1.28; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.incident-map-popup__details { display: grid; gap: .3rem; margin-top: .45rem; }
.incident-map-popup__status { width: fit-content; max-width: 100%; padding: .2rem .45rem; overflow: hidden; border-radius: 999px; color: #fff; font-size: .63rem; font-weight: 800; line-height: 1; text-overflow: ellipsis; white-space: nowrap; }
.incident-map-popup__status--pending { background: #df7b29; }
.incident-map-popup__status--ongoing { background: #2563eb; }
.incident-map-popup__status--verified { background: #25805b; }
.incident-map-popup__details p { margin: 0; overflow: hidden; color: #617895; font-size: .67rem; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.incident-map-popup__arrow { width: 1rem; height: 1rem; fill: none; stroke: #2a61ba; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2.3; }
.incident-map-popup__close { position: absolute; z-index: 1; top: .38rem; right: .38rem; display: grid; width: 1.75rem; height: 1.75rem; place-items: center; border: 0; border-radius: .5rem; background: #f1f6fc; color: #58719a; cursor: pointer; }
.incident-map-popup__close:hover { background: #e2efff; color: #1d4ed8; }
.incident-map-popup__close:focus-visible { outline: 3px solid rgb(37 99 235 / 35%); outline-offset: 2px; }
.incident-map-popup__close svg { width: .9rem; height: .9rem; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 2; }
</style>
