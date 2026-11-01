<script setup>
import { useState } from '#app'
import AdminSidebar from '~/components/layout/AdminSidebar.vue'
import AdminTopbar from '~/components/layout/AdminTopbar.vue'

const sidebarCollapsed = useState('adminSidebarCollapsed', () => false)
</script>

<template>
  <main class="admin-shell" :class="{ 'admin-shell--sidebar-collapsed': sidebarCollapsed }">
    <AdminSidebar />
    <section class="workspace">
      <AdminTopbar />
      <div class="content"><slot /></div>
    </section>
  </main>
</template>

<style scoped>
:global(*){box-sizing:border-box}:global(body){margin:0;background:#f5f9ff;color:#102968;font-family:var(--bs-font-sans-serif)}:global(button),:global(input){font:inherit}
.admin-shell{display:grid;min-height:100vh;grid-template-columns:14.2rem minmax(0,1fr);background:#f7fbff}.admin-shell--sidebar-collapsed{grid-template-columns:4.65rem minmax(0,1fr)}.workspace{min-width:0}.content{width:min(100% - 2.4rem,100rem);margin:0 auto;padding:1rem 0 2rem}
@media(max-width:68rem){.admin-shell{grid-template-columns:4.4rem minmax(0,1fr)}}@media(max-width:47rem){.admin-shell{display:block}.content{width:min(100% - 1rem,100rem);padding-top:.7rem}}
</style>
