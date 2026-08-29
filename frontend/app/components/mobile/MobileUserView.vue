<script setup lang="ts">
import { ref } from 'vue';
import type { User } from '~/types/user';
import AppButton from '../common/AppButton.vue';

defineProps<{
  users: User[];
  loading: boolean;
  form: { email: string; password: string; name: string; phone: string };
  message: string;
  isError: boolean;
}>();

const emit = defineEmits(['submitRegister']);
const activeTab = ref<'register' | 'users'>('register');
</script>

<template>
  <div style="max-width: 480px; margin: 20px auto; padding: 16px; font-family: sans-serif; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.06);">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <div>
        <h2 style="margin: 0; color: #0f172a; font-size: 18px;">📱 Mobile View</h2>
        <span style="font-size: 12px; color: #64748b;">หน้าจอขนาดกะทัดรัด (สมาร์ตโฟน)</span>
      </div>
      <span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">
        Mobile Mode
      </span>
    </div>

    <!-- Mobile Tabs -->
    <div style="display: flex; background: #f1f5f9; padding: 4px; border-radius: 8px; margin-bottom: 16px;">
      <button 
        type="button" 
        @click="activeTab = 'register'"
        :style="{
          flex: 1,
          padding: '8px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: activeTab === 'register' ? 'bold' : 'normal',
          background: activeTab === 'register' ? '#ffffff' : 'transparent',
          color: activeTab === 'register' ? '#0f172a' : '#64748b',
          boxShadow: activeTab === 'register' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
        }"
      >
        📝 สมัครสมาชิก
      </button>
      <button 
        type="button" 
        @click="activeTab = 'users'"
        :style="{
          flex: 1,
          padding: '8px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: activeTab === 'users' ? 'bold' : 'normal',
          background: activeTab === 'users' ? '#ffffff' : 'transparent',
          color: activeTab === 'users' ? '#0f172a' : '#64748b',
          boxShadow: activeTab === 'users' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
        }"
      >
        👥 รายชื่อ ({{ users.length }})
      </button>
    </div>

    <!-- Tab 1: ฟอร์มสมัคร -->
    <div v-if="activeTab === 'register'">
      <form @submit.prevent="emit('submitRegister')">
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #475569;">Email *</label>
          <input v-model="form.email" type="email" required style="width: 100%; padding: 10px; margin-top: 4px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 14px;" placeholder="user@example.com" />
        </div>

        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #475569;">Password *</label>
          <input v-model="form.password" type="password" required style="width: 100%; padding: 10px; margin-top: 4px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 14px;" placeholder="รหัสผ่าน" />
        </div>

        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #475569;">ชื่อ (Name)</label>
          <input v-model="form.name" type="text" style="width: 100%; padding: 10px; margin-top: 4px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 14px;" placeholder="ชื่อของคุณ" />
        </div>

        <div style="margin-bottom: 14px;">
          <label style="font-size: 12px; color: #475569;">เบอร์โทรศัพท์ (Phone)</label>
          <input v-model="form.phone" type="tel" style="width: 100%; padding: 10px; margin-top: 4px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 14px;" placeholder="เบอร์ติดต่อ" />
        </div>

        <AppButton type="submit" :disabled="loading">
          {{ loading ? 'กำลังบันทึก...' : 'สมัครสมาชิกทันที' }}
        </AppButton>
      </form>

      <div v-if="message" :style="{ marginTop: '12px', padding: '10px', borderRadius: '6px', fontSize: '13px', backgroundColor: isError ? '#fee2e2' : '#dcfce7', color: isError ? '#dc2626' : '#16a34a' }">
        {{ message }}
      </div>
    </div>

    <!-- Tab 2: ลิสต์ Users -->
    <div v-else>
      <div v-if="users.length === 0" style="padding: 20px; text-align: center; color: #94a3b8; font-size: 14px;">
        ยังไม่มีรายชื่อในระบบ
      </div>
      <div v-else style="display: flex; flex-direction: column; gap: 8px;">
        <div v-for="user in users" :key="user.id" style="padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc;">
          <div style="font-weight: 600; font-size: 14px; color: #0f172a;">{{ user.name || 'ไม่ระบุชื่อ' }}</div>
          <div style="font-size: 12px; color: #64748b;">📧 {{ user.email }}</div>
          <div v-if="user.phone" style="font-size: 12px; color: #64748b;">📞 {{ user.phone }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
