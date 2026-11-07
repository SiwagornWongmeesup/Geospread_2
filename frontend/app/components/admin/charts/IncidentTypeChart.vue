<script setup>
// ใช้ได้เฉพาะฝั่งเบราว์เซอร์: ให้ครอบด้วย <ClientOnly> และโหลดแบบ defineAsyncComponent
// กราฟโดนัทสัดส่วนประเภทเหตุการณ์ ใช้ Unovis ผ่าน ChartContainer แบบ shadcn-vue
// data: [{ label, count, percent, icon, color }]
import { computed } from 'vue'
import { Donut } from '@unovis/ts'
import { VisDonut, VisSingleContainer, VisTooltip } from '@unovis/vue'
import ChartContainer from '~/components/ui/chart/ChartContainer.vue'
import { chartTooltip } from '~/lib/chart'

const props = defineProps({
  data: { type: Array, required: true },
  centralLabel: { type: String, default: '' },
  centralSubLabel: { type: String, default: '' },
  size: { type: Number, default: 140 },
})

const config = computed(() => Object.fromEntries(
  props.data.map((item, index) => [`type${index}`, { label: item.label, color: item.color }]),
))

const value = (d) => d.count
const color = (_, index) => `var(--color-type${index})`

const triggers = {
  [Donut.selectors.segment]: (segment) => chartTooltip('', [{
    label: segment.data.label,
    value: `${segment.data.count} (${segment.data.percent}%)`,
    color: segment.data.color,
  }]),
}
</script>

<template>
  <ChartContainer :config="config" class="flex flex-wrap items-center gap-4">
    <VisSingleContainer :data="data" :height="size" :style="{ width: `${size}px` }" class="shrink-0">
      <VisDonut
        :value="value"
        :color="color"
        :arc-width="20"
        :pad-angle="0.02"
        :corner-radius="3"
        :central-label="centralLabel"
        :central-sub-label="centralSubLabel"
      />
      <VisTooltip :triggers="triggers" />
    </VisSingleContainer>

    <ul class="m-0 grid min-w-[160px] flex-1 list-none gap-1.5 p-0">
      <li
        v-for="item in data"
        :key="item.label"
        class="grid grid-cols-[10px_16px_minmax(0,1fr)_auto] items-center gap-2 text-xs text-muted-foreground"
      >
        <span class="h-2.5 w-2.5 rounded-sm" :style="{ background: item.color }" aria-hidden="true" />
        <img :src="item.icon" alt="" class="h-4 w-4" />
        <span class="truncate">{{ item.label }}</span>
        <span class="tabular-nums">
          <b class="font-bold text-foreground">{{ item.count }}</b>
          <small class="ml-1">({{ item.percent }}%)</small>
        </span>
      </li>
    </ul>
  </ChartContainer>
</template>
