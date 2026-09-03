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
    :class="['app-btn', `app-btn--${variant || 'primary'}`]"
  >
    <slot />
  </button>
</template>

<style scoped>
.app-btn {
  width: 100%;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  border: none;
  cursor: pointer;
  color: #ffffff;
  transition: background-color 0.2s ease, opacity 0.2s ease;
}

.app-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variant: Primary (default) */
.app-btn--primary {
  background-color: #0284c7;
}
.app-btn--primary:hover:not(:disabled) {
  background-color: #0369a1;
}

/* Variant: Danger */
.app-btn--danger {
  background-color: #dc2626;
}
.app-btn--danger:hover:not(:disabled) {
  background-color: #b91c1c;
}

/* Variant: Secondary */
.app-btn--secondary {
  background-color: #475569;
}
.app-btn--secondary:hover:not(:disabled) {
  background-color: #334155;
}
</style>
