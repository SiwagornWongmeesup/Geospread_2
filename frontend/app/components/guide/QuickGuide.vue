<template>
  <!-- คู่มือย่อของหมุดที่เลือก: คำสั่งหลักของช่วงระหว่างเกิด + 3 ข้อแรกของ "ทำทันที" -->
  <div class="quick-guide" :class="{ 'quick-guide--compact': compact }">
    <p v-if="guide.quick.summary" class="quick-guide__command">{{ guide.quick.summary }}</p>

    <ol v-if="steps.length" class="quick-guide__steps">
      <li v-for="step in steps" :key="step.title">
        <strong>{{ step.title }}</strong>
        <span v-if="!compact && step.detail">{{ step.detail }}</span>
      </li>
    </ol>

    <div class="quick-guide__actions">
      <a href="tel:1784" class="quick-guide__call" :aria-label="t('quickGuide.callLabel')">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6.6 3.5 9 3.9l1.3 4.2-1.9 1.4a12 12 0 0 0 6.1 6.1l1.4-1.9 4.2 1.3.4 2.4c.1.8-.5 1.6-1.4 1.7A16.6 16.6 0 0 1 4.9 4.9c.1-.9.9-1.5 1.7-1.4Z"
            fill="none"
            stroke="currentColor"
            stroke-linejoin="round"
            stroke-width="1.9"
          />
        </svg>
        {{ t('quickGuide.call') }}
      </a>
      <NuxtLink :to="{ path: '/safety-guide', hash: `#${guide.topic}` }" class="quick-guide__full">
        {{ t('quickGuide.full') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // คู่มือจาก getEmergencyGuideForType()
  guide: { type: Object, required: true },
  // แบบย่อสำหรับแผ่นข้อมูลบนมือถือ: แสดงแค่หัวข้อของขั้นตอน
  compact: { type: Boolean, default: false },
})

const { t } = useLocale()

const steps = computed(() => props.guide.quick.steps.slice(0, 3))
</script>

<style scoped>
.quick-guide__command {
  margin: 0 0 0.6rem;
  padding: 0.6rem 0.75rem;
  border-radius: var(--gs-radius-sm);
  background: #f4c542;
  color: #2b2000;
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.35;
}

.quick-guide__steps {
  display: grid;
  margin: 0 0 0.75rem;
  padding: 0;
  list-style: none;
  counter-reset: quick-step;
}

.quick-guide__steps li {
  display: grid;
  grid-template-columns: 1.6rem minmax(0, 1fr);
  padding: 0.4rem 0;
  counter-increment: quick-step;
}

.quick-guide__steps li + li {
  border-top: 1px solid var(--gs-line);
}

.quick-guide__steps li::before {
  grid-row: 1 / 3;
  content: counter(quick-step);
  color: var(--gs-ink);
  font-size: 1.05rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1.35;
}

.quick-guide__steps strong {
  color: var(--gs-ink);
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.4;
}

.quick-guide__steps span {
  color: var(--gs-muted);
  font-size: 0.8rem;
  line-height: 1.45;
}

.quick-guide__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.quick-guide__call,
.quick-guide__full {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 3rem;
  padding: 0 0.75rem;
  box-sizing: border-box;
  border-radius: var(--gs-radius-sm);
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  transition: background-color 160ms ease, border-color 160ms ease;
}

.quick-guide__call {
  background: var(--gs-danger);
  color: #fff;
}

.quick-guide__call:hover {
  background: var(--gs-danger-hover);
}

.quick-guide__call svg {
  width: 1.05rem;
  height: 1.05rem;
}

.quick-guide__full {
  border: 1px solid var(--gs-line-strong);
  background: var(--gs-surface);
  color: var(--gs-action);
}

.quick-guide__full:hover {
  border-color: var(--gs-action);
}

.quick-guide__call:focus-visible,
.quick-guide__full:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

.quick-guide--compact .quick-guide__command {
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
}

/* มือถือ: เรียงขั้นตอนเป็นแถวเดียว 3 ช่อง ประหยัดความสูงของแผ่นข้อมูล */
.quick-guide--compact .quick-guide__steps {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.quick-guide--compact .quick-guide__steps li {
  grid-template-columns: 1.2rem minmax(0, 1fr);
  padding: 0;
}

.quick-guide--compact .quick-guide__steps li + li {
  border-top: 0;
}

.quick-guide--compact .quick-guide__steps strong {
  font-size: 0.82rem;
}
</style>
