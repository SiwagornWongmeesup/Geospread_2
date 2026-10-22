<template>
  <nav class="bottom-nav" aria-label="เมนูหลัก">
    <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" class="bottom-nav__item" :class="{ 'bottom-nav__item--report': item.isReport }">
      <span class="bottom-nav__icon" aria-hidden="true">
        <svg v-if="item.icon === 'home'" viewBox="0 0 24 24"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" /></svg>
        <svg v-else-if="item.icon === 'list'" viewBox="0 0 24 24"><path d="M6 4h13v16H6zM9 8h7M9 12h7M9 16h5M4 4v16" /></svg>
        <svg v-else-if="item.icon === 'plus'" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
        <svg v-else-if="item.icon === 'bell'" viewBox="0 0 24 24"><path d="M18 10a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4" /></svg>
        <svg v-else viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.1 3.6-7 8-7s8 2.9 8 7" /></svg>
      </span>
      <span class="bottom-nav__label">{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup>
const navItems = [
  { to: '/', icon: 'home', label: 'หน้าหลัก' },
  { to: '/incidents', icon: 'list', label: 'เหตุการณ์' },
  { to: '/report-incident', icon: 'plus', label: 'แจ้งเหตุ', isReport: true },
  { to: '/notifications', icon: 'bell', label: 'แจ้งเตือน' },
  { to: '/profile', icon: 'profile', label: 'โปรไฟล์' },
]
</script>

<style scoped>
.bottom-nav { position:fixed; z-index:100; right:0; bottom:0; left:0; display:grid; height:calc(4.45rem + env(safe-area-inset-bottom)); grid-template-columns:repeat(5,minmax(0,1fr)); padding-bottom:env(safe-area-inset-bottom); background:rgb(255 255 255 / 98%); box-shadow:0 -.35rem 1.4rem rgb(17 45 91 / 10%); }
.bottom-nav__item { display:grid; min-width:0; align-content:center; justify-items:center; gap:.17rem; color:#65769a; text-decoration:none; }.bottom-nav__icon { display:grid; width:2.55rem; height:2.55rem; place-items:center; border-radius:50%; }.bottom-nav__icon svg { width:1.42rem; height:1.42rem; fill:none; stroke:currentColor; stroke-linecap:round; stroke-linejoin:round; stroke-width:2; }.bottom-nav__label { overflow:hidden; font-size:.59rem; font-weight:750; line-height:1; text-overflow:ellipsis; white-space:nowrap; }.bottom-nav__item.router-link-exact-active { color:#146ee7; }.bottom-nav__item.router-link-exact-active .bottom-nav__icon { background:#e8f1ff; }.bottom-nav__item--report { transform:translateY(-.85rem); }.bottom-nav__item--report .bottom-nav__icon { width:3.3rem; height:3.3rem; background:#1673f1; color:#fff; box-shadow:0 .5rem 1rem rgb(22 115 241 / 30%); }.bottom-nav__item--report .bottom-nav__icon svg { width:1.75rem; height:1.75rem; stroke-width:2.1; }.bottom-nav__item--report .bottom-nav__label { margin-top:-.1rem; color:#146ee7; }.bottom-nav__item:focus-visible { outline:3px solid rgb(20 110 231 / 35%); outline-offset:-3px; }.bottom-nav__item:active { background:#f2f7ff; }
</style>
