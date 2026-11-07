<script setup>
// ใช้ได้เฉพาะฝั่งเบราว์เซอร์: ให้ครอบด้วย <ClientOnly> และโหลดแบบ defineAsyncComponent
// กราฟแท่งเหตุการณ์รายวัน (แยกตามสถานะ) ใช้ Unovis ผ่าน ChartContainer แบบ shadcn-vue
// data: [{ label: 'วันนี้', total, verified, pending, rejected }]
// config: { total: { label, color }, ... } — ลำดับ key คือลำดับแท่งในแต่ละวัน
import { computed } from 'vue'
import { VisAxis, VisCrosshair, VisGroupedBar, VisTooltip, VisXYContainer } from '@unovis/vue'
import ChartContainer from '~/components/ui/chart/ChartContainer.vue'
import ChartLegend from '~/components/ui/chart/ChartLegend.vue'
import { chartTooltip } from '~/lib/chart'

const props = defineProps({
  data: { type: Array, required: true },
  config: { type: Object, required: true },
  height: { type: Number, default: 180 },
})

const keys = computed(() => Object.keys(props.config))

const x = (_, index) => index
const y = computed(() => keys.value.map((key) => (d) => d[key]))
const color = (_, index) => `var(--color-${keys.value[index]})`
const tickValues = computed(() => props.data.map((_, index) => index))
const tickFormat = (index) => props.data[index]?.label ?? ''

const tooltip = (d) => chartTooltip(d.label, keys.value.map((key) => ({
  label: props.config[key].label,
  value: d[key],
  color: props.config[key].color,
})))
</script>

<template>
  <ChartContainer :config="config" class="grid gap-3">
    <VisXYContainer :data="data" :height="height" :padding="{ top: 8 }">
      <VisGroupedBar :x="x" :y="y" :color="color" :rounded-corners="3" :group-padding="0.28" :bar-padding="0.12" />
      <VisAxis type="x" :tick-values="tickValues" :tick-format="tickFormat" :grid-line="false" :tick-line="false" />
      <VisAxis type="y" :num-ticks="4" :domain-line="false" :tick-line="false" />
      <VisCrosshair :template="tooltip" :color="() => 'transparent'" />
      <VisTooltip />
    </VisXYContainer>
    <ChartLegend :config="config" />
  </ChartContainer>
</template>
