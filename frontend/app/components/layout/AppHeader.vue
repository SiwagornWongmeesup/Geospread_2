<template>
  <header class="app-header">
    <div class="app-header__brand">
      <img src="/logo.png" alt="GeoSpread Logo" class="app-header__logo-img" />

      <div class="app-header__brand-text">
        <span class="app-header__name">GeoSpread</span>
        <span class="app-header__tagline">Safer Communities Together</span>
      </div>
    </div>

    <div class="app-header__search">
      <span class="search-icon">⌕</span>
      <input
        type="text"
        placeholder="Search locations, incidents, or help requests (e.g. Chiang Mai, flood, fire...)"
      />
    </div>

    <button class="location-button">
      <span>📍</span>
      Chiang Mai
      <span class="arrow">⌄</span>
    </button>

    <button class="notification-button" aria-label="Notifications">
      ♧
      <span class="notification-badge">3</span>
    </button>

    <div class="app-header__profile">
      <img src="" alt="Siwagorn profile" class="profile-image" />

      <div class="profile-info">
        <span class="welcome-text">Welcome</span>
        <strong>Siwagorn</strong>
      </div>

      <span class="arrow">⌄</span>
    </div>
  </header>
</template>

<script setup>
// เชื่อมต่อ Router / Auth / Notifications ภายหลังได้
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 72px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 18px 0 14px;
  background: #ffffff;
  border-bottom: 1px solid #e8eef8;
  box-shadow: 0 2px 10px rgba(31, 74, 142, 0.05);
  font-family: "Noto Sans Thai", Inter, sans-serif;
}

/* Logo */

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 242px;
}

.app-header__logo-img {
  width: 90px;
  object-fit: contain;
}

.app-header__brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.app-header__name {
  color: #071b72;
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.8px;
}

.app-header__tagline {
  margin-top: 3px;
  color: #4f6397;
  font-size: 11px;
  font-weight: 500;
}

/* Search */

.app-header__search {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  background: #f2f6fd;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: 0.2s ease;
}

.app-header__search:focus-within {
  border-color: #006dff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(0, 109, 255, 0.1);
}

.search-icon {
  color: #071b72;
  font-size: 29px;
  line-height: 1;
  transform: rotate(-20deg);
}

.app-header__search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #071b72;
  font-family: inherit;
  font-size: 14px;
}

.app-header__search input::placeholder {
  color: #6373a2;
}

/* Location */

.location-button {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  background: #f2f6fd;
  color: #071b72;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.location-button:hover {
  background: #e6f0ff;
}

/* Notification */

.notification-button {
  position: relative;
  width: 40px;
  height: 40px;
  border: 0;
  background: transparent;
  color: #071b72;
  font-size: 27px;
  cursor: pointer;
}

.notification-badge {
  position: absolute;
  top: 3px;
  right: 1px;
  min-width: 19px;
  height: 19px;
  display: grid;
  place-items: center;
  padding: 0 4px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  background: #f2232f;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
}

/* Profile */

.app-header__profile {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
}

.profile-image {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 8px rgba(31, 74, 142, 0.15);
}

.profile-info {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
  color: #071b72;
  font-size: 14px;
}

.welcome-text {
  color: #6576a5;
  font-size: 11px;
}

.arrow {
  color: #071b72;
  font-size: 18px;
  font-weight: 700;
}
</style>