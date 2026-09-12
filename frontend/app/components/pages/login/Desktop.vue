<template>
  <!-- Desktop Login UI -->
  <div class="login-desktop">

    <!-- Left Panel: Branding -->
    <div class="login-desktop__brand">
      <div class="brand-content">
        <div class="brand-logo">📍</div>
        <h1 class="brand-title">GEO<span class="brand-accent">SPREAD</span></h1>
        <p class="brand-tagline">แพลตฟอร์มแจ้งเตือนความปลอดภัยของชุมชน</p>
        <div class="brand-features">
          <div class="feature-item">🚨 แจ้งเตือนเหตุฉุกเฉินแบบเรียลไทม์</div>
          <div class="feature-item">🗺️ ติดตามสถานการณ์บนแผนที่</div>
          <div class="feature-item">💬 แชทใน Event Room</div>
        </div>
      </div>
    </div>

    <!-- Right Panel: Form -->
    <div class="login-desktop__form-panel">
      <div class="form-card">

        <div class="form-card__header">
          <h2 class="form-card__title">เข้าสู่ระบบ</h2>
          <p class="form-card__subtitle">ยินดีต้อนรับกลับเข้าสู่ระบบ</p>
        </div>

        <!-- Google Button (UI only) -->
        <button type="button" class="google-btn">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Sign in with Google</span>
        </button>

        <!-- Divider -->
        <div class="divider">
          <span class="divider__line" />
          <span class="divider__text">หรือใช้บัญชีของคุณ</span>
          <span class="divider__line" />
        </div>

        <!-- Form -->
        <form @submit.prevent="emit('submitLogin')">
          <!-- Error Alert -->
          <div v-if="error" class="error-alert">
            ⚠️ {{ error }}
          </div>

          <div class="field">
            <label class="field__label">อีเมล</label>
            <div class="field__input-wrap">
              <span class="field__icon">✉️</span>
              <input
                id="desktop-email"
                v-model="form.email"
                type="email"
                required
                placeholder="example@email.com"
                class="field__input"
              />
            </div>
          </div>

          <div class="field">
            <label class="field__label">รหัสผ่าน</label>
            <div class="field__input-wrap">
              <span class="field__icon">🔒</span>
              <input
                id="desktop-password"
                v-model="form.password"
                type="password"
                required
                placeholder="รหัสผ่านของคุณ"
                class="field__input"
              />
            </div>
          </div>

          <button
            id="desktop-login-btn"
            type="submit"
            :disabled="loading"
            class="submit-btn"
          >
            <span>{{ loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ' }}</span>
            <span v-if="!loading">→</span>
          </button>
        </form>

        <p class="form-card__footer">
          ยังไม่มีบัญชี?
          <NuxtLink to="/register" class="link">สมัครสมาชิกฟรี</NuxtLink>
        </p>

      </div>
    </div>

  </div>
</template>

<script setup>
defineProps({
  form: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' }
})

const emit = defineEmits(['submitLogin'])
</script>

<style scoped>
/* ==============================
   Layout
   ============================== */
.login-desktop {
  display: flex;
  min-height: 100vh;
  background: #0f172a;
}

/* ==============================
   Left Brand Panel
   ============================== */
.login-desktop__brand {
  flex: 1;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1a1040 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  position: relative;
  overflow: hidden;
}

.login-desktop__brand::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.12), transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.brand-content {
  position: relative;
  z-index: 1;
  max-width: 420px;
}

.brand-logo {
  font-size: 48px;
  margin-bottom: 16px;
}

.brand-title {
  font-size: 48px;
  font-weight: 900;
  color: #f8fafc;
  letter-spacing: -2px;
  margin: 0 0 12px;
  line-height: 1;
}

.brand-accent {
  color: #ef4444;
}

.brand-tagline {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 40px;
  line-height: 1.6;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  font-size: 14px;
  color: #94a3b8;
  padding: 12px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
}

/* ==============================
   Right Form Panel
   ============================== */
.login-desktop__form-panel {
  width: 480px;
  min-width: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  background: #111827;
}

.form-card {
  width: 100%;
  max-width: 380px;
}

.form-card__header {
  margin-bottom: 28px;
}

.form-card__title {
  font-size: 28px;
  font-weight: 800;
  color: #f1f5f9;
  margin: 0 0 6px;
}

.form-card__subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* ==============================
   Google Button
   ============================== */
.google-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.google-btn:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

/* ==============================
   Divider
   ============================== */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
}

.divider__line {
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.08);
}

.divider__text {
  font-size: 11px;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  white-space: nowrap;
}

/* ==============================
   Form Fields
   ============================== */
.error-alert {
  padding: 12px 14px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  color: #fca5a5;
  font-size: 13px;
  margin-bottom: 16px;
}

.field {
  margin-bottom: 14px;
}

.field__label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field__input-wrap {
  position: relative;
}

.field__icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
}

.field__input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 12px 14px 12px 42px;
  color: #f1f5f9;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

.field__input:focus {
  border-color: #ef4444;
}

.field__input::placeholder {
  color: #475569;
}

/* ==============================
   Submit Button
   ============================== */
.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  margin-top: 20px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.25);
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: #374151;
  box-shadow: none;
  cursor: not-allowed;
}

/* ==============================
   Footer
   ============================== */
.form-card__footer {
  text-align: center;
  font-size: 13px;
  color: #64748b;
  margin-top: 24px;
}

.link {
  color: #ef4444;
  font-weight: 700;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}
</style>
