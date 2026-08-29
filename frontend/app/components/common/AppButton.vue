<script setup lang="ts">
defineProps<{
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'danger' | 'secondary';
  disabled?: boolean;
}>();
</script>

<template>
  <button
    :type="type || 'button'"
    :disabled="disabled"
    :class="[
      'w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white',
      variant === 'danger' ? 'bg-red-600 hover:bg-red-700' :
      variant === 'secondary' ? 'bg-gray-600 hover:bg-gray-700' :
      'bg-sky-600 hover:bg-sky-700'
    ]"
    style="padding: 10px 16px; border-radius: 6px; font-weight: 500; border: none; cursor: pointer; color: white;"
    :style="{
      backgroundColor: disabled ? '#94a3b8' : (variant === 'danger' ? '#dc2626' : (variant === 'secondary' ? '#475569' : '#0284c7'))
    }"
  >
    <slot />
  </button>
</template>
