<script setup>
import { guideCategories } from '~/utils/emergencyGuides';
import { menuGroups, accountItems } from '~/utils/navMenu';

const route = useRoute();
const { t } = useLocale();

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle']);

const guideMenuOpen = ref(route.path === '/safety-guide');

// หัวข้อใหญ่ของคู่มือ แต่ละหัวข้อกดเปิด/ปิดหัวข้อย่อยได้ (หัวข้อย่อยลิงก์ไป /safety-guide#id)
// รายการหมวดอยู่ที่ utils/emergencyGuides.js ใช้ร่วมกับหน้าคู่มือ

const openGuideCategories = ref(new Set([guideCategories[0].id]));

const toggleGuideCategory = (id) => {
  const next = new Set(openGuideCategories.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  openGuideCategories.value = next;
};

// hash ของ URL (#flood) ใช้ไฮไลต์หัวข้อย่อย และเปิดหัวข้อใหญ่ที่มีหัวข้อย่อยนั้นไว้ให้
// อ่านหลัง mount เท่านั้น เพราะตอน SSR เซิร์ฟเวอร์ไม่รู้ hash ถ้าอ่านตรงๆ class จะไม่ตรงกันตอน hydrate
const currentGuideHash = ref('');

const openGuideCategoryForHash = () => {
  currentGuideHash.value = route.hash;
  const category = guideCategories.find((item) => item.topics.some((topic) => route.hash === `#${topic}`));
  if (!category || openGuideCategories.value.has(category.id)) return;
  openGuideCategories.value = new Set([...openGuideCategories.value, category.id]);
};

onMounted(openGuideCategoryForHash);
watch(() => route.hash, openGuideCategoryForHash);

// รายการเมนูอยู่ที่ utils/navMenu.js ใช้ร่วมกับหน้าโปรไฟล์บนมือถือ
</script>

<template>
  <aside class="app-sidebar" :class="{ 'app-sidebar--collapsed': collapsed }">
    <!-- โลโก้อยู่บนสุดของ sidebar (ย้ายมาจาก header) ตอนพับจะเหลือแค่รูปโลโก้ -->
    <div class="app-sidebar__topbar">
      <NuxtLink to="/" class="app-sidebar__brand" :aria-label="t('brand.homeLink')">
        <img src="/logos/logo.png" alt="" class="app-sidebar__logo" />

        <span v-if="!collapsed" class="app-sidebar__brand-text">
          <span class="app-sidebar__brand-name">GeoSpread</span>
        </span>
      </NuxtLink>

      <button
        type="button"
        class="app-sidebar__toggle"
        :aria-label="collapsed ? t('common.expandMenu') : t('common.collapseMenu')"
        :title="collapsed ? t('common.expandMenu') : t('common.collapseMenu')"
        @click="emit('toggle')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
    </div>

    <nav class="app-sidebar__navigation" :aria-label="t('nav.navigation')">
      <section
        v-for="group in menuGroups"
        :key="group.label"
        class="app-sidebar__group"
        :class="{ 'app-sidebar__group--actions': group.kind === 'actions' }"
      >
        <h2 v-if="!collapsed" class="app-sidebar__group-title">
          {{ t(group.label) }}
        </h2>

        <template v-for="item in group.items" :key="item.to">
          <div v-if="item.kind === 'guide' && !collapsed" class="app-sidebar__guide-menu">
            <button
              type="button"
              class="app-sidebar__link app-sidebar__guide-toggle"
              :class="{ 'app-sidebar__link--guide-active': route.path === item.to }"
              :aria-expanded="guideMenuOpen"
              aria-controls="safety-guide-submenu"
              @click="guideMenuOpen = !guideMenuOpen"
            >
              <span class="app-sidebar__icon" aria-hidden="true">
                <img :src="item.icon" alt="" />
              </span>

              <span class="app-sidebar__link-label">{{ t(item.label) }}</span>

              <svg class="app-sidebar__guide-chevron" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7 9 5 5 5-5" />
              </svg>
            </button>

            <Transition name="guide-submenu">
              <div v-if="guideMenuOpen" id="safety-guide-submenu" class="app-sidebar__guide-submenu">
                <div class="app-sidebar__guide-submenu-content">
                  <div v-for="category in guideCategories" :key="category.id" class="app-sidebar__guide-category">
                    <button
                      type="button"
                      class="app-sidebar__guide-category-toggle"
                      :aria-expanded="openGuideCategories.has(category.id)"
                      :aria-controls="`guide-category-${category.id}`"
                      @click="toggleGuideCategory(category.id)"
                    >
                      <span>{{ t(`guideCategories.${category.id}`) }}</span>
                      <svg class="app-sidebar__guide-chevron" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m7 9 5 5 5-5" />
                      </svg>
                    </button>

                    <Transition name="guide-submenu">
                      <div
                        v-if="openGuideCategories.has(category.id)"
                        :id="`guide-category-${category.id}`"
                        class="app-sidebar__guide-submenu"
                      >
                        <div class="app-sidebar__guide-submenu-content">
                          <NuxtLink
                            v-for="topic in category.topics"
                            :key="topic"
                            :to="{ path: '/safety-guide', hash: `#${topic}` }"
                            class="app-sidebar__guide-link"
                            :class="{ 'app-sidebar__guide-link--current': currentGuideHash === `#${topic}` }"
                          >
                            <span class="app-sidebar__guide-dot" aria-hidden="true"></span>
                            <span>{{ t(`guideTopics.${topic}`) }}</span>
                          </NuxtLink>
                        </div>
                      </div>
                    </Transition>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <NuxtLink
            v-else
            :to="item.to"
            class="app-sidebar__link"
            :class="[{ 'app-sidebar__link--action': group.kind === 'actions' }, item.tone && `app-sidebar__link--${item.tone}`]"
            :aria-label="t(item.label)"
            :title="collapsed ? t(item.label) : undefined"
          >
            <span class="app-sidebar__icon" aria-hidden="true">
              <img :src="item.icon" alt="" />
            </span>

            <span v-if="!collapsed" class="app-sidebar__link-label">
              {{ t(item.label) }}
            </span>

            <span v-if="item.badge" class="app-sidebar__badge">
              {{ item.badge }}
            </span>
          </NuxtLink>
        </template>
      </section>
    </nav>

    <div class="app-sidebar__account">
      <NuxtLink
        v-for="item in accountItems"
        :key="item.to"
        :to="item.to"
        class="app-sidebar__link"
        :aria-label="t(item.label)"
        :title="collapsed ? t(item.label) : undefined"
      >
        <span class="app-sidebar__icon" aria-hidden="true">
          <img :src="item.icon" alt="" />
        </span>

        <span v-if="!collapsed" class="app-sidebar__link-label">
          {{ t(item.label) }}
        </span>
      </NuxtLink>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  display: flex;
  align-self: stretch;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-height: 0;
  padding: 16px 12px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  border-right: 1px solid var(--gs-line);
  background: var(--gs-surface);
}

