<template>
  <section :id="topic" class="guide-topic" :class="{ 'guide-topic--open': isOpen }">
    <h3 class="guide-topic__heading">
      <button
        type="button"
        class="guide-topic__toggle"
        :aria-expanded="guide ? isOpen : undefined"
        :aria-controls="guide ? panelId : undefined"
        :disabled="!guide"
        @click="$emit('toggle', topic)"
      >
        <span class="guide-topic__name">{{ t(`guideTopics.${topic}`) }}</span>
        <span class="guide-topic__summary">{{ guide ? guide.summary : t('safetyGuidePage.comingSoon') }}</span>
        <svg v-if="guide" class="guide-topic__chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
        </svg>
      </button>
    </h3>

    <div v-if="guide && isOpen" :id="panelId" class="guide-topic__body">
      <!-- แท็บ ก่อน / ระหว่าง / หลัง ใช้ลูกศรซ้ายขวาเลื่อนแท็บได้ -->
      <div
        class="guide-topic__tabs"
        role="tablist"
        :aria-label="t('safetyGuidePage.phasesLabel', { topic: t(`guideTopics.${topic}`) })"
        @keydown="onTabKeydown"
      >
        <button
          v-for="item in guide.phases"
          :id="`${panelId}-tab-${item.key}`"
          :key="item.key"
          ref="tabButtons"
          type="button"
          role="tab"
          class="guide-topic__tab"
          :aria-selected="item.key === activePhase.key"
          :aria-controls="`${panelId}-panel`"
          :tabindex="item.key === activePhase.key ? 0 : -1"
          @click="$emit('select-phase', topic, item.key)"
        >
          {{ t(`safetyGuidePage.phases.${item.key}`) }}
        </button>
      </div>

      <div
        :id="`${panelId}-panel`"
        class="guide-topic__panel"
        role="tabpanel"
        :aria-labelledby="`${panelId}-tab-${activePhase.key}`"
      >
        <p v-if="activePhase.summary" class="guide-topic__command">
          <template v-for="(word, index) in commandWords" :key="word">
            <span v-if="index" class="guide-topic__command-dot" aria-hidden="true"></span>
            <span>{{ word }}</span>
          </template>
        </p>
        <!-- เนื้อหามาจากไฟล์ data/guides/*.md ของโปรเจกต์เอง แปลงใน utils/emergencyGuides.js -->
        <div class="guide-content" v-html="activePhase.html"></div>
      </div>

      <p v-if="guide.references.length" class="guide-topic__references">
        {{ t('safetyGuidePage.references') }} {{ guide.references.join(' · ') }}.
        {{ t('safetyGuidePage.referencesNote') }}
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'

const props = defineProps({
  topic: { type: String, required: true },
  // คู่มือที่แปลงแล้ว (null = ยังไม่มีไฟล์ .md)
  guide: { type: Object, default: null },
  isOpen: { type: Boolean, default: false },
  phase: { type: String, default: 'during' },
})

const emit = defineEmits(['toggle', 'select-phase'])

const { t } = useLocale()
const tabButtons = ref([])

const panelId = computed(() => `guide-${props.topic}`)

const activePhase = computed(() => {
  const phases = props.guide?.phases ?? []
  return phases.find((item) => item.key === props.phase) ?? phases[0] ?? { key: '', summary: '', html: '' }
})

const commandWords = computed(() => activePhase.value.summary.split('·').map((word) => word.trim()).filter(Boolean))

const onTabKeydown = async (event) => {
  const keys = { ArrowRight: 1, ArrowLeft: -1 }
  if (!(event.key in keys) && event.key !== 'Home' && event.key !== 'End') return
  event.preventDefault()

  const phases = props.guide.phases
  const current = phases.findIndex((item) => item.key === activePhase.value.key)
  let next = current + (keys[event.key] ?? 0)
  if (event.key === 'Home') next = 0
  if (event.key === 'End') next = phases.length - 1
  next = (next + phases.length) % phases.length

  emit('select-phase', props.topic, phases[next].key)
  await nextTick()
  tabButtons.value[next]?.focus()
}
</script>

<style scoped>
.guide-topic {
  border-top: 1px solid var(--gs-line);
  scroll-margin-top: 8rem;
}

.guide-topic__heading {
  margin: 0;
}

.guide-topic__toggle {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 1rem;
  width: 100%;
  min-height: 4rem;
  padding: 0.85rem 0.25rem;
  border: 0;
  background: transparent;
  color: var(--gs-ink);
  text-align: left;
  cursor: pointer;
}

.guide-topic__toggle:disabled {
  cursor: default;
}

.guide-topic__toggle:focus-visible {
  border-radius: var(--gs-radius-sm);
  outline: none;
  box-shadow: var(--gs-focus);
}

.guide-topic__name {
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.4;
}

.guide-topic__summary {
  grid-row: 2;
  margin-top: 0.15rem;
  color: var(--gs-muted);
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.45;
}

.guide-topic__toggle:disabled .guide-topic__name {
  color: var(--gs-muted);
}

.guide-topic__toggle:disabled .guide-topic__summary {
  font-weight: 400;
  font-style: italic;
}

.guide-topic__chevron {
  grid-row: 1 / 3;
  grid-column: 2;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--gs-muted);
  transition: transform 200ms ease;
}

.guide-topic--open .guide-topic__chevron {
  transform: rotate(180deg);
}

.guide-topic__body {
  padding: 0 0.25rem 1.75rem;
}

.guide-topic__tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-bottom: 1px solid var(--gs-line-strong);
}

.guide-topic__tab {
  min-height: 3rem;
  padding: 0.5rem;
  border: 0;
  background: transparent;
  color: var(--gs-muted);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 150ms ease, box-shadow 150ms ease;
}

.guide-topic__tab:hover {
  color: var(--gs-ink);
}

.guide-topic__tab[aria-selected='true'] {
  color: var(--gs-ink);
  box-shadow: inset 0 -3px 0 var(--gs-ink);
}

.guide-topic__tab:focus-visible {
  border-radius: var(--gs-radius-sm) var(--gs-radius-sm) 0 0;
  outline: none;
  box-shadow: var(--gs-focus);
}

/* คำสั่งหลัก 3 คำ: แถบเหลืองเตือนภัยจุดเดียวของหน้า ให้คนที่รีบอ่านแค่ตรงนี้ก็พอ */
.guide-topic__command {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.75rem;
  margin: 1.25rem 0 0.5rem;
  padding: 1rem 1.15rem;
  border-radius: var(--gs-radius-sm);
  background: #f4c542;
  color: #2b2000;
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1.25;
  text-wrap: balance;
}

