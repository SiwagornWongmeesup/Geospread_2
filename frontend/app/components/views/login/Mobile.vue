<template>
  <main class="mobile-login">
    <div class="mobile-login__map" aria-hidden="true">
      <span class="mobile-login__route" />
      <span class="mobile-login__pin" />
    </div>
    <div class="mobile-login__content">
      <NuxtLink to="/" class="brand" :aria-label="t('auth.backHome')">
        <img src="/logos/logo.png" alt="" class="brand__logo" />
        <span>GeoSpread</span>
      </NuxtLink>
      <header class="mobile-login__header">
        <p>{{ t('auth.mobileKicker') }}</p>
        <h1>{{ t('header.login') }}</h1>
        <span>{{ t('auth.mobileTagline') }}</span>
      </header>
      <section class="mobile-card" :aria-label="t('auth.loginForm')">
        <form @submit.prevent="emit('submitLogin')">
          <div v-if="error" class="error-alert" role="alert" aria-live="assertive">{{ error }}</div>
          <div class="field">
            <label for="mobile-email">{{ t('auth.email') }}</label>
            <input id="mobile-email" v-model="form.email" type="email" required autocomplete="email" inputmode="email" placeholder="name@example.com" />
          </div>
          <div class="field">
            <label for="mobile-password">{{ t('auth.password') }}</label>
            <input id="mobile-password" v-model="form.password" type="password" required autocomplete="current-password" :placeholder="t('auth.password')" />
          </div>
          <button id="mobile-login-btn" type="submit" :disabled="loading" class="submit-btn">
            {{ loading ? t('auth.checking') : t('header.login') }}
          </button>
        </form>
        <div class="divider">{{ t('auth.orLoginWith') }}</div>
        <button type="button" class="google-btn">
          <span>G</span>{{ t('auth.loginGoogle') }}</button>
        </section>
        <footer class="mobile-login__footer">
          <p>{{ t('auth.noAccount') }} <NuxtLink to="/register">{{ t('header.register') }}</NuxtLink>
        </p>
        <span>{{ t('auth.recoverySoon') }}</span>
      </footer>
    </div>
  </main>
</template>

<script setup>
const { t } = useLocale()
defineProps({
  form: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' }
})

const emit = defineEmits(['submitLogin'])
</script>

<style scoped>
.mobile-login {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background: #f7fafc;
  color: #102968;
}
.mobile-login__map {
  position: absolute;
  inset: 0 0 auto;
  height: 19rem;
  overflow: hidden;
  background: linear-gradient(135deg, #e4f4ef, #e9f5ff 54%, #dceef8);
}
.mobile-login__map::before {
  position: absolute;
  inset: -4rem;
  content: '';
  background: repeating-linear-gradient(90deg, transparent 0 4.1rem, rgb(20 121 239 / .09) 4.16rem 4.23rem), repeating-linear-gradient(0deg, transparent 0 4.1rem, rgb(20 121 239 / .09) 4.16rem 4.23rem);
  transform: rotate(-12deg);
}
.mobile-login__route {
  position: absolute;
  top: 49%;
  left: -15%;
  width: 130%;
  height: .33rem;
  border-radius: 999px;
  background: #78bed8;
  box-shadow: 0 0 0 .55rem rgb(255 255 255 / .6);
  transform: rotate(-22deg);
}
.mobile-login__pin {
  position: absolute;
  top: 35%;
  right: 20%;
  width: 1.2rem;
  height: 1.2rem;
  border: .25rem solid #fff;
  border-radius: 50% 50% 50% 0;
  background: #e8333c;
  box-shadow: 0 4px 12px rgb(232 51 60 / .28);
  transform: rotate(-45deg);
}
.mobile-login__content {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  padding: 1.5rem 1.25rem 2rem;
}
.brand {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: .55rem;
  color: #102968;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -.05em;
  text-decoration: none;
}
.brand__logo {
  width: 2.05rem;
  height: 2.05rem;
  object-fit: contain;
}
.brand:focus-visible, a:focus-visible, button:focus-visible, input:focus-visible {
  outline: 3px solid rgb(20 121 239 / .35);
  outline-offset: 3px;
}
.mobile-login__header {
  margin: 3.5rem .3rem 1.6rem;
}
.mobile-login__header p {
  margin: 0 0 .65rem;
  color: #1479ef;
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.mobile-login__header h1 {
  margin: 0;
  font-size: 2.25rem;
  letter-spacing: -.06em;
}
.mobile-login__header span {
  display: block;
  margin-top: .55rem;
  color: #52708b;
  font-size: .9rem;
}
.mobile-card {
  padding: 1.4rem;
  border: 1px solid #d8e6f0;
  border-radius: 1rem;
  background: rgb(255 255 255 / .94);
  box-shadow: 0 12px 30px rgb(24 74 113 / .12);
  backdrop-filter: blur(8px);
}
.error-alert {
  margin-bottom: 1rem;
  padding: .8rem;
  border: 1px solid #f4c8ca;
  border-radius: .65rem;
  background: #fff4f4;
  color: #b4232d;
  font-size: .84rem;
  line-height: 1.4;
}
.field {
  margin-bottom: 1rem;
}
.field label {
  display: block;
  margin-bottom: .45rem;
  color: #27496b;
  font-size: .86rem;
  font-weight: 750;
}
.field input {
  box-sizing: border-box;
  width: 100%;
  min-height: 3.25rem;
  padding: 0 .85rem;
  border: 1px solid #cbd9e5;
  border-radius: .68rem;
  background: #fff;
  color: #132f4d;
  font: inherit;
  font-size: 1rem;
}
.field input::placeholder {
  color: #8ca0b4;
}
.field input:focus {
  border-color: #1479ef;
  box-shadow: 0 0 0 4px rgb(20 121 239 / .12);
  outline: none;
}
.submit-btn {
  width: 100%;
  min-height: 3.3rem;
  margin-top: .3rem;
  border: 0;
  border-radius: .68rem;
  background: #1479ef;
  box-shadow: 0 8px 18px rgb(20 121 239 / .2);
  color: #fff;
  font: inherit;
  font-size: 1rem;
  font-weight: 800;
}
.submit-btn:disabled {
  background: #8ca0b4;
  box-shadow: none;
}
.divider {
  display: flex;
  align-items: center;
  gap: .6rem;
  margin: 1.25rem 0;
  color: #6d819e;
  font-size: .75rem;
  text-align: center;
}
.divider::before,
.divider::after {
  flex: 1;
  height: 1px;
  content: '';
  background: #d8e2ef;
}
.google-btn {
  width: 100%;
  min-height: 3.2rem;
  border: 1px solid #c9d7e8;
  border-radius: .68rem;
  background: #fff;
  color: #102968;
  font: inherit;
  font-weight: 800;
}
.google-btn span {
  margin-right: .55rem;
  color: #e94335;
  font-size: 1.2rem;
}
.mobile-login__footer {
  margin: auto 0 0;
  padding-top: 1.6rem;
  color: #60778f;
  font-size: .84rem;
  text-align: center;
}
.mobile-login__footer p {
  margin: 0;
}
.mobile-login__footer a {
  color: #1479ef;
  font-weight: 800;
  text-decoration: none;
}
.mobile-login__footer span {
  display: block;
  margin-top: .7rem;
  color: #7a90a5;
  font-size: .73rem;
}
</style>