.app-sidebar__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 56px;
  padding: 0 4px 12px 4px;
  border-bottom: 1px solid var(--gs-line);
}

.app-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  text-decoration: none;
}

/* ไฟล์ logo.png มีพื้นที่ว่างรอบรูปเยอะ จึงต้องตั้งขนาดใหญ่กว่าที่เห็นจริง */
.app-sidebar__logo {
  width: 76px;
  height: 76px;
  margin: -14px -12px -14px -14px;
  flex: 0 0 auto;
  object-fit: contain;
}

.app-sidebar__brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.1;
}

.app-sidebar__brand-name {
  color: var(--gs-ink);
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.6px;
}

.app-sidebar__brand-tagline {
  margin-top: 2px;
  overflow: hidden;
  color: var(--gs-muted);
  font-size: 12px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-sidebar__toggle {
  display: grid;
  width: 34px;
  height: 34px;
  padding: 0;
  cursor: pointer;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--gs-ink-2);
}

.app-sidebar__toggle:hover {
  background: var(--gs-action-tint);
  color: var(--gs-action);
}

.app-sidebar__toggle:focus-visible {
  outline: 3px solid rgb(29 53 87 / 30%);
  outline-offset: 2px;
}

.app-sidebar__toggle svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
  transition: transform 180ms ease;
}

.app-sidebar__navigation {
  display: grid;
  gap: 20px;
}

.app-sidebar__group {
  display: grid;
  gap: 4px;
}

.app-sidebar__group-title {
  margin: 0 0 6px;
  padding: 0 12px;
  color: var(--gs-muted);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.app-sidebar__group--actions {
  gap: 6px;
  padding: 12px 0;
  border-top: 1px solid var(--gs-line);
  border-bottom: 1px solid var(--gs-line);
}

.app-sidebar__group--actions .app-sidebar__group-title {
  margin-bottom: 3px;
}

.app-sidebar__link {
  display: flex;
  position: relative;
  align-items: center;
  gap: 12px;
  min-height: 42px;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: var(--gs-radius-sm);
  color: var(--gs-ink-2);
  font-size: 14px;
  font-weight: 650;
  line-height: 1.2;
  text-decoration: none;
  transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease,
    box-shadow 160ms ease;
}

.app-sidebar__link:hover {
  background: var(--gs-action-tint);
  color: var(--gs-action);
}

.app-sidebar__link:focus-visible {
  outline: 3px solid rgb(29 53 87 / 30%);
  outline-offset: 2px;
}

.app-sidebar__link--action {
  border-color: var(--gs-line);
  background: var(--gs-surface);
  color: var(--gs-ink);
}

.app-sidebar__link--report:hover {
  border-color: #efc2c0;
  background: var(--gs-danger-tint);
  color: var(--gs-danger-hover);
}

.app-sidebar__link--help:hover {
  border-color: #b7d9d1;
  background: var(--gs-help-tint);
  color: var(--gs-help-hover);
}

.app-sidebar__guide-menu {
  display: grid;
  gap: 2px;
}

.app-sidebar__guide-toggle {
  width: 100%;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.app-sidebar__link--guide-active {
  background: var(--gs-action-tint);
  color: var(--gs-action);
}

.app-sidebar__guide-category {
  display: grid;
}

/* หัวข้อใหญ่ในคู่มือ: ตัวเล็กกว่าเมนูหลัก เยื้องเข้าให้ตรงกับข้อความของเมนู */
.app-sidebar__guide-category-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 34px;
  padding: 6px 10px 6px 38px;
  cursor: pointer;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--gs-ink);
  font: inherit;
  font-size: 13px;
  font-weight: 750;
  text-align: left;
  transition: background-color 160ms ease, color 160ms ease;
}