.guide-topic__command-dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.55;
}

.guide-topic__references {
  max-width: 65ch;
  margin: 1.75rem 0 0;
  color: var(--gs-muted);
  font-size: 0.8rem;
  line-height: 1.6;
}

/* ===== เนื้อหาที่แปลงจาก Markdown ===== */
.guide-content {
  max-width: 44rem;
}

.guide-content :deep(h4) {
  margin: 2rem 0 0.25rem;
  color: var(--gs-ink-2);
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.4;
}

.guide-content :deep(p) {
  margin: 0.5rem 0;
  color: var(--gs-ink-2);
  line-height: 1.65;
}

.guide-content :deep(.guide-list) {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* ขั้นตอน: ตัวเลขใหญ่ หัวข้อตัวหนาบรรทัดบน คำอธิบายเล็กบรรทัดล่าง */
.guide-content :deep(.guide-list--steps) {
  counter-reset: guide-step;
}

.guide-content :deep(.guide-list--steps > li) {
  display: grid;
  grid-template-columns: 2.75rem minmax(0, 1fr);
  padding: 0.8rem 0;
  counter-increment: guide-step;
}

.guide-content :deep(.guide-list--steps > li + li) {
  border-top: 1px solid var(--gs-line);
}

.guide-content :deep(.guide-list--steps > li)::before {
  grid-row: 1 / 3;
  content: counter(guide-step);
  color: var(--gs-ink);
  font-size: 1.75rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.guide-content :deep(.guide-item__title) {
  display: block;
  color: var(--gs-ink);
  font-size: 1.02rem;
  font-weight: 700;
  line-height: 1.4;
}

.guide-content :deep(.guide-item__detail) {
  display: block;
  margin-top: 0.15rem;
  color: var(--gs-muted);
  font-size: 0.9rem;
  line-height: 1.55;
}

.guide-content :deep(.guide-list--points > li) {
  position: relative;
  padding: 0.4rem 0 0.4rem 1.1rem;
  color: var(--gs-ink-2);
  line-height: 1.6;
}

.guide-content :deep(.guide-list--points > li)::before {
  position: absolute;
  top: 1.05em;
  left: 0.15rem;
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 1px;
  background: var(--gs-ink-2);
  content: '';
}

.guide-content :deep(.guide-list--points .guide-item__title) {
  display: inline;
}

.guide-content :deep(.guide-list--points .guide-item__detail) {
  display: inline;
  margin: 0 0 0 0.3rem;
}

/* ห้ามทำ: แดงใช้เฉพาะส่วนนี้ */
.guide-content :deep(.guide-dont) {
  margin-top: 1.75rem;
  padding: 0.25rem 1.1rem 0.75rem;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-danger-tint);
}

.guide-content :deep(.guide-dont h4) {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.85rem;
  color: var(--gs-danger);
  font-size: 0.95rem;
}

.guide-content :deep(.guide-dont h4)::before {
  width: 1.1rem;
  height: 1.1rem;
  background: currentColor;
  content: '';
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='m5.7 5.7 12.6 12.6'/%3E%3C/svg%3E") center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='m5.7 5.7 12.6 12.6'/%3E%3C/svg%3E") center / contain no-repeat;
}

.guide-content :deep(.guide-dont .guide-list--points > li) {
  padding-left: 1.5rem;
  color: var(--gs-ink);
}

.guide-content :deep(.guide-dont .guide-list--points > li)::before {
  top: 0.62em;
  left: 0;
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 0;
  background: var(--gs-danger);
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='m6 6 12 12M18 6 6 18'/%3E%3C/svg%3E") center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='m6 6 12 12M18 6 6 18'/%3E%3C/svg%3E") center / contain no-repeat;
}

@media (prefers-reduced-motion: reduce) {
  .guide-topic__chevron,
  .guide-topic__tab {
    transition: none;
  }
}
</style>
