<template>
  <main class="register-page">
    <header class="register-nav">
      <NuxtLink to="/" class="brand">
        <img src="/logo.png" alt="" />
        <span>GeoSpread<small>Safer Communities Together</small>
      </span>
    </NuxtLink>
    <nav>
      <NuxtLink to="/login">เข้าสู่ระบบ</NuxtLink>
      <NuxtLink to="/register" class="active">สมัครสมาชิก</NuxtLink>
    </nav>
  </header>
  <div class="register-layout">
    <section class="visual" aria-labelledby="visual-title">
      <img src="/login-community-background.png" alt="ภาพชุมชนไทยและสถานการณ์ภัยพิบัติ" />
      <div class="visual__wash" />
      <div class="visual__copy">
        <h1 id="visual-title">ชุมชนปลอดภัย<br />เริ่มจากการช่วยเหลือกัน</h1>
        <p>ร่วมเป็นส่วนหนึ่งของชุมชนที่ช่วยกันรายงานเหตุการณ์และแบ่งปันข้อมูลความปลอดภัย</p>
      </div>
    </section>
    <section class="form-area" aria-labelledby="register-title">
      <div class="form-card">
        <div class="form-brand">
          <img src="/logo.png" alt="GeoSpread" />
          <span>GeoSpread</span>
        </div>
        <h2 id="register-title">สร้างบัญชีใหม่</h2>
        <p class="intro">ลงทะเบียนฟรี เพื่อเริ่มใช้ GeoSpread</p>
        <form @submit.prevent="emit('submitRegister')">
          <p v-if="error" class="error" role="alert">{{ error }}</p>
          <label for="desktop-reg-name">ชื่อผู้ใช้งาน<input id="desktop-reg-name" v-model="form.name" required autocomplete="name" placeholder="ชื่อของคุณ" />
        </label>
        <label for="desktop-reg-email">อีเมล<input id="desktop-reg-email" v-model="form.email" type="email" required autocomplete="email" placeholder="name@example.com" />
      </label>
      <label for="desktop-reg-password">รหัสผ่าน<input id="desktop-reg-password" v-model="form.password" type="password" required minlength="8" autocomplete="new-password" placeholder="อย่างน้อย 8 ตัวอักษร" />
    </label>
    <label class="terms">
      <input id="desktop-reg-terms" type="checkbox" :checked="acceptTerms" @change="emit('update:acceptTerms', $event.target.checked)" />
      <span>ฉันยอมรับ <NuxtLink to="/terms">เงื่อนไขการใช้งาน</NuxtLink> และนโยบายความเป็นส่วนตัว</span>
    </label>
    <button type="submit" :disabled="loading">{{ loading ? 'กำลังสร้างบัญชี...' : 'สร้างบัญชีใหม่' }}</button>
  </form>
  <div class="divider">หรือ</div>
  <button type="button" class="google">
    <b>G</b>สมัครสมาชิกด้วย Google</button>
    <p class="switch">มีบัญชีอยู่แล้ว? <NuxtLink to="/login">เข้าสู่ระบบ</NuxtLink>
  </p>
  <p class="support">ข้อมูลของคุณจะถูกใช้เพื่อให้บริการ GeoSpread เท่านั้น</p>
</div>
</section>
</div>
</main>
</template>

<script setup>
defineProps({
  form: { type: Object,
  required: true },
  loading: { type: Boolean,
  default: false },
  error: { type: String,
  default: '' },
  acceptTerms: { type: Boolean,
  default: false }
})
const emit = defineEmits(['submitRegister', 'update:acceptTerms'])
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #f4f8fc;
  color: #112c66;
}
.register-nav {
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
}
.register-nav nav {
  display: flex;
  gap: 1.5rem;
}
.register-nav nav a {
  padding: .55rem .8rem;
  border-radius: .5rem;
  color: #376398;
  font-size: .9rem;
  font-weight: 700;
  text-decoration: none;
}
.register-nav nav .active {
  color: #fff;
  background: #1479ef;
}
.register-layout {
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
  padding: 2rem;
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
}
.form-brand img {
  width: 1.9rem;
  height: 1.9rem;
  object-fit: contain;
}
.form-card h2 {
  margin: 1.5rem 0 .4rem;
  font-size: 2rem;
}
.intro {
  margin: 0 0 1.25rem;
  color: #60769c;
}
.form-card label {
  display: grid;
  gap: .38rem;
  margin-top: .75rem;
  color: #193a70;
  font-size: .83rem;
  font-weight: 750;
}
.form-card input:not([type='checkbox']) {
  min-height: 2.9rem;
  padding: 0 .8rem;
  border: 1px solid #c8d8e8;
  border-radius: .6rem;
  font: inherit;
}
.terms {
  display: flex !important;
  grid-template-columns: auto 1fr;
  gap: .5rem !important;
  align-items: start;
  color: #60769c !important;
  font-size: .75rem !important;
  line-height: 1.45;
}
.terms a, .switch a {
  color: #1479ef;
  font-weight: 800;
  text-decoration: none;
}
.form-card button {
  width: 100%;
  min-height: 3.1rem;
  margin-top: 1rem;
  border: 0;
  border-radius: .65rem;
  background: #1479ef;
  color: #fff;
  font: inherit;
  font-weight: 800;
}
.form-card button:disabled {
  background: #8ca0b4;
}
.divider {
  display: flex;
  align-items: center;
  gap: .7rem;
  margin: 1.1rem 0;
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
  margin: 0;
  border: 1px solid #c8d8e8;
  background: #fff;
  color: #102968;
}
.google b {
  margin-right: .55rem;
  color: #e64735;
  font-size: 1.2rem;
}
.switch, .support {
  color: #60769c;
  font-size: .82rem;
  text-align: center;
}
.support {
  margin: 1.25rem 0 0;
  padding-top: .9rem;
  border-top: 1px solid #e1eaf2;
  font-size: .72rem;
}
.error {
  padding: .7rem;
  border-radius: .6rem;
  background: #fff1f1;
  color: #be2631;
  font-size: .83rem;
}
@media (max-width: 900px) {
  .visual {
    display: none;
  }
  .form-area {
    width: 100%;
  }
  .brand small {
    display: none;
  }
}
</style>
