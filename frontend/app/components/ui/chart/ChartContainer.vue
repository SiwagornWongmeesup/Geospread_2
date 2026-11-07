<script setup>
// กรอบของกราฟแบบ shadcn-vue: รับ config ของแต่ละชุดข้อมูล ({ key: { label, color } })
// แล้วสร้างตัวแปร --color-<key> ให้กราฟ Unovis และ legend ใช้สีเดียวกัน
// พร้อมตั้งธีมของ Unovis (แกน, เส้นตาราง, tooltip) ให้เข้ากับโทเคน --gs-*
import { computed } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps({
  config: { type: Object, required: true },
  class: { type: [String, Array, Object], default: '' },
})

const colorVars = computed(() => Object.fromEntries(
  Object.entries(props.config).map(([key, item]) => [`--color-${key}`, item.color]),
))
</script>

<template>
  <div :class="cn('gs-chart w-full text-xs', props.class)" :style="colorVars">
    <slot />
  </div>
</template>

<style scoped>
.gs-chart {
  --vis-font-family: var(--gs-font);
  --vis-color-main: var(--gs-action);
  --vis-axis-tick-label-color: var(--gs-muted);
  --vis-axis-tick-label-font-size: 11px;
  --vis-axis-grid-color: var(--gs-line);
  --vis-axis-tick-color: transparent;
  --vis-axis-domain-color: var(--gs-line);
  --vis-crosshair-line-stroke-color: var(--gs-line-strong);
  --vis-tooltip-background-color: var(--gs-surface);
  --vis-tooltip-border-color: var(--gs-line);
  --vis-tooltip-text-color: var(--gs-ink);
  --vis-tooltip-padding: 8px 10px;
  --vis-tooltip-border-radius: var(--gs-radius-sm);
  --vis-tooltip-shadow-color: rgb(23 32 46 / 14%);
  --vis-donut-background-color: var(--gs-surface-sunken);
  --vis-donut-central-label-font-size: 22px;
  --vis-donut-central-label-font-weight: 800;
  --vis-donut-central-label-text-color: var(--gs-ink);
  --vis-donut-central-sub-label-text-color: var(--gs-muted);
  --vis-donut-central-sub-label-font-size: 11px;
}
</style>
