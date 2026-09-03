<template>
  <!-- Desktop App Header -->
  <!-- Stub component: จะถูก implement เต็มรูปแบบในระยะต่อไป (Login, Map, Notifications) -->
  <header class="app-header">
    <div class="app-header__inner">
      <!-- Logo + Brand -->
      <div class="app-header__brand">
        <span class="app-header__logo">🌍</span>
        <span class="app-header__name">GeoSpread</span>
        <span class="app-header__tagline">Community Safety Platform</span>
      </div>

      <!-- Navigation Links (Placeholder) -->
      <nav class="app-header__nav">
        <a href="#" class="nav-link nav-link--active">แผนที่</a>
        <a href="#" class="nav-link">ฟีดเหตุการณ์</a>
        <a href="#" class="nav-link">แจ้งเหตุ</a>
        <a href="#" class="nav-link">การแจ้งเตือน</a>
      </nav>

      <!-- User Actions (Placeholder) -->
      <div class="app-header__actions">
        <button class="btn-login">เข้าสู่ระบบ</button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// Desktop Header Component
// จะเชื่อมต่อ Auth Store และ Router ในระยะต่อไป
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #0f172a;
  border-bottom: 1px solid #1e293b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.app-header__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 32px;
}

/* Brand */
.app-header__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.app-header__logo {
  font-size: 22px;
}

.app-header__name {
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.02em;
}

.app-header__tagline {
  font-size: 11px;
  color: #64748b;
  padding: 2px 8px;
  background: #1e293b;
  border-radius: 10px;
}

/* Nav */
.app-header__nav {
  display: flex;
  gap: 4px;
  flex: 1;
}

.nav-link {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 14px;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.15s ease;
}

.nav-link:hover {
  color: #f8fafc;
  background: #1e293b;
}

.nav-link--active {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.08);
}

/* Actions */
.app-header__actions {
  flex-shrink: 0;
}

.btn-login {
  padding: 7px 18px;
  background: #0284c7;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-login:hover {
  background: #0369a1;
}
</style>
