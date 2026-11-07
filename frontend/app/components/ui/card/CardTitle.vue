<script setup>
import { cn } from '~/lib/utils'

const props = defineProps({ class: { type: [String, Array, Object], default: '' } })
</script>

<template>
  <h3 :class="cn('text-base font-bold leading-tight text-card-foreground', props.class)">
    <slot />
  </h3>
</template>
