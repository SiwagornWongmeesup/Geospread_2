<template>
  <section class="location-picker" aria-labelledby="location-picker-heading">
    <header>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.1 7 13 7 13s7-7.9 7-13a7 7 0 0 0-7-7Zm0 9.6A2.6 2.6 0 1 1 12 6a2.6 2.6 0 0 1 0 5.6Z" fill="currentColor" /></svg>
      <div>
        <h2 id="location-picker-heading">ตำแหน่งเหตุการณ์</h2>
        <p>ตรวจสอบตำแหน่งก่อนส่งรายงาน</p>
      </div>
    </header>

    <div class="location-picker__current">
      <div>
        <strong>{{ locationLabel }}</strong>
        <span>{{ isUsingCurrentLocation ? 'ใช้ตำแหน่งตัวอย่างของคุณแล้ว' : 'เลือกจุดบนแผนที่ หรือใช้ตำแหน่งปัจจุบัน' }}</span>
      </div>
      <button type="button" @click="useCurrentLocation">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a1 1 0 0 1 1 1v1.1a7 7 0 0 1 5.9 5.9H20a1 1 0 1 1 0 2h-1.1a7 7 0 0 1-5.9 5.9V20a1 1 0 1 1-2 0v-1.1A7 7 0 0 1 5.1 13H4a1 1 0 1 1 0-2h1.1A7 7 0 0 1 11 5.1V4a1 1 0 0 1 1-1Zm0 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" fill="currentColor" /></svg>
        ใช้ตำแหน่งปัจจุบัน
      </button>
    </div>

    <div class="location-picker__map" aria-label="แผนที่ตำแหน่งเหตุการณ์ตัวอย่าง">
      <MapboxMap :center="[98.9853, 18.7883]" :zoom="12" class="location-picker__map-canvas" />
      <span class="map-marker map-marker--incident" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.1 7 13 7 13s7-7.9 7-13a7 7 0 0 0-7-7Z" fill="currentColor" /><circle cx="12" cy="9" r="2.3" fill="#fff" /></svg></span>
      <span class="map-marker map-marker--current" :class="{ 'map-marker--active': isUsingCurrentLocation }" aria-hidden="true" />
    </div>

    <p class="location-picker__note">ตำแหน่งและหมุดเป็นข้อมูลตัวอย่าง ยังไม่ได้เชื่อมต่อบริการระบุตำแหน่ง</p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import MapboxMap from '~/components/MapboxMap.vue'

const isUsingCurrentLocation = ref(false)
const locationLabel = computed(() => isUsingCurrentLocation.value ? 'ตำแหน่งปัจจุบัน (ตัวอย่าง)' : 'ยังไม่ได้เลือกตำแหน่ง')
const useCurrentLocation = () => { isUsingCurrentLocation.value = true }
</script>

<style scoped>
/* Location controls */

.location-picker {
  padding: 1rem;
  border-radius: 0.875rem;
  background: #fff;
  box-shadow: 0 4px 16px rgb(31 72 125 / 8%);
}

.location-picker header {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
}

.location-picker header > svg {
  width: 1.9rem;
  height: 1.9rem;
  color: #1479ef;
}

.location-picker h2 {
  margin: 0;
  color: #102968;
  font-size: 1rem;
}

.location-picker header p {
  margin: 0.18rem 0 0;
  color: #63758f;
  font-size: 0.74rem;
}

.location-picker__current {
  display: grid;
  gap: 0.65rem;
  margin: 0.9rem 0;
  padding: 0.75rem;
  border-radius: 0.65rem;
  background: #fff4f4;
}

.location-picker__current strong,
.location-picker__current span {
  display: block;
}

.location-picker__current strong {
  color: #c22831;
  font-size: 0.8rem;
}

.location-picker__current span {
  margin-top: 0.15rem;
  color: #7b6870;
  font-size: 0.7rem;
  line-height: 1.35;
}

.location-picker__current button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 2.55rem;
  border: 0;
  border-radius: 0.5rem;
  background: #e8333c;
  color: #fff;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
}

.location-picker__current button svg {
  width: 1.2rem;
  height: 1.2rem;
}

.location-picker__current button:hover,
.location-picker__current button:focus-visible {
  background: #cf202a;
  outline: none;
}

.location-picker__map {
  position: relative;
  height: 17rem;
  overflow: hidden;
  border-radius: 0.7rem;
  background: #dceef1;
}

.location-picker__map-canvas {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.map-marker {
  position: absolute;
  display: block;
  pointer-events: none;
}

.map-marker--incident {
  top: 38%;
  left: 50%;
  width: 2.8rem;
  height: 2.8rem;
  color: #e52d38;
  transform: translate(-50%, -100%);
  filter: drop-shadow(0 4px 5px rgb(114 22 27 / 28%));
}

.map-marker--incident svg {
  display: block;
  width: 100%;
  height: 100%;
}

.map-marker--current {
  top: 62%;
  left: 49%;
  width: 1.25rem;
  height: 1.25rem;
  border: 3px solid #fff;
  border-radius: 50%;
  background: #1479ef;
  box-shadow: 0 0 0 4px rgb(20 121 239 / 20%);
  transform: translate(-50%, -50%);
  transition: box-shadow 180ms ease, transform 180ms ease;
}

.map-marker--current.map-marker--active {
  box-shadow: 0 0 0 7px rgb(20 121 239 / 25%);
  transform: translate(-50%, -50%) scale(1.08);
}

.location-picker__note {
  margin: 0.65rem 0 0;
  color: #63758f;
  font-size: 0.7rem;
  line-height: 1.4;
}
</style>
