<template>
  <!-- โครงหน้าเข้าสู่ระบบ/สมัครบนมือถือ: พื้นหลังลายแผนที่ + โลโก้ + ภาษา + หัวข้อ + การ์ดฟอร์ม (ใช้ร่วมกันทั้งสองหน้า) -->
  <main class="auth-mobile">
    <div class="auth-mobile__map" aria-hidden="true">
      <span class="auth-mobile__route" />
      <span class="auth-mobile__pin" />
    </div>
    <div class="auth-mobile__content">
      <div class="auth-mobile__top">
        <NuxtLink to="/" class="auth-mobile__brand" :aria-label="t('auth.backHome')">
          <img src="/logos/logo.png" alt="" class="auth-mobile__logo" />
          <span>GeoSpread</span>
        </NuxtLink>
        <AuthLanguageSwitch />
      </div>
      <header class="auth-mobile__header">
        <h1 :id="titleId">{{ title }}</h1>
        <p>{{ tagline }}</p>
      </header>
      <section class="auth-mobile__card" :aria-labelledby="titleId">
        <slot />
      </section>
      <footer class="auth-mobile__footer">
        <slot name="footer" />
        <p class="auth-mobile__privacy">{{ t('auth.privacyNote') }}</p>
      </footer>
    </div>
  </main>
</template>

<script setup>
import AuthLanguageSwitch from '~/components/auth/AuthLanguageSwitch.vue'

defineProps({
  title: { type: String, required: true },
  tagline: { type: String, default: '' },
  titleId: { type: String, required: true },
})

const { t } = useLocale()
</script>

<style scoped>
.auth-mobile {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background: #f7fafc;
  color: #102968;
}

/* พื้นหลังเป็นแผนที่จำลอง (ตาราง ถนน หมุด) เข้ากับแอปที่อิงตำแหน่ง */
.auth-mobile__map {
  position: absolute;
  inset: 0 0 auto;
  height: 304px;
  overflow: hidden;
  background: linear-gradient(135deg, #e4f4ef, #e9f5ff 54%, #dceef8);
}

.auth-mobile__map::before {
  position: absolute;
  inset: -64px;
  content: '';
  background: repeating-linear-gradient(90deg, transparent 0 66px, rgb(20 121 239 / 9%) 67px 68px), repeating-linear-gradient(0deg, transparent 0 66px, rgb(20 121 239 / 9%) 67px 68px);
  transform: rotate(-12deg);
}

.auth-mobile__route {
  position: absolute;
  top: 58%;
  left: -15%;
  width: 130%;
  height: 5px;
  border-radius: 999px;
  background: #78bed8;
  box-shadow: 0 0 0 9px rgb(255 255 255 / 60%);
  transform: rotate(-22deg);
}

.auth-mobile__pin {
  position: absolute;
  top: 40%;
  right: 16%;
  width: 19px;
  height: 19px;
  border: 4px solid #fff;
  border-radius: 50% 50% 50% 0;
  background: #e8333c;
  box-shadow: 0 4px 12px rgb(232 51 60 / 28%);
  transform: rotate(-45deg);
}

.auth-mobile__content {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 100dvh;
  box-sizing: border-box;
  flex-direction: column;
  padding: max(20px, env(safe-area-inset-top)) 20px 24px;
}

.auth-mobile__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.auth-mobile__brand {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 10px;
  color: #102968;
  font-size: 25px;
  font-weight: 800;
  text-decoration: none;
}

/* ไฟล์โลโก้มีขอบว่างรอบรูปเยอะ จึงต้องใหญ่กว่าตัวอักษรพอสมควร */
.auth-mobile__logo {
  width: 60px;
  height: 60px;
  margin: -8px -6px -8px -10px;
  object-fit: contain;
}

.auth-mobile__brand:focus-visible {
  outline: 2px solid #0b5fcc;
  outline-offset: 3px;
  border-radius: 8px;
}

.auth-mobile__header {
  margin: 36px 3px 22px;
}

.auth-mobile__header h1 {
  margin: 0;
  font-size: 40px;
  line-height: 1.2;
}

.auth-mobile__header p {
  margin: 8px 0 0;
  text-wrap: balance;
  color: #2d4566;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
}

/* การ์ดใช้เงาอย่างเดียว ไม่ต้องมีขอบซ้อน */
.auth-mobile__card {
  padding: 10px 20px 22px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 12px 30px rgb(24 74 113 / 12%);
}

.auth-mobile__footer {
  margin: auto 0 0;
  padding-top: 20px;
  text-align: center;
}

.auth-mobile__footer :deep(.auth-switch) {
  margin: 0;
  color: #3f5a80;
  font-size: 15px;
}

.auth-mobile__footer :deep(.auth-switch a) {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  padding: 0 6px;
  color: #0b5fcc;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.auth-mobile__footer :deep(.auth-switch a:focus-visible) {
  outline: 2px solid #0b5fcc;
  outline-offset: 2px;
  border-radius: 6px;
}

.auth-mobile__privacy {
  margin: 8px 0 0;
  color: #52708b;
  font-size: 13px;
  line-height: 1.5;
}
</style>
