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
  <div class="mobile-container">
    <div class="mobile-header">
      <div>
        <h2 class="mobile-title">📱 Mobile View</h2>
        <span class="mobile-subtitle">หน้าจอขนาดกะทัดรัด (สมาร์ตโฟน)</span>
      </div>
      <span class="mobile-badge">Mobile Mode</span>
    </div>

    <!-- Mobile Tabs -->
    <div class="tabs">
      <button
        type="button"
        @click="activeTab = 'register'"
        :class="['tab', activeTab === 'register' && 'tab--active']"
      >
        📝 สมัครสมาชิก
      </button>
      <button
        type="button"
        @click="activeTab = 'users'"
        :class="['tab', activeTab === 'users' && 'tab--active']"
      >
        👥 รายชื่อ ({{ users.length }})
      </button>
    </div>

    <!-- Tab 1: ฟอร์มสมัคร -->
    <div v-if="activeTab === 'register'">
      <form @submit.prevent="emit('submitRegister')">
        <div class="form-group">
          <label class="form-label">Email *</label>
          <input v-model="form.email" type="email" required class="form-input" placeholder="user@example.com" />
        </div>

        <div class="form-group">
          <label class="form-label">Password *</label>
          <input v-model="form.password" type="password" required class="form-input" placeholder="รหัสผ่าน" />
        </div>

        <div class="form-group">
          <label class="form-label">ชื่อ (Name)</label>
          <input v-model="form.name" type="text" class="form-input" placeholder="ชื่อของคุณ" />
        </div>

        <div class="form-group form-group--last">
          <label class="form-label">เบอร์โทรศัพท์ (Phone)</label>
          <input v-model="form.phone" type="tel" class="form-input" placeholder="เบอร์ติดต่อ" />
        </div>

        <AppButton type="submit" :disabled="loading">
          {{ loading ? 'กำลังบันทึก...' : 'สมัครสมาชิกทันที' }}
        </AppButton>
      </form>

      <div v-if="message" :class="['alert', isError ? 'alert--error' : 'alert--success']">
        {{ message }}
      </div>
    </div>

    <!-- Tab 2: ลิสต์ Users -->
    <div v-else>
      <div v-if="users.length === 0" class="empty-state">
        ยังไม่มีรายชื่อในระบบ
      </div>
      <div v-else class="user-list">
        <div v-for="user in users" :key="user.id" class="user-card">
          <div class="user-name">{{ user.name || 'ไม่ระบุชื่อ' }}</div>
          <div class="user-detail">📧 {{ user.email }}</div>
          <div v-if="user.phone" class="user-detail">📞 {{ user.phone }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-container {
  max-width: 480px;
  margin: 20px auto;
  padding: 16px;
  font-family: sans-serif;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.mobile-title {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
}

.mobile-subtitle {
  font-size: 12px;
  color: #64748b;
}

.mobile-badge {
  background: #fef3c7;
  color: #92400e;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}

/* Tabs */
.tabs {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.tab {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: normal;
  background: transparent;
  color: #64748b;
  box-shadow: none;
  transition: all 0.2s ease;
}

.tab--active {
  font-weight: bold;
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* ฟอร์ม */
.form-group {
  margin-bottom: 10px;
}

.form-group--last {
  margin-bottom: 14px;
}

.form-label {
  font-size: 12px;
  color: #475569;
}

.form-input {
  width: 100%;
  padding: 10px;
  margin-top: 4px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 14px;
}

/* Alert */
.alert {
  margin-top: 12px;
  padding: 10px;
  border-radius: 6px;
  font-size: 13px;
}

.alert--success {
  background-color: #dcfce7;
  color: #16a34a;
}

.alert--error {
  background-color: #fee2e2;
  color: #dc2626;
}

/* รายชื่อผู้ใช้ */
.empty-state {
  padding: 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-card {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #0f172a;
}

.user-detail {
  font-size: 12px;
  color: #64748b;
}
</style>
