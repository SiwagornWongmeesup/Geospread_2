<template>
  <!-- Desktop UI: หน้าแรก (index) — GeoSpread Map View -->
  <div class="desktop-layout">

    <!-- Sidebar ซ้าย -->
    <aside class="sidebar">
      <div class="sidebar__logo">
        <span class="sidebar__logo-icon">📍</span>
        <span class="sidebar__logo-text">GeoSpread</span>
      </div>

      <div class="sidebar__search">
        <input
          class="search-input"
          type="text"
          placeholder="🔍 ค้นหาสถานที่..."
        />
      </div>

      <div class="sidebar__section">
        <h3 class="sidebar__section-title">🚨 เหตุการณ์ล่าสุด</h3>
        <div class="event-list">
          <div class="event-card event-card--warning">
            <div class="event-card__type">⚠️ อุทกภัย</div>
            <div class="event-card__location">ถนนสุขุมวิท, กรุงเทพฯ</div>
            <div class="event-card__time">5 นาทีที่แล้ว</div>
          </div>
          <div class="event-card event-card--danger">
            <div class="event-card__type">🔥 เพลิงไหม้</div>
            <div class="event-card__location">สีลม, กรุงเทพฯ</div>
            <div class="event-card__time">12 นาทีที่แล้ว</div>
          </div>
          <div class="event-card event-card--info">
            <div class="event-card__type">🚧 ถนนปิด</div>
            <div class="event-card__location">รัชดาภิเษก, กรุงเทพฯ</div>
            <div class="event-card__time">1 ชั่วโมงที่แล้ว</div>
          </div>
          <div class="event-card event-card--warning">
            <div class="event-card__type">⚡ ไฟฟ้าดับ</div>
            <div class="event-card__location">ลาดพร้าว, กรุงเทพฯ</div>
            <div class="event-card__time">2 ชั่วโมงที่แล้ว</div>
          </div>
        </div>
      </div>

      <div class="sidebar__footer">
        <button class="report-btn">
          <span>+ รายงานเหตุการณ์ใหม่</span>
        </button>
      </div>
    </aside>

    <!-- Map Area -->
    <main class="map-area">
      <MapboxMap
        :center="[100.5018, 13.7563]"
        :zoom="12"
        class="map-area__map"
      />

      <!-- Map Overlay Stats -->
      <div class="map-stats">
        <div class="stat-chip stat-chip--danger">🔴 3 เหตุด่วน</div>
        <div class="stat-chip stat-chip--warning">🟡 12 แจ้งเตือน</div>
        <div class="stat-chip stat-chip--safe">🟢 พื้นที่ปลอดภัย</div>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import MapboxMap from '~/components/MapboxMap.vue'

// ยังไม่รับ props ที่ไม่จำเป็นจาก index.vue แต่เตรียม interface ไว้
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
   Layout: Full-screen Map
   ============================== */
.desktop-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background: #0f172a;
}

/* ==============================
   Sidebar
   ============================== */
.sidebar {
  width: 320px;
  min-width: 320px;
  background: #1e293b;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 10;
  overflow: hidden;
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar__logo-icon {
  font-size: 24px;
}

.sidebar__logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.5px;
}

.sidebar__search {
  padding: 16px 16px 8px;
}

.search-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 10px 14px;
  color: #f1f5f9;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

.search-input::placeholder {
  color: #64748b;
}

.search-input:focus {
  border-color: #3b82f6;
}

.sidebar__section {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.sidebar__section-title {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* ==============================
   Event Cards
   ============================== */
.event-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-card {
  padding: 12px 14px;
  border-radius: 10px;
  border-left: 3px solid transparent;
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.event-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(2px);
}

.event-card--warning {
  border-left-color: #f59e0b;
}

.event-card--danger {
  border-left-color: #ef4444;
}

.event-card--info {
  border-left-color: #3b82f6;
}

.event-card__type {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 2px;
}

.event-card__location {
  font-size: 12px;
  color: #94a3b8;
}

.event-card__time {
  font-size: 11px;
  color: #475569;
  margin-top: 4px;
}

/* ==============================
   Sidebar Footer
   ============================== */
.sidebar__footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.report-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  border: none;
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.report-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* ==============================
   Map Area
   ============================== */
.map-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.map-area__map {
  width: 100% !important;
  height: 100% !important;
  min-height: unset !important;
  border-radius: 0 !important;
  border: none !important;
  box-shadow: none !important;
}

/* ==============================
   Map Overlay Stats
   ============================== */
.map-stats {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  gap: 8px;
  z-index: 5;
}

.stat-chip {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: transform 0.15s;
}

.stat-chip:hover {
  transform: translateY(-1px);
}

.stat-chip--danger {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

.stat-chip--warning {
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #fcd34d;
}

.stat-chip--safe {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #86efac;
}
</style>
