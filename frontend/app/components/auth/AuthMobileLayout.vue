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
  height: 19rem;
  overflow: hidden;
  background: linear-gradient(135deg, #e4f4ef, #e9f5ff 54%, #dceef8);
}

.auth-mobile__map::before {
  position: absolute;
  inset: -4rem;
  content: '';
  background: repeating-linear-gradient(90deg, transparent 0 4.1rem, rgb(20 121 239 / 9%) 4.16rem 4.23rem), repeating-linear-gradient(0deg, transparent 0 4.1rem, rgb(20 121 239 / 9%) 4.16rem 4.23rem);
  transform: rotate(-12deg);
}

.auth-mobile__route {
  position: absolute;
  top: 58%;
  left: -15%;
  width: 130%;
  height: 0.33rem;
  border-radius: 999px;
  background: #78bed8;
  box-shadow: 0 0 0 0.55rem rgb(255 255 255 / 60%);
  transform: rotate(-22deg);
}

.auth-mobile__pin {
  position: absolute;
  top: 40%;
  right: 16%;
  width: 1.2rem;
  height: 1.2rem;
  border: 0.25rem solid #fff;
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
  padding: max(1.25rem, env(safe-area-inset-top)) 1.25rem 1.5rem;
}

.auth-mobile__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.auth-mobile__brand {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 0.6rem;
  color: #102968;
  font-size: 1.55rem;
  font-weight: 800;
  text-decoration: none;
}

/* ไฟล์โลโก้มีขอบว่างรอบรูปเยอะ จึงต้องใหญ่กว่าตัวอักษรพอสมควร */
.auth-mobile__logo {
  width: 3.75rem;
  height: 3.75rem;
  margin: -0.5rem -0.35rem -0.5rem -0.6rem;
  object-fit: contain;
}

.auth-mobile__brand:focus-visible {
  outline: 2px solid #0b5fcc;
  outline-offset: 3px;
  border-radius: 0.5rem;
}

.auth-mobile__header {
  margin: 2.25rem 0.2rem 1.4rem;
}

.auth-mobile__header h1 {
  margin: 0;
  font-size: 2.5rem;
  line-height: 1.2;
}

.auth-mobile__header p {
  margin: 0.5rem 0 0;
  text-wrap: balance;
  color: #2d4566;
  font-size: 1.02rem;
  font-weight: 600;
  line-height: 1.5;
}

/* การ์ดใช้เงาอย่างเดียว ไม่ต้องมีขอบซ้อน */
.auth-mobile__card {
  padding: 0.6rem 1.25rem 1.4rem;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 12px 30px rgb(24 74 113 / 12%);
}

.auth-mobile__footer {
  margin: auto 0 0;
  padding-top: 1.25rem;
  text-align: center;
}

.auth-mobile__footer :deep(.auth-switch) {
  margin: 0;
  color: #3f5a80;
  font-size: 0.95rem;
}

.auth-mobile__footer :deep(.auth-switch a) {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  padding: 0 0.35rem;
  color: #0b5fcc;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.auth-mobile__footer :deep(.auth-switch a:focus-visible) {
  outline: 2px solid #0b5fcc;
  outline-offset: 2px;
  border-radius: 0.4rem;
}

.auth-mobile__privacy {
  margin: 0.5rem 0 0;
  color: #52708b;
  font-size: 0.8rem;
  line-height: 1.5;
}
</style>
