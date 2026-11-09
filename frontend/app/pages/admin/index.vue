<script setup>
// แดชบอร์ดผู้ดูแลระบบ: หน้านี้เป็นตัวดึงข้อมูล (GET /incidents/admin/overview) แล้วส่งให้ AdminDashboard แสดงผล
definePageMeta({ layout: 'admin', middleware: ['admin'] })

const { overview, isLoading, errorKey, loadOverview } = useAdminOverview()

// ดึงในเบราว์เซอร์ เพราะต้องใช้ token ของแอดมินที่ล็อกอินอยู่
onMounted(loadOverview)
</script>

<template>
  <AdminDashboard :overview="overview" :is-loading="isLoading" :error-key="errorKey" @retry="loadOverview" />
</template>
