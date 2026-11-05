<template>
  <nav class="bottom-nav" :aria-label="t('bottomNav.label')">
    <template v-for="item in navItems" :key="item.to || 'create'">
      <!-- ปุ่มบวกตรงกลาง: กดแล้วเลือกว่าจะแจ้งเหตุหรือขอความช่วยเหลือ -->
      <button
        v-if="item.isCreate"
        ref="createButton"
        type="button"
        class="bottom-nav__item bottom-nav__item--create"
        :class="{ 'bottom-nav__item--open': menuOpen, 'bottom-nav__item--current': isCreateRoute }"
        :aria-expanded="menuOpen"
        aria-controls="bottom-nav-create-menu"
        @click="toggleMenu"
      >
        <span class="bottom-nav__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
        </span>
        <span class="bottom-nav__label">{{ t(item.label) }}</span>
      </button>

      <NuxtLink v-else :to="item.to" class="bottom-nav__item">
        <span class="bottom-nav__icon" aria-hidden="true">
          <svg v-if="item.icon === 'home'" viewBox="0 0 24 24"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" /></svg>
          <svg v-else-if="item.icon === 'list'" viewBox="0 0 24 24"><path d="M6 4h13v16H6zM9 8h7M9 12h7M9 16h5M4 4v16" /></svg>
          <svg v-else-if="item.icon === 'bell'" viewBox="0 0 24 24"><path d="M18 10a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4" /></svg>
          <svg v-else viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.1 3.6-7 8-7s8 2.9 8 7" /></svg>
        </span>
        <span class="bottom-nav__label">{{ t(navLabel(item)) }}</span>
      </NuxtLink>
    </template>

    <!-- เมนูเลือก แจ้งเหตุ / ขอความช่วยเหลือ (แตะพื้นหลังหรือกด Esc เพื่อปิด)
         อยู่ใน <nav> เพื่อให้ component มีกล่องนอกสุดอันเดียว class ที่ layout ส่งมา (เช่น ซ่อนบนคอม) จึงติดครบ -->
    <Transition name="create-menu">
      <div v-if="menuOpen" class="create-menu" @keydown.esc="closeMenu(true)">
        <div class="create-menu__backdrop" aria-hidden="true" @click="closeMenu(false)" />
        <div id="bottom-nav-create-menu" class="create-menu__panel" :aria-label="t('bottomNav.createMenu')">
          <!-- อันตรายต่อชีวิต: โทรก่อน เห็นตั้งแต่กดปุ่มบวก -->
          <EmergencyCallStrip compact />
          <NuxtLink
            v-for="(action, index) in createActions"
            :key="action.to"
            ref="actionLinks"
            :to="action.to"
            class="create-menu__action"
            :class="`create-menu__action--${action.tone}`"
              @click="closeMenu(false)"
            @keydown.down.prevent="focusAction(index + 1)"
            @keydown.up.prevent="focusAction(index - 1)"
          >
            <span class="create-menu__icon" aria-hidden="true"><img :src="action.icon" alt="" /></span>
            <span class="create-menu__text">
              <strong>{{ t(action.label) }}</strong>
              <span>{{ t(action.hint) }}</span>
            </span>
            <svg class="create-menu__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </nav>

</template>

<script setup>
import EmergencyCallStrip from '~/components/common/EmergencyCallStrip.vue'

const { t } = useLocale()
const route = useRoute()

const navItems = [
  { to: '/', icon: 'home', label: 'bottomNav.home' },
  { to: '/incidents', icon: 'list', label: 'bottomNav.incidents' },
  { isCreate: true, label: 'bottomNav.create' },
  { to: '/notifications', icon: 'bell', label: 'bottomNav.notifications' },
  { to: '/profile', icon: 'profile', label: 'bottomNav.profile' },
]

const { isLoggedIn } = useAuth()

// แท็บโปรไฟล์: ยังไม่ล็อกอินขึ้นว่า "เข้าสู่ระบบ" ให้รู้ว่ากดตรงนี้เพื่อล็อกอิน
const navLabel = (item) => {
  if (item.to === '/profile' && !isLoggedIn.value) {
    return 'header.login'
  }
  return item.label
}

const createActions = [
  { to: '/report-incident', icon: '/icons/Report.svg', tone: 'report', label: 'nav.reportIncident', hint: 'rightPanel.reportActionHint' },
  { to: '/request-help', icon: '/icons/Life-saving.svg', tone: 'help', label: 'nav.requestHelp', hint: 'rightPanel.helpActionHint' },
]

const menuOpen = ref(false)
const createButton = ref(null)
const actionLinks = ref([])

// อยู่หน้าแจ้งเหตุหรือขอความช่วยเหลือ: ไฮไลต์ปุ่มบวกเหมือนแท็บที่เลือกอยู่
const isCreateRoute = computed(() => createActions.some((action) => route.path === action.to))

const focusAction = (index) => {
  const links = actionLinks.value
  if (!links.length) return
  const target = links[(index + links.length) % links.length]
  target?.$el?.focus()
}

const toggleMenu = async () => {
  menuOpen.value = !menuOpen.value
  if (menuOpen.value) {
    await nextTick()
    focusAction(0)
  }
}

// returnFocus: ปิดด้วย Esc ให้เคอร์เซอร์กลับไปที่ปุ่มบวก
const closeMenu = (returnFocus) => {
  menuOpen.value = false
  if (returnFocus) (Array.isArray(createButton.value) ? createButton.value[0] : createButton.value)?.focus()
}