.app-sidebar__guide-category-toggle:hover {
  background: var(--gs-action-tint);
  color: var(--gs-action);
}

.app-sidebar__guide-category-toggle:focus-visible {
  outline: 3px solid rgb(29 53 87 / 30%);
  outline-offset: 2px;
}

.app-sidebar__guide-category-toggle[aria-expanded='true'] .app-sidebar__guide-chevron {
  transform: rotate(180deg);
}

/* หัวข้อย่อยในหัวข้อใหญ่ เยื้องลึกกว่าหัวข้อใหญ่อีกขั้น */
.app-sidebar__guide-category .app-sidebar__guide-link {
  padding-left: 48px;
}

.app-sidebar__guide-chevron {
  width: 18px;
  height: 18px;
  margin-left: auto;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.app-sidebar__guide-toggle[aria-expanded='true'] .app-sidebar__guide-chevron {
  transform: rotate(180deg);
}

.app-sidebar__guide-submenu {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 220ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 180ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.app-sidebar__guide-submenu-content {
  display: grid;
  min-height: 0;
  gap: 1.6px;
  overflow: hidden;
  padding: 1.6px 0 4px;
}

.app-sidebar__guide-link {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 32px;
  padding: 6px 10px 6px 38px;
  border-radius: 9px;
  color: var(--gs-muted);
  font-size: 13px;
  font-weight: 650;
  line-height: 1.25;
  text-decoration: none;
  transition: background-color 160ms ease, color 160ms ease;
}

.app-sidebar__guide-link:hover,
.app-sidebar__guide-link--current {
  background: var(--gs-action-tint);
  color: var(--gs-action);
}

.app-sidebar__guide-link:focus-visible {
  outline: 3px solid rgb(29 53 87 / 30%);
  outline-offset: 2px;
}

.app-sidebar__guide-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.72;
}

.guide-submenu-enter-from,
.guide-submenu-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .app-sidebar__guide-chevron,
  .app-sidebar__guide-submenu {
    transition: none;
  }
}

.app-sidebar__link.router-link-exact-active {
  border-color: var(--gs-action);
  background: var(--gs-action);
  color: #ffffff;

}

.app-sidebar__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
}

.app-sidebar__icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.05)); /* เพิ่มมิติให้รูปดูชัดเจนขึ้นนิดหน่อย */
}

.app-sidebar__link-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-sidebar__badge {
  display: grid;
  flex: 0 0 auto;
  min-width: 21px;
  height: 21px;
  margin-left: auto;
  padding: 0 4px;
  place-items: center;
  border: 2px solid #ffffff;
  border-radius: 999px;
  background: var(--gs-danger);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
}

.app-sidebar__link.router-link-exact-active .app-sidebar__badge {
  border-color: var(--gs-action);
  background: var(--gs-surface);
  color: var(--gs-action);
}

.app-sidebar__account {
  display: grid;
  gap: 4px;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--gs-line);
}

.app-sidebar--collapsed {
  align-items: stretch;
  padding-right: 10px;
  padding-left: 10px;
}

/* ตอนพับ: วางโลโก้กับปุ่มขยายเรียงลงมา เพราะความกว้างไม่พอวางข้างกัน */
.app-sidebar--collapsed .app-sidebar__topbar {
  flex-direction: column;
  justify-content: center;
  padding: 0 0 12px;
}

.app-sidebar--collapsed .app-sidebar__logo {
  width: 56px;
  height: 56px;
  margin: -6px 0;
}

.app-sidebar--collapsed .app-sidebar__toggle svg {
  transform: rotate(180deg);
}

.app-sidebar--collapsed .app-sidebar__navigation {
  gap: 16px;
}

.app-sidebar--collapsed .app-sidebar__group {
  justify-items: center;
}

.app-sidebar--collapsed .app-sidebar__group--actions {
  width: 100%;
  padding: 11px 0;
}

.app-sidebar--collapsed .app-sidebar__link {
  justify-content: center;
  width: 42px;
  padding: 8px;
}

.app-sidebar--collapsed .app-sidebar__badge {
  position: absolute;
  top: 2px;
  right: 1.6px;
  min-width: 18px;
  height: 18px;
  padding: 0;
  border-width: 1.5px;
  font-size: 11px;
}

.app-sidebar--collapsed .app-sidebar__account {
  justify-items: center;
}

@media (max-width: 768px) {
  .app-sidebar {
    gap: 12px;
  }

  .app-sidebar__navigation {
    gap: 14px;
  }

  .app-sidebar__link {
    min-height: 40px;
  }
}
</style>
