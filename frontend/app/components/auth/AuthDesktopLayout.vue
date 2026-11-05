<template>
  <!-- โครงหน้าเข้าสู่ระบบ/สมัครบนคอม: แถบบน + ภาพชุมชนด้านซ้าย + ฟอร์มด้านขวา (ใช้ร่วมกันทั้งสองหน้า) -->
  <div class="auth-desktop">
    <AppHeader standalone />
    <main class="auth-desktop__layout">
      <!-- ภาพและข้อความประกอบ เป็นส่วนตกแต่ง หัวข้อหลักของหน้า (h1) อยู่ในฟอร์ม -->
      <section class="auth-desktop__visual" aria-hidden="true">
        <img src="/images/login-community-background.png" alt="" />
        <div class="auth-desktop__wash" />
        <div class="auth-desktop__copy">
          <p class="auth-desktop__headline">{{ t('auth.heroLine1') }}<br />{{ t('auth.heroLine2') }}</p>
          <p class="auth-desktop__text">{{ heroText }}</p>
        </div>
      </section>

      <section class="auth-desktop__form-area" :aria-labelledby="titleId">
        <div class="auth-desktop__card">
          <h1 :id="titleId" class="auth-desktop__title">{{ title }}</h1>
          <p class="auth-desktop__intro">{{ intro }}</p>
          <slot />
          <p class="auth-desktop__privacy">{{ t('auth.privacyNote') }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import AppHeader from '~/components/layout/AppHeader.vue'

defineProps({
  title: { type: String, required: true },
  intro: { type: String, default: '' },
  heroText: { type: String, default: '' },
  titleId: { type: String, required: true },
})

const { t } = useLocale()
</script>

<style scoped>
.auth-desktop {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  background: #f4f8fc;
  color: #102968;
}

.auth-desktop__layout {
  display: flex;
  flex: 1;
  min-height: 0;
}

.auth-desktop__visual {
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.auth-desktop__visual > img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* ไล่สีขาวจากล่างขึ้นบน ให้ข้อความด้านล่างอ่านออกบนภาพ */
.auth-desktop__wash {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgb(244 248 252 / 94%) 0%, rgb(244 248 252 / 70%) 28%, rgb(244 248 252 / 0%) 58%);
}

.auth-desktop__copy {
  position: absolute;
  right: 8%;
  bottom: 8%;
  left: 8%;
  max-width: 544px;
}

.auth-desktop__headline {
  margin: 0;
  color: #102968;
  font-size: clamp(35px, 3.6vw, 61px);
  font-weight: 800;
  line-height: 1.2;
  text-wrap: balance;
}

.auth-desktop__text {
  max-width: 480px;
  margin: 14px 0 0;
  color: #2d4566;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.6;
}

.auth-desktop__form-area {
  display: flex;
  flex: 0 0 min(500px, 100%);
  align-items: center;
  justify-content: center;
  padding: 32px 28px;
  box-sizing: border-box;
}

.auth-desktop__card {
  width: min(100%, 432px);
  padding: 32px;
  box-sizing: border-box;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 18px 44px rgb(29 79 125 / 12%);
}

.auth-desktop__title {
  margin: 0 0 6px;
  font-size: 32px;
  line-height: 1.25;
}

.auth-desktop__intro {
  margin: 0 0 12px;
  color: #3f5a80;
  font-size: 15px;
}

.auth-desktop__privacy {
  margin: 24px 0 0;
  padding-top: 16px;
  border-top: 1px solid #e1eaf2;
  color: #52708b;
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
}

.auth-desktop__card :deep(.auth-switch) {
  margin: 20px 0 0;
  color: #3f5a80;
  font-size: 14px;
  text-align: center;
}

.auth-desktop__card :deep(.auth-switch a) {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  padding: 0 4px;
  color: #0b5fcc;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.auth-desktop__card :deep(.auth-switch a:focus-visible) {
  outline: 2px solid #0b5fcc;
  outline-offset: 2px;
  border-radius: 6px;
}

/* จอคอมแคบ: ซ่อนภาพ ให้ฟอร์มเต็มความกว้าง ไม่ล้นด้านข้าง */
@media (max-width: 900px) {
  .auth-desktop__visual {
    display: none;
  }

  .auth-desktop__form-area {
    flex: 1;
  }
}
</style>
