<template>
  <!-- Mobile Login UI -->
  <div class="mobile-login">

    <!-- Background Glow -->
    <div class="mobile-login__glow" />

    <!-- Content -->
    <div class="mobile-login__content">

      <!-- Logo -->
      <div class="mobile-logo">
        <span class="mobile-logo__icon">📍</span>
        <h1 class="mobile-logo__title">GEO<span class="mobile-logo__accent">SPREAD</span></h1>
        <p class="mobile-logo__tagline">แพลตฟอร์มแจ้งเตือนความปลอดภัย</p>
      </div>

      <!-- Card -->
      <div class="mobile-card">

        <!-- Google Button -->
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
          <span class="divider__text">หรือเข้าสู่ระบบด้วยอีเมล</span>
          <span class="divider__line" />
        </div>

        <!-- Form -->
        <form @submit.prevent="emit('submitLogin')">

          <!-- Error Alert -->
          <div v-if="error" class="error-alert">
            ⚠️ {{ error }}
          </div>

          <div class="field">
            <div class="field__wrap">
              <span class="field__icon">✉️</span>
              <input
                id="mobile-email"
                v-model="form.email"
                type="email"
                required
                placeholder="อีเมลของคุณ"
                class="field__input"
              />
            </div>
          </div>

          <div class="field">
            <div class="field__wrap">
              <span class="field__icon">🔒</span>
              <input
                id="mobile-password"
                v-model="form.password"
                type="password"
                required
                placeholder="รหัสผ่าน"
                class="field__input"
              />
            </div>
          </div>

          <button
            id="mobile-login-btn"
            type="submit"
            :disabled="loading"
            class="submit-btn"
          >
            {{ loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ' }}
          </button>

        </form>

      </div>

      <p class="mobile-login__footer">
        ยังไม่มีบัญชี?
        <NuxtLink to="/register" class="link">สมัครสมาชิกฟรี</NuxtLink>
      </p>

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
.mobile-login {
  min-height: 100dvh;
  background: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  position: relative;
  overflow: hidden;
}

.mobile-login__glow {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(239, 68, 68, 0.12), transparent 70%);
  pointer-events: none;
}

.mobile-login__content {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  position: relative;
  z-index: 1;
}

/* ==============================
   Logo
   ============================== */
.mobile-logo {
  text-align: center;
}

.mobile-logo__icon {
  font-size: 40px;
  display: block;
  margin-bottom: 8px;
}

.mobile-logo__title {
  font-size: 36px;
  font-weight: 900;
  color: #f8fafc;
  letter-spacing: -1.5px;
  margin: 0 0 6px;
  line-height: 1;
}

.mobile-logo__accent {
  color: #ef4444;
}

.mobile-logo__tagline {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

/* ==============================
   Card
   ============================== */
.mobile-card {
  width: 100%;
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  padding: 24px 20px;
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
  padding: 13px;
  background: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  cursor: pointer;
  transition: background 0.2s;
}

.google-btn:active {
  background: #f1f5f9;
}

/* ==============================
   Divider
   ============================== */
.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 0;
}

.divider__line {
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.08);
}

.divider__text {
  font-size: 10px;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  white-space: nowrap;
}

/* ==============================
   Error Alert
   ============================== */
.error-alert {
  padding: 11px 14px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  color: #fca5a5;
  font-size: 13px;
  margin-bottom: 14px;
}

/* ==============================
   Form Fields
   ============================== */
.field {
  margin-bottom: 12px;
}

.field__wrap {
  position: relative;
}

.field__icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  z-index: 1;
}

.field__input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 14px 14px 14px 44px;
  color: #f1f5f9;
  font-size: 15px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
  -webkit-appearance: none;
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
  padding: 15px;
  margin-top: 8px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.25);
}

.submit-btn:active:not(:disabled) {
  opacity: 0.85;
}

.submit-btn:disabled {
  background: #374151;
  box-shadow: none;
  cursor: not-allowed;
}

/* ==============================
   Footer
   ============================== */
.mobile-login__footer {
  font-size: 13px;
  color: #64748b;
  text-align: center;
}

.link {
  color: #ef4444;
  font-weight: 700;
  text-decoration: none;
}
</style>
