<script setup lang="ts">
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
</script>

<template>
  <div class="desktop-container">
    <div class="desktop-header">
      <div>
        <h1 class="desktop-title">🖥️ Desktop View — ระบบทดสอบ User</h1>
        <p class="desktop-subtitle">Layout แบบ 2 คอลัมน์สำหรับหน้าจอ Desktop</p>
      </div>
      <span class="desktop-badge">Desktop Mode</span>
    </div>

    <div class="desktop-grid">
      <!-- ฝั่งซ้าย: ฟอร์มสมัครสมาชิก -->
      <div class="form-section">
        <h3 class="section-title">📝 สมัครสมาชิกใหม่</h3>

        <form @submit.prevent="emit('submitRegister')">
          <div class="form-group">
            <label class="form-label">Email *</label>
            <input v-model="form.email" type="email" required class="form-input" placeholder="user@example.com" />
          </div>

          <div class="form-group">
            <label class="form-label">Password *</label>
            <input v-model="form.password" type="password" required class="form-input" placeholder="อย่างน้อย 6 ตัวอักษร" />
          </div>

          <div class="form-group">
            <label class="form-label">ชื่อ (Name)</label>
            <input v-model="form.name" type="text" class="form-input" placeholder="สมชาย" />
          </div>

          <div class="form-group form-group--last">
            <label class="form-label">เบอร์โทรศัพท์ (Phone)</label>
            <input v-model="form.phone" type="tel" class="form-input" placeholder="0812345678" />
          </div>

          <AppButton type="submit" :disabled="loading">
            {{ loading ? 'กำลังบันทึก...' : 'สมัครสมาชิก' }}
          </AppButton>
        </form>

        <div v-if="message" :class="['alert', isError ? 'alert--error' : 'alert--success']">
          {{ message }}
        </div>
      </div>

      <!-- ฝั่งขวา: แสดงรายการ Users ทั้งหมดที่ดึงมาจาก API -->
      <div>
        <h3 class="section-title">👥 รายชื่อผู้ใช้ในระบบ (จาก API)</h3>

        <div v-if="users.length === 0" class="empty-state">
          ยังไม่มีข้อมูลผู้ใช้ในระบบ
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
  </div>
</template>

<style scoped>
.desktop-container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 24px;
  font-family: sans-serif;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.desktop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.desktop-title {
  margin: 0;
  color: #0f172a;
  font-size: 24px;
}

.desktop-subtitle {
  margin: 4px 0 0 0;
  color: #64748b;
  font-size: 14px;
}

.desktop-badge {
  background: #e0f2fe;
  color: #0369a1;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.desktop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

/* ส่วนฟอร์ม */
.form-section {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.section-title {
  margin-top: 0;
  color: #334155;
}

.form-group {
  margin-bottom: 12px;
}

.form-group--last {
  margin-bottom: 16px;
}

.form-label {
  font-size: 13px;
  color: #475569;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  box-sizing: border-box;
}

/* Alert */
.alert {
  margin-top: 16px;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
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
  background: #f8fafc;
  border-radius: 8px;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.user-card {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
}

.user-name {
  font-weight: 600;
  color: #0f172a;
}

.user-detail {
  font-size: 13px;
  color: #64748b;
}
</style>
