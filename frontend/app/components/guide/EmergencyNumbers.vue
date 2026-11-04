<template>
  <!-- แถบเบอร์ฉุกเฉิน ติดด้านบนตอนเลื่อนหน้า กดแล้วโทรออกได้ทันที -->
  <nav class="emergency-numbers" :aria-label="t('safetyGuidePage.numbersLabel')">
    <a
      v-for="item in emergencyNumbers"
      :key="item.number"
      :href="`tel:${item.number}`"
      class="emergency-numbers__item"
      :aria-label="t('safetyGuidePage.callNumber', { number: item.number, label: t(`safetyGuidePage.numbers.${item.key}`) })"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6.6 3.5 9 3.9l1.3 4.2-1.9 1.4a12 12 0 0 0 6.1 6.1l1.4-1.9 4.2 1.3.4 2.4c.1.8-.5 1.6-1.4 1.7A16.6 16.6 0 0 1 4.9 4.9c.1-.9.9-1.5 1.7-1.4Z"
          fill="none"
          stroke="currentColor"
          stroke-linejoin="round"
          stroke-width="1.8"
        />
      </svg>
      <span class="emergency-numbers__number">{{ item.number }}</span>
      <span class="emergency-numbers__label">{{ t(`safetyGuidePage.numbers.${item.key}`) }}</span>
    </a>
  </nav>
</template>

<script setup>
import { emergencyNumbers } from '~/utils/emergencyGuides'

const { t } = useLocale()
</script>

<style scoped>
.emergency-numbers {
  position: sticky;
  z-index: 5;
  top: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-bottom: 1px solid var(--gs-line);
  background: var(--gs-ink);
}

.emergency-numbers__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-rows: auto auto;
  align-items: center;
  column-gap: 0.5rem;
  min-height: 3.5rem;
  padding: 0.55rem 0.9rem;
  box-sizing: border-box;
  color: #fff;
  text-decoration: none;
  transition: background-color 160ms ease;
}

.emergency-numbers__item + .emergency-numbers__item {
  border-left: 1px solid rgb(255 255 255 / 14%);
}

.emergency-numbers__item:hover {
  background: rgb(255 255 255 / 8%);
}

.emergency-numbers__item:focus-visible {
  outline: 3px solid #f4c542;
  outline-offset: -3px;
}

.emergency-numbers svg {
  grid-row: 1 / 3;
  width: 1.15rem;
  height: 1.15rem;
  color: #f4c542;
}

.emergency-numbers__number {
  font-size: 1.15rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
  letter-spacing: 0.01em;
}

.emergency-numbers__label {
  overflow: hidden;
  color: rgb(255 255 255 / 78%);
  font-size: 0.75rem;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .emergency-numbers {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .emergency-numbers__item:nth-child(3) {
    border-left: 0;
  }

  .emergency-numbers__item:nth-child(n + 3) {
    border-top: 1px solid rgb(255 255 255 / 14%);
  }
}
</style>