// เปลี่ยนหน้าแล้วปิดเมนูเสมอ (เช่น กดปุ่มย้อนกลับของเครื่อง)
watch(() => route.fullPath, () => { menuOpen.value = false })
</script>

<style scoped>
.bottom-nav { position:fixed; z-index:100; right:0; bottom:0; left:0; display:grid; height:calc(71px + env(safe-area-inset-bottom)); grid-template-columns:repeat(5,minmax(0,1fr)); padding-bottom:env(safe-area-inset-bottom); border-top:1px solid var(--gs-line); background:var(--gs-surface); }
.bottom-nav__item { position:relative; z-index:2; display:grid; min-width:0; align-content:center; justify-items:center; gap:3px; padding:0; border:0; background:transparent; color:var(--gs-muted); font:inherit; text-decoration:none; cursor:pointer; }.bottom-nav__icon { display:grid; width:41px; height:41px; place-items:center; border-radius:50%; }.bottom-nav__icon svg { width:23px; height:23px; fill:none; stroke:currentColor; stroke-linecap:round; stroke-linejoin:round; stroke-width:2; }.bottom-nav__label { overflow:hidden; font-size:12px; font-weight:600; line-height:1; text-overflow:ellipsis; white-space:nowrap; }.bottom-nav__item.router-link-exact-active { color:var(--gs-action); }.bottom-nav__item.router-link-exact-active .bottom-nav__icon { background:var(--gs-action-tint); }.bottom-nav__item:focus-visible { outline:3px solid rgb(29 53 87 / 35%); outline-offset:-3px; }.bottom-nav__item:active { background:var(--gs-surface-sunken); }

.bottom-nav__item--create { transform:translateY(-14px); }
.bottom-nav__item--create:active { background:transparent; }
.bottom-nav__item--create .bottom-nav__icon { width:53px; height:53px; background:var(--gs-danger); color:#fff; box-shadow:0 6px 13px rgb(195 40 45 / 28%); transition:transform .2s ease, background-color .2s ease; }
.bottom-nav__item--create .bottom-nav__icon svg { width:28px; height:28px; stroke-width:2.1; }
.bottom-nav__item--create .bottom-nav__label { margin-top:-1.6px; color:var(--gs-danger); }
/* เปิดเมนูอยู่: บวกหมุนเป็นกากบาท บอกว่ากดอีกครั้งเพื่อปิด */
.bottom-nav__item--open .bottom-nav__icon { transform:rotate(45deg); background:var(--gs-ink, #102968); box-shadow:none; }
.bottom-nav__item--open .bottom-nav__label { color:var(--gs-ink, #102968); }
.bottom-nav__item--current:not(.bottom-nav__item--open) .bottom-nav__icon { outline:3px solid var(--gs-danger-tint); }

.create-menu { position:fixed; z-index:1; inset:0; }
.create-menu__backdrop { position:absolute; inset:0; background:rgb(16 41 104 / 35%); }
.create-menu__panel { position:absolute; right:16px; bottom:calc(86px + env(safe-area-inset-bottom)); left:16px; display:grid; gap:10px; padding:12px; border-radius:18px; background:var(--gs-surface); box-shadow:0 16px 40px rgb(16 41 104 / 25%); }
.create-menu__action { display:grid; min-height:68px; grid-template-columns:auto 1fr auto; align-items:center; gap:14px; padding:11px 14px; border:1px solid var(--gs-line); border-radius:14px; color:var(--gs-ink, #102968); text-decoration:none; }
.create-menu__action:active { background:var(--gs-surface-sunken); }
.create-menu__action:focus-visible { outline:3px solid var(--gs-action); outline-offset:2px; }
.create-menu__icon { display:grid; width:44px; height:44px; place-items:center; border-radius:12px; }
.create-menu__icon img { width:26px; height:26px; }
.create-menu__action--report .create-menu__icon { background:var(--gs-danger-tint); }
.create-menu__action--help .create-menu__icon { background:var(--gs-help-tint); }
.create-menu__text { display:grid; gap:2px; min-width:0; }
.create-menu__text strong { font-size:16px; font-weight:750; }
.create-menu__action--report .create-menu__text strong { color:var(--gs-danger); }
.create-menu__action--help .create-menu__text strong { color:var(--gs-help); }
.create-menu__text span { color:var(--gs-muted); font-size:14px; line-height:1.35; }
.create-menu__chevron { width:20px; height:20px; fill:none; stroke:var(--gs-muted); stroke-linecap:round; stroke-linejoin:round; stroke-width:2; }

.create-menu-enter-active, .create-menu-leave-active { transition:opacity .18s ease; }
.create-menu-enter-active .create-menu__panel, .create-menu-leave-active .create-menu__panel { transition:transform .2s ease; }
.create-menu-enter-from, .create-menu-leave-to { opacity:0; }
.create-menu-enter-from .create-menu__panel, .create-menu-leave-to .create-menu__panel { transform:translateY(12px); }
@media (prefers-reduced-motion: reduce) {
  .create-menu-enter-active, .create-menu-leave-active, .create-menu-enter-active .create-menu__panel, .create-menu-leave-active .create-menu__panel, .bottom-nav__item--create .bottom-nav__icon { transition:none; }
}
</style>
