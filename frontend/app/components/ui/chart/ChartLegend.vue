<script setup>
// คำอธิบายสีของกราฟ ใช้ config เดียวกับ ChartContainer
import { cn } from '~/lib/utils'

const props = defineProps({
  config: { type: Object, required: true },
  class: { type: [String, Array, Object], default: '' },
})
</script>

<template>
  <ul :class="cn('m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-1 p-0 text-sm text-foreground', props.class)">
    <li v-for="(item, key) in props.config" :key="key" class="flex items-center gap-1.5">
      <span class="h-2.5 w-2.5 shrink-0 rounded-sm" :style="{ background: item.color }" aria-hidden="true" />
      {{ item.label }}
    </li>
  </ul>
</template>
