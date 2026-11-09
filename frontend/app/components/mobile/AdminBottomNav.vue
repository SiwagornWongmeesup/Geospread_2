<template>
  <!-- แถบเมนูด้านล่างของแอดมินบนมือถือ (แทน sidebar) หน้าตาเดียวกับ AppBottomNav ของผู้ใช้ -->
  <nav class="bottom-nav" :aria-label="t('admin.bottomNav.label')">
    <NuxtLink
      v-for="item in adminBottomNavItems"
      :key="item.id"
      :to="item.to"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--current': route.path === item.to }"
      :aria-current="route.path === item.to ? 'page' : undefined"
    >
      <span class="bottom-nav__icon" aria-hidden="true"><img :src="item.icon" alt="" /></span>
      <span class="bottom-nav__label">{{ t(item.shortLabel) }}</span>
    </NuxtLink>

    <button
      ref="moreButton"
      type="button"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--current': menuOpen }"
      :aria-expanded="menuOpen"
      aria-controls="admin-more-menu"
      @click="menuOpen = !menuOpen"
    >
      <span class="bottom-nav__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
      </span>
      <span class="bottom-nav__label">{{ t('admin.bottomNav.more') }}</span>
      <span v-if="moreBadge" class="bottom-nav__badge">{{ moreBadge }}</span>
    </button>

    <!-- เมนูอื่น: รายการเมนูทั้งหมดเหมือนใน sidebar (แตะพื้นหลังหรือกด Esc เพื่อปิด) -->
    <Transition name="more-menu">
      <div v-if="menuOpen" class="more-menu" @keydown.esc="closeMenu(true)">
        <div class="more-menu__backdrop" aria-hidden="true" @click="closeMenu(false)" />
        <div id="admin-more-menu" class="more-menu__panel" role="dialog" :aria-label="t('admin.bottomNav.moreTitle')">
          <div class="more-menu__head">
            <strong>{{ t('admin.bottomNav.moreTitle') }}</strong>
            <button type="button" class="more-menu__close" :aria-label="t('admin.bottomNav.close')" @click="closeMenu(true)">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>

          <section v-for="group in groups" :key="group.label" class="more-menu__group">
            <h2>{{ t(group.label) }}</h2>
            <component
              :is="item.to ? NuxtLink : 'button'"
              v-for="item in group.items"
              :key="item.id"
              :to="item.to"
              :type="item.to ? undefined : 'button'"
              :disabled="item.to ? undefined : true"
              class="more-menu__item"
              :class="{ 'more-menu__item--current': route.path === item.to }"
              @click="selectMenuItem(item)"
            >
              <img :src="item.icon" alt="" />
              <span>{{ t(item.label) }}</span>
            </component>
          </section>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { adminAccountItems, adminBottomNavItems, adminMenuGroups, adminSystemItems } from '~/utils/adminNavMenu'

const NuxtLink = resolveComponent('NuxtLink')
const { t } = useLocale()
const route = useRoute()

// แผ่น "เมนูอื่น" แสดงทุกเมนูเหมือน sidebar + โปรไฟล์ (บนมือถือไม่มีเมนูบัญชีใน header)
const groups = [...adminMenuGroups, { label: 'admin.system', items: [...adminSystemItems, ...adminAccountItems] }]

// ตัวเลขแจ้งเตือนของเมนูที่ไม่อยู่ในแถบล่าง แสดงที่ปุ่ม "เมนูอื่น"
// เมนูนี้อยู่ในแถบล่างแล้วหรือยัง (ถ้าอยู่แล้ว ตัวเลขของมันไม่ต้องนับรวมที่ปุ่ม "เมนูอื่น")
const isInBottomNav = (item) => {
  return adminBottomNavItems.some((tab) => tab.id === item.id)
}

let moreBadge = 0
for (const group of groups) {
  for (const item of group.items) {
    if (item.badge && !isInBottomNav(item)) {
      moreBadge = moreBadge + item.badge
    }
  }
}

// กดเมนูในแผ่น "เมนูอื่น": ปิดแผ่นเมื่อเป็นเมนูที่มีหน้าแล้ว (เมนูที่ยังพัฒนาไม่เสร็จกดไม่ได้อยู่แล้ว)
const selectMenuItem = (item) => {
  if (item.to) {
    closeMenu(false)
  }
}

const menuOpen = ref(false)
const moreButton = ref(null)

const closeMenu = (returnFocus) => {
  menuOpen.value = false
  if (returnFocus) {
    moreButton.value?.focus()
  }
}

// เปลี่ยนหน้าแล้วปิดเมนูเสมอ
watch(() => route.path, () => { menuOpen.value = false })
</script>

