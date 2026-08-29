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
  <div style="max-width: 1000px; margin: 40px auto; padding: 24px; font-family: sans-serif; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 24px;">
      <div>
        <h1 style="margin: 0; color: #0f172a; font-size: 24px;">🖥️ Desktop View — ระบบทดสอบ User</h1>
        <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Layout แบบ 2 คอลัมน์สำหรับหน้าจอ Desktop</p>
      </div>
      <span style="background: #e0f2fe; color: #0369a1; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
        Desktop Mode
      </span>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
      <!-- ฝั่งซ้าย: ฟอร์มสมัครสมาชิก -->
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <h3 style="margin-top: 0; color: #334155;">📝 สมัครสมาชิกใหม่</h3>

        <form @submit.prevent="emit('submitRegister')">
          <div style="margin-bottom: 12px;">
            <label style="font-size: 13px; color: #475569; font-weight: 500;">Email *</label>
            <input v-model="form.email" type="email" required style="width: 100%; padding: 8px; margin-top: 4px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;" placeholder="user@example.com" />
          </div>

          <div style="margin-bottom: 12px;">
            <label style="font-size: 13px; color: #475569; font-weight: 500;">Password *</label>
            <input v-model="form.password" type="password" required style="width: 100%; padding: 8px; margin-top: 4px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;" placeholder="อย่างน้อย 6 ตัวอักษร" />
          </div>

          <div style="margin-bottom: 12px;">
            <label style="font-size: 13px; color: #475569; font-weight: 500;">ชื่อ (Name)</label>
            <input v-model="form.name" type="text" style="width: 100%; padding: 8px; margin-top: 4px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;" placeholder="สมชาย" />
          </div>

          <div style="margin-bottom: 16px;">
            <label style="font-size: 13px; color: #475569; font-weight: 500;">เบอร์โทรศัพท์ (Phone)</label>
            <input v-model="form.phone" type="tel" style="width: 100%; padding: 8px; margin-top: 4px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;" placeholder="0812345678" />
          </div>

          <AppButton type="submit" :disabled="loading">
            {{ loading ? 'กำลังบันทึก...' : 'สมัครสมาชิก' }}
          </AppButton>
        </form>

        <div v-if="message" :style="{ marginTop: '16px', padding: '10px', borderRadius: '6px', fontSize: '14px', backgroundColor: isError ? '#fee2e2' : '#dcfce7', color: isError ? '#dc2626' : '#16a34a' }">
          {{ message }}
        </div>
      </div>

      <!-- ฝั่งขวา: แสดงรายการ Users ทั้งหมดที่ดึงมาจาก API -->
      <div>
        <h3 style="margin-top: 0; color: #334155;">👥 รายชื่อผู้ใช้ในระบบ (จาก API)</h3>

        <div v-if="users.length === 0" style="padding: 20px; text-align: center; color: #94a3b8; background: #f8fafc; border-radius: 8px;">
          ยังไม่มีข้อมูลผู้ใช้ในระบบ
        </div>

        <div v-else style="display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto;">
          <div v-for="user in users" :key="user.id" style="padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
            <div style="font-weight: 600; color: #0f172a;">{{ user.name || 'ไม่ระบุชื่อ' }}</div>
            <div style="font-size: 13px; color: #64748b;">📧 {{ user.email }}</div>
            <div v-if="user.phone" style="font-size: 13px; color: #64748b;">📞 {{ user.phone }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
