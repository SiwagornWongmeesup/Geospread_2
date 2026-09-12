<template>
  <!-- Desktop Register UI -->
  <div class="register-desktop">

    <!-- Left Panel: Branding -->
    <div class="register-desktop__brand">
      <div class="brand-content">
        <div class="brand-logo">📍</div>
        <h1 class="brand-title">GEO<span class="brand-accent">SPREAD</span></h1>
        <p class="brand-tagline">ร่วมเป็นส่วนหนึ่งของเครือข่ายการช่วยเหลือ</p>

        <div class="brand-features">
          <div class="feature-item">
            <span class="feature-item__icon">🚨</span>
            <div>
              <div class="feature-item__title">รายงานเหตุการณ์</div>
              <div class="feature-item__desc">แจ้งเหตุฉุกเฉินในพื้นที่ของคุณ</div>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-item__icon">🗺️</span>
            <div>
              <div class="feature-item__title">ติดตามสถานการณ์</div>
              <div class="feature-item__desc">ดูเหตุการณ์แบบ Real-time บนแผนที่</div>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-item__icon">🤝</span>
            <div>
              <div class="feature-item__title">ชุมชนช่วยกัน</div>
              <div class="feature-item__desc">เชื่อมต่อกับชุมชนในพื้นที่ของคุณ</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel: Form -->
    <div class="register-desktop__form-panel">
      <div class="form-card">

        <div class="form-card__header">
          <h2 class="form-card__title">สร้างบัญชีใหม่</h2>
          <p class="form-card__subtitle">ฟรี ไม่มีค่าใช้จ่าย</p>
        </div>

        <!-- Google Button -->
        <button type="button" class="google-btn">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Sign up with Google</span>
        </button>

        <!-- Divider -->
        <div class="divider">
          <span class="divider__line" />
          <span class="divider__text">หรือสมัครด้วยอีเมล</span>
          <span class="divider__line" />
        </div>

        <!-- Form -->
        <form @submit.prevent="emit('submitRegister')">

          <!-- Error Alert -->
          <div v-if="error" class="error-alert">⚠️ {{ error }}</div>

          <div class="field">
            <label class="field__label">ชื่อผู้ใช้งาน</label>
            <div class="field__input-wrap">
              <span class="field__icon">👤</span>
              <input
                id="desktop-reg-name"
                v-model="form.name"
                type="text"
                required
                placeholder="ชื่อของคุณ"
                class="field__input"
              />
            </div>
          </div>

          <div class="field">
            <label class="field__label">อีเมล</label>
            <div class="field__input-wrap">
              <span class="field__icon">✉️</span>
              <input
                id="desktop-reg-email"
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
                id="desktop-reg-password"
                v-model="form.password"
                type="password"
                required
                placeholder="อย่างน้อย 8 ตัวอักษร"
                class="field__input"
              />
            </div>
          </div>

          <!-- Terms Checkbox -->
          <label class="terms-label">
            <div class="terms-checkbox-wrap">
              <input
                id="desktop-reg-terms"
                type="checkbox"
                :checked="acceptTerms"
                @change="emit('update:acceptTerms', $event.target.checked)"
                class="terms-checkbox"
              />
              <span class="terms-checkmark">✓</span>
            </div>
            <span class="terms-text">
              ฉันยอมรับ
              <NuxtLink to="/terms" class="terms-link">เงื่อนไขการใช้งาน</NuxtLink>
              และนโยบายความเป็นส่วนตัว
            </span>
          </label>

          <button
            id="desktop-reg-btn"
            type="submit"
            :disabled="loading"
            class="submit-btn"
          >
            <span>{{ loading ? 'กำลังสร้างบัญชี...' : 'สร้างบัญชีใหม่' }}</span>
            <span v-if="!loading">→</span>
          </button>
        </form>

        <p class="form-card__footer">
          มีบัญชีอยู่แล้ว?
          <NuxtLink to="/login" class="link">เข้าสู่ระบบ</NuxtLink>
        </p>

      </div>
    </div>

  </div>
</template>

<script setup>
defineProps({
  form: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  acceptTerms: { type: Boolean, default: false }
})

const emit = defineEmits(['submitRegister', 'update:acceptTerms'])
</script>

<style scoped>
/* ==============================
   Layout
   ============================== */
.register-desktop {
  display: flex;
  min-height: 100vh;
  background: #0f172a;
}

/* ==============================
   Left Brand Panel
   ============================== */
.register-desktop__brand {
  flex: 1;
  background: linear-gradient(135deg, #1a1040 0%, #0f172a 50%, #1e293b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  position: relative;
  overflow: hidden;
}

.register-desktop__brand::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(239, 68, 68, 0.1), transparent 70%);
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
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
}

.feature-item__icon {
  font-size: 22px;
  flex-shrink: 0;
}

.feature-item__title {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 2px;
}

.feature-item__desc {
  font-size: 12px;
  color: #64748b;
}

/* ==============================
   Right Form Panel
   ============================== */
.register-desktop__form-panel {
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
  margin-bottom: 24px;
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
  margin: 18px 0;
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
   Error Alert
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

/* ==============================
   Form Fields
   ============================== */
.field {
  margin-bottom: 12px;
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
   Terms Checkbox
   ============================== */
.terms-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  margin-top: 16px;
}

.terms-checkbox-wrap {
  position: relative;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-top: 1px;
}

.terms-checkbox {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #374151;
  border-radius: 5px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.terms-checkbox:checked {
  background: #ef4444;
  border-color: #ef4444;
}

.terms-checkmark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  color: white;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}

.terms-checkbox:checked ~ .terms-checkmark {
  opacity: 1;
}

.terms-text {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
}

.terms-link {
  color: #ef4444;
  text-decoration: none;
  font-weight: 600;
}

.terms-link:hover {
  text-decoration: underline;
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
