<script setup>
// หน้าจัดการผู้ใช้ของแอดมิน: หน้านี้เป็นตัวดึงข้อมูล (GET /users) แล้วส่งให้ AdminUsersTrust แสดงผล
definePageMeta({ layout: 'admin', middleware: ['admin'] })

const { users, isLoading, errorKey, loadUsers } = useAdminUsers()

// ดึงในเบราว์เซอร์ เพราะต้องใช้ token ของแอดมินที่ล็อกอินอยู่
onMounted(loadUsers)
</script>

<template>
  <AdminUsersTrust :users="users" :is-loading="isLoading" :error-key="errorKey" @retry="loadUsers" />
</template>