<style scoped>
.bottom-nav { position:fixed; z-index:100; right:0; bottom:0; left:0; display:grid; height:calc(71px + env(safe-area-inset-bottom)); grid-template-columns:repeat(4,minmax(0,1fr)); padding-bottom:env(safe-area-inset-bottom); border-top:1px solid var(--gs-line); background:var(--gs-surface); }
.bottom-nav__item { position:relative; z-index:2; display:grid; min-width:0; align-content:center; justify-items:center; gap:3px; padding:0; border:0; background:transparent; color:var(--gs-muted); font:inherit; text-decoration:none; cursor:pointer; }
.bottom-nav__icon { display:grid; width:41px; height:41px; place-items:center; border-radius:50%; }
.bottom-nav__icon img { width:22px; height:22px; object-fit:contain; opacity:.72; }
.bottom-nav__icon svg { width:23px; height:23px; fill:none; stroke:currentColor; stroke-linecap:round; stroke-linejoin:round; stroke-width:2; }
/* ภาษาไทยมีวรรณยุกต์ซ้อนบน-ล่าง บรรทัดต้องสูง 1.4 เท่า ไม่อย่างนั้นส่วนที่ซ่อน (overflow) จะตัดวรรณยุกต์ทิ้ง */
.bottom-nav__label { max-width:100%; overflow:hidden; font-size:13px; font-weight:600; line-height:1.4; text-overflow:ellipsis; white-space:nowrap; }
.bottom-nav__item--current { color:var(--gs-action); }
.bottom-nav__item--current .bottom-nav__icon { background:var(--gs-action-tint); }
.bottom-nav__item--current .bottom-nav__icon img { opacity:1; }
.bottom-nav__item:focus-visible { outline:3px solid rgb(29 53 87 / 35%); outline-offset:-3px; }
.bottom-nav__item:active { background:var(--gs-surface-sunken); }
.bottom-nav__badge { position:absolute; top:9px; left:calc(50% + 6px); display:grid; min-width:18px; height:18px; padding:0 4px; place-items:center; border:2px solid var(--gs-surface); border-radius:999px; background:var(--gs-danger); color:#fff; font-size:11px; font-weight:800; line-height:1; }

.more-menu { position:fixed; z-index:1; inset:0; }
.more-menu__backdrop { position:absolute; inset:0; background:rgb(16 41 104 / 35%); }
.more-menu__panel { position:absolute; right:12px; bottom:calc(82px + env(safe-area-inset-bottom)); left:12px; display:grid; max-height:calc(100dvh - 120px); gap:12px; padding:12px 12px 14px; overflow-y:auto; border-radius:18px; background:var(--gs-surface); box-shadow:0 16px 40px rgb(16 41 104 / 25%); }
.more-menu__head { display:flex; align-items:center; justify-content:space-between; padding:2px 4px 0 6px; color:var(--gs-ink); font-size:16px; }
.more-menu__close { display:grid; width:36px; height:36px; place-items:center; padding:0; border:0; border-radius:50%; background:transparent; color:var(--gs-ink-2); cursor:pointer; }
.more-menu__close:hover { background:var(--gs-surface-sunken); }
.more-menu__close svg { width:20px; height:20px; fill:none; stroke:currentColor; stroke-linecap:round; stroke-width:2; }
.more-menu__group { display:grid; gap:2px; }
.more-menu__group h2 { margin:0 0 4px; padding:0 8px; color:var(--gs-ink-2); font-size:13px; font-weight:800; }
.more-menu__item { display:flex; width:100%; min-height:46px; align-items:center; gap:12px; padding:8px 10px; border:0; border-radius:var(--gs-radius-sm); background:transparent; color:var(--gs-ink-2); font:inherit; font-size:15px; font-weight:650; text-align:left; text-decoration:none; cursor:pointer; }
.more-menu__item img { width:20px; height:20px; flex:0 0 auto; object-fit:contain; }
.more-menu__item span { flex:1; min-width:0; line-height:1.45; }
.more-menu__item small { color:var(--gs-ink-2); font-size:13px; font-weight:600; }
.more-menu__item b { display:grid; min-width:21px; height:21px; padding:0 5px; place-items:center; border-radius:999px; background:var(--gs-danger); color:#fff; font-size:12px; }
.more-menu__item:active:not(:disabled) { background:var(--gs-surface-sunken); }
.more-menu__item:disabled { cursor:not-allowed; opacity:.5; }
.more-menu__item--current { background:var(--gs-action); color:#fff; }
.more-menu__item--current img { filter:brightness(0) invert(1); }
.more-menu__item:focus-visible { outline:3px solid var(--gs-action); outline-offset:2px; }

.more-menu-enter-active, .more-menu-leave-active { transition:opacity .18s ease; }
.more-menu-enter-active .more-menu__panel, .more-menu-leave-active .more-menu__panel { transition:transform .2s ease; }
.more-menu-enter-from, .more-menu-leave-to { opacity:0; }
.more-menu-enter-from .more-menu__panel, .more-menu-leave-to .more-menu__panel { transform:translateY(12px); }
@media (prefers-reduced-motion: reduce) {
  .more-menu-enter-active, .more-menu-leave-active, .more-menu-enter-active .more-menu__panel, .more-menu-leave-active .more-menu__panel { transition:none; }
}
</style>
