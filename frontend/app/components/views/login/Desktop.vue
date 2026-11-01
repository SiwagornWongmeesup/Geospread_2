<template>
  <main class="login-page">
    <AppHeader standalone />
    <div class="login-layout">
    <section class="visual" aria-labelledby="visual-title">
      <img src="/images/login-community-background.png" :alt="t('auth.heroAlt')" />
      <div class="visual__wash" />
      <div class="visual__copy">
        <h1 id="visual-title">{{ t('auth.heroLine1') }}<br />{{ t('auth.heroLine2') }}</h1>
        <p>{{ t('auth.loginHeroText') }}</p>
      </div>
    </section>
    <section class="form-area" aria-labelledby="login-title">
      <div class="form-card">
        <NuxtLink to="/" class="form-brand">
          <img src="/logos/logo.png" alt="GeoSpread" />
          <span>GeoSpread</span>
        </NuxtLink>
        <h2 id="login-title">{{ t('header.login') }}</h2>
        <p class="intro">{{ t('auth.welcomeBack') }}</p>
        <form @submit.prevent="emit('submitLogin')">
          <p v-if="error" class="error" role="alert">{{ error }}</p>
          <label for="desktop-email">{{ t('auth.email') }}<input id="desktop-email" v-model="form.email" type="email" required autocomplete="email" placeholder="name@example.com" />
        </label>
        <label for="desktop-password">{{ t('auth.password') }}<input id="desktop-password" v-model="form.password" type="password" required autocomplete="current-password" :placeholder="t('auth.passwordPlaceholder')" />
      </label>
      <div class="form-options">
        <label>
          <input type="checkbox" /> {{ t('auth.rememberMe') }}</label>
          <a href="#support">{{ t('auth.forgotPassword') }}</a>
        </div>
        <button type="submit" :disabled="loading">{{ loading ? t('auth.checking') : t('header.login') }}</button>
      </form>
      <div class="divider">{{ t('auth.or') }}</div>
      <button type="button" class="google">
        <b>G</b>{{ t('auth.loginGoogle') }}</button>
        <p class="register">{{ t('auth.noAccount') }} <NuxtLink to="/register">{{ t('header.register') }}</NuxtLink>
      </p>
      <p id="support" class="support">{{ t('auth.privacyNote') }}</p>
    </div>
  </section>
</div>
</main>
</template>

<script setup>
const { t } = useLocale()
import AppHeader from '~/components/layout/AppHeader.vue'

defineProps({
  form: { type: Object,
  required: true },
  loading: { type: Boolean,
  default: false },
  error: { type: String,
  default: '' }
})
const emit = defineEmits(['submitLogin'])
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f4f8fc;
  color: #112c66;
}
.login-nav {
  display: flex;
  height: 4.5rem;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(1.5rem, 5vw, 5rem);
  background: #fff;
  border-bottom: 1px solid #e4edf5;
}
.brand {
  display: flex;
  align-items: center;
  gap: .55rem;
  color: #0b2372;
  font-size: 1.35rem;
  font-weight: 800;
  text-decoration: none;
}
.brand img {
  width: 90px;
  object-fit: contain;
}
.brand small {
  display: block;
  color: #60769c;
  font-size: .55rem;
  font-weight: 600;
  letter-spacing: 0;
}
.login-nav nav {
  display: flex;
  gap: 1.5rem;
}
.login-nav nav a {
  padding: .55rem .8rem;
  border-radius: .5rem;
  color: #376398;
  font-size: .9rem;
  font-weight: 700;
  text-decoration: none;
}
.login-nav nav .active {
  color: #fff;
  background: #1479ef;
}
.login-layout {
    display: flex;
}
.visual {
  position: relative;
  overflow: hidden;
}
.visual > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  filter: saturate(.8) contrast(.92);
}
.visual__wash {
  position: absolute;
  inset: 0;
  background: rgb(255 255 255 / .22);
}
.visual__copy {
  position: absolute;
  right: 8%;
  bottom: 9%;
  left: 8%;
  max-width: 34rem;
  color: #102968;
  text-shadow: 0 1px 1px rgb(255 255 255 / .6);
}
.visual__copy h1 {
  margin: 0;
  font-size: clamp(2.3rem, 4vw, 4.4rem);
  line-height: 1.08;
  letter-spacing: -.035em;
}
.visual__copy p {
  max-width: 32rem;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.6;
}
.form-area {
  width: 480px;
  min-width: 480px;
  align-items: center;
  justify-content: center;
  display: flex;
  padding: 28px;
  background: #f4f8fc;
}
.form-card {
  width: min(100%, 27rem);
  padding: 30px;
  border-radius: 1rem;
  background: rgb(255 255 255 / .96);
  box-shadow: 0 18px 44px rgb(29 79 125 / .12);
}
.form-brand {
  display: flex;
  align-items: center;
  gap: .4rem;
  color: #0b2372;
  font-weight: 800;
  text-decoration: none;
}
.form-brand img {
  width: 1.9rem;
  height: 1.9rem;
  object-fit: contain;
}
.form-card h2 {
  margin: 2rem 0 .4rem;
  font-size: 2rem;
  letter-spacing: -.03em;
}
.intro {
  margin: 0 0 1.8rem;
  color: #60769c;
}
.form-card label {
  display: grid;
  gap: .45rem;
  margin-top: 1rem;
  color: #193a70;
  font-size: .85rem;
  font-weight: 750;
}
.form-card input:not([type='checkbox']) {
  min-height: 3.15rem;
  padding: 0 .85rem;
  border: 1px solid #c8d8e8;
  border-radius: .65rem;
  font: inherit;
}
.form-card input:focus, button:focus-visible, a:focus-visible {
  border-color: #1479ef;
  outline: 3px solid rgb(20 121 239 / .2);
  outline-offset: 2px;
}
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0 1.35rem;
  font-size: .84rem;
}
.form-options label {
  display: flex;
  gap: .4rem;
  margin: 0;
}
.form-options a, .register a {
  color: #1479ef;
  font-weight: 800;
  text-decoration: none;
}
.form-card button {
  width: 100%;
  min-height: 3.3rem;
  border: 0;
  border-radius: .65rem;
  background: #1479ef;
  color: #fff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}
.form-card button:disabled {
  background: #8ca0b4;
}
.divider {
  display: flex;
  align-items: center;
  gap: .7rem;
  margin: 1.45rem 0;
  color: #68809e;
  font-size: .8rem;
}
.divider::before, .divider::after {
  flex: 1;
  height: 1px;
  content: '';
  background: #dbe5ef;
}
.form-card .google {
  border: 1px solid #c8d8e8;
  background: #fff;
  color: #102968;
}
.google b {
  margin-right: .55rem;
  color: #e64735;
  font-size: 1.2rem;
}
.register, .support {
  color: #60769c;
  font-size: .85rem;
  text-align: center;
}
.register {
  margin-top: 1.5rem;
}
.support {
  margin: 1.5rem 0 0;
  padding-top: 1rem;
  border-top: 1px solid #e1eaf2;
  font-size: .73rem;
}
.error {
  padding: .75rem;
  border-radius: .6rem;
  background: #fff1f1;
  color: #be2631;
  font-size: .85rem;
}
@media (max-width: 900px) {
  .login-layout {
    grid-template-columns: 1fr;
  }
  .visual {
    display: none;
  }
  .form-area {
    min-height: calc(100vh - 4.5rem);
  }
  .login-nav {
    padding: 0 1.25rem;
  }
  .brand small {
    display: none;
  }
}
</style>
