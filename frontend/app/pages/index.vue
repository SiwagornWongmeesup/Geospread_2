<script setup>
import DesktopView from '~/components/pages/index/Desktop.vue'
import MobileView from '~/components/pages/index/Mobile.vue'

definePageMeta({
  showRightPanel: true
})

// This page is the smart controller for the map. Incident fetching and report
// handlers belong here once the planned /incidents endpoint is implemented.
const { isMobile } = useResponsiveView({ syncLayout: true })
</script>

<template>
  <MobileView v-if="isMobile" />
  <DesktopView v-else />
</template>
