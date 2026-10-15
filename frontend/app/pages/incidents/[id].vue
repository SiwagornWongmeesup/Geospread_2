<script setup>
import { computed } from 'vue'
import IncidentDetail from '~/components/incidents/IncidentDetail.vue'

definePageMeta({ showRightPanel: false })

const route = useRoute()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:5000'
const { userLocation } = useHomeDashboard()
const pendingReportId = computed(() => String(route.params.id || '').match(/^report-(\d+)$/)?.[1] || null)
const helpRequestId = computed(() => String(route.params.id || '').match(/^help-(\d+)$/)?.[1] || null)
const isHelpRequest = computed(() => Boolean(helpRequestId.value))

const { data: response, status, error } = await useAsyncData(
  () => `incident-detail-${route.params.id}`,
  () => $fetch(helpRequestId.value
    ? `${apiBase}/help-requests/${helpRequestId.value}`
    : pendingReportId.value
      ? `${apiBase}/incidents/reports/${pendingReportId.value}`
      : `${apiBase}/incidents/${route.params.id}`),
  { watch: [() => route.params.id] },
)

const incident = computed(() => {
  const data = response.value?.data
  if (!data || !isHelpRequest.value) return data || null
  return {
    ...data,
    incident_id: data.help_request_id,
    image_url: null,
    display_mode: 'marker',
    marker_color: '#f97316',
    type_code: null,
    icon_name: null,
    radius_m: null,
    verification_status: 'pending',
    incident_status: 'active',
    report_count: 1,
    first_reported_at: data.created_at,
    last_reported_at: data.created_at,
    reports: [],
  }
})
</script>

<template>
  <IncidentDetail
    :incident="incident"
    :is-help-request="isHelpRequest"
    :is-loading="status === 'pending'"
    :is-error="Boolean(error)"
    :user-location="userLocation"
    @back="navigateTo('/')"
  />
</template>
