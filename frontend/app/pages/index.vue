<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { User } from '~/types/user';
import DesktopUserView from '~/components/desktop/DesktopUserView.vue';
import MobileUserView from '~/components/mobile/MobileUserView.vue';

// ---------------------------------------------------------------------------
// 1. Data State & API Fetching (Smart Container Layer)
// ---------------------------------------------------------------------------
const users = ref<User[]>([]);
const loading = ref(false);
const message = ref('');
const isError = ref(false);

const form = ref({
  email: '',
  password: '',
  name: '',
  phone: ''
});

// ฟังก์ชันดึง Users ทั้งหมดจาก Backend
const fetchUsers = async () => {
  try {
    const res: any = await $fetch('http://localhost:5000/users');
    if (res?.data) {
      users.value = res.data;
    }
  } catch (err: any) {
    console.error('Error fetching users:', err);
  }
};

// ฟังก์ชันยิง API สร้าง User ใหม่
const handleRegister = async () => {
  loading.value = true;
  message.value = '';
  isError.value = false;

  try {
    const res: any = await $fetch('http://localhost:5000/users', {
      method: 'POST',
      body: form.value
    });

    isError.value = false;
    message.value = `สำเร็จ! สร้างผู้ใช้ ${res.data.name || res.data.email} เรียบร้อยแล้ว`;
    form.value = { email: '', password: '', name: '', phone: '' };

    // ดึงข้อมูลรายชื่อใหม่ล่าสุด
    await fetchUsers();
  } catch (err: any) {
    isError.value = true;
    message.value = err.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
  } finally {
    loading.value = false;
  }
};

// ---------------------------------------------------------------------------
// 2. Responsive Detection (ตรวจจับขนาดหน้าจอ หรือสลับโหมดทดสอบ)
// ---------------------------------------------------------------------------
const windowWidth = ref(1024);
const viewMode = ref<'auto' | 'desktop' | 'mobile'>('auto');

const updateWidth = () => {
  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth;
  }
};

onMounted(() => {
  updateWidth();
  window.addEventListener('resize', updateWidth);
  fetchUsers();
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateWidth);
  }
});

const isMobile = computed(() => {
  if (viewMode.value === 'mobile') return true;
  if (viewMode.value === 'desktop') return false;
  return windowWidth.value < 768;
});
</script>

<template>
  <div style="min-height: 100vh; background-color: #f1f5f9; padding-bottom: 60px;">
    <!-- แถบจำลอง/สลับโหมดทดสอบด้านบนสุด -->
    <header style="background: #1e293b; color: white; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
      <div style="font-weight: bold; font-size: 16px;">
        🌍 GeoSpread — Frontend Architecture Demo
      </div>

      <div style="display: flex; gap: 8px; align-items: center; font-size: 13px;">
        <span>โหมดการแสดงผล:</span>
        <button 
          @click="viewMode = 'auto'"
          :style="{
            padding: '4px 10px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            background: viewMode === 'auto' ? '#0284c7' : '#334155',
            color: 'white'
          }"
        >
          Auto (ตามจอจริง: {{ windowWidth }}px)
        </button>
        <button 
          @click="viewMode = 'desktop'"
          :style="{
            padding: '4px 10px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            background: viewMode === 'desktop' ? '#0284c7' : '#334155',
            color: 'white'
          }"
        >
          บังคับ Desktop
        </button>
        <button 
          @click="viewMode = 'mobile'"
          :style="{
            padding: '4px 10px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            background: viewMode === 'mobile' ? '#0284c7' : '#334155',
            color: 'white'
          }"
        >
          บังคับ Mobile
        </button>
      </div>
    </header>

    <!-- เลเยอร์ Presentational View: เลือก Render ตาม Device -->
    <main style="padding: 16px;">
      <MobileUserView
        v-if="isMobile"
        :users="users"
        :loading="loading"
        :form="form"
        :message="message"
        :isError="isError"
        @submitRegister="handleRegister"
      />

      <DesktopUserView
        v-else
        :users="users"
        :loading="loading"
        :form="form"
        :message="message"
        :isError="isError"
        @submitRegister="handleRegister"
      />
    </main>
  </div>
</template>
