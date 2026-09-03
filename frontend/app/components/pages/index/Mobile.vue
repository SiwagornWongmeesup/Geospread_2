<template>
  <!-- Mobile UI: หน้าแรก (index) — GeoSpread Full-Screen Map -->
  <div class="mobile-layout">

    <!-- Header Bar -->
    <header class="mobile-header">
      <div class="mobile-header__brand">
        <span>📍</span>
        <span class="mobile-header__title">GeoSpread</span>
      </div>
      <button class="mobile-header__notify">
        🔔
        <span class="notify-badge">3</span>
      </button>
    </header>

    <!-- Full-Screen Map -->
    <div class="mobile-map-wrapper">
      <MapboxMap
        :center="[100.5018, 13.7563]"
        :zoom="13"
        class="mobile-map"
      />
    </div>

    <!-- Bottom Sheet -->
    <div class="bottom-sheet">
      <div class="bottom-sheet__handle" />

      <div class="bottom-sheet__header">
        <h2 class="bottom-sheet__title">เหตุการณ์ใกล้คุณ</h2>
        <span class="bottom-sheet__count">4 รายการ</span>
      </div>

      <div class="bottom-sheet__events">
        <div class="mobile-event mobile-event--danger">
          <div class="mobile-event__icon">🔥</div>
          <div class="mobile-event__info">
            <div class="mobile-event__type">เพลิงไหม้</div>
            <div class="mobile-event__location">สีลม, กรุงเทพฯ • 0.8 กม.</div>
          </div>
          <div class="mobile-event__time">12 น.</div>
        </div>

        <div class="mobile-event mobile-event--warning">
          <div class="mobile-event__icon">⚠️</div>
          <div class="mobile-event__info">
            <div class="mobile-event__type">อุทกภัย</div>
            <div class="mobile-event__location">สุขุมวิท, กรุงเทพฯ • 1.2 กม.</div>
          </div>
          <div class="mobile-event__time">5 น.</div>
        </div>

        <div class="mobile-event mobile-event--info">
          <div class="mobile-event__icon">🚧</div>
          <div class="mobile-event__info">
            <div class="mobile-event__type">ถนนปิด</div>
            <div class="mobile-event__location">รัชดาฯ, กรุงเทพฯ • 2.1 กม.</div>
          </div>
          <div class="mobile-event__time">1 ชม.</div>
        </div>
      </div>

      <!-- Report Button -->
      <button class="mobile-report-btn">
        + รายงานเหตุการณ์
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import MapboxMap from '~/components/MapboxMap.vue'

defineProps<{
  users?: any[]
  loading?: boolean
  form?: any
  message?: string
  isError?: boolean
}>()

defineEmits(['submitRegister'])
</script>

<style scoped>
/* ==============================
   Layout
   ============================== */
.mobile-layout {
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  background: #0f172a;
  display: flex;
  flex-direction: column;
}

/* ==============================
   Header
   ============================== */
.mobile-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(to bottom, rgba(15, 23, 42, 0.9), transparent);
}

.mobile-header__brand {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
}

.mobile-header__title {
  font-weight: 700;
  color: #f8fafc;
  font-size: 18px;
}

.mobile-header__notify {
  position: relative;
  background: rgba(255, 255, 255, 0.12);
  border: none;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  font-size: 16px;
  cursor: pointer;
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.notify-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ef4444;
  color: white;
  font-size: 9px;
  font-weight: 700;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ==============================
   Map
   ============================== */
.mobile-map-wrapper {
  flex: 1;
  position: absolute;
  inset: 0;
  z-index: 1;
}

.mobile-map {
  width: 100% !important;
  height: 100% !important;
  min-height: unset !important;
  border-radius: 0 !important;
  border: none !important;
  box-shadow: none !important;
}

/* ==============================
   Bottom Sheet
   ============================== */
.bottom-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  background: #1e293b;
  border-radius: 20px 20px 0 0;
  padding: 12px 16px 32px;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
  max-height: 55vh;
  overflow-y: auto;
}

.bottom-sheet__handle {
  width: 36px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin: 0 auto 14px;
}

.bottom-sheet__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.bottom-sheet__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #f1f5f9;
}

.bottom-sheet__count {
  font-size: 12px;
  color: #64748b;
  background: rgba(255, 255, 255, 0.06);
  padding: 3px 8px;
  border-radius: 10px;
}

/* ==============================
   Mobile Event Cards
   ============================== */
.bottom-sheet__events {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.mobile-event {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border-left: 3px solid transparent;
  cursor: pointer;
  transition: background 0.2s;
}

.mobile-event:active {
  background: rgba(255, 255, 255, 0.08);
}

.mobile-event--danger  { border-left-color: #ef4444; }
.mobile-event--warning { border-left-color: #f59e0b; }
.mobile-event--info    { border-left-color: #3b82f6; }

.mobile-event__icon {
  font-size: 22px;
  width: 36px;
  text-align: center;
}

.mobile-event__info {
  flex: 1;
}

.mobile-event__type {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
}

.mobile-event__location {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.mobile-event__time {
  font-size: 11px;
  color: #475569;
}

/* ==============================
   Report Button
   ============================== */
.mobile-report-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.mobile-report-btn:active {
  opacity: 0.85;
}
</style>
