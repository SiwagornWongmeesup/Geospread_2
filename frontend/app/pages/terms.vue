<template>
  <section class="terms-page" aria-labelledby="terms-title">
    <article class="terms-page__card">
      <h1 id="terms-title">{{ t('termsPage.title') }}</h1>
      <p class="terms-page__draft">{{ t('termsPage.draft') }}</p>

      <section v-for="(section, index) in sections" :key="index" class="terms-page__section">
        <h2>{{ section.title }}</h2>
        <p>{{ section.body }}</p>
      </section>
    </article>
  </section>
</template>

<script setup>
// หน้าเงื่อนไขการใช้งาน: เปิดจากหน้าสมัครสมาชิกในแท็บใหม่ ข้อความทั้งหมดอยู่ในไฟล์ภาษา (termsPage)
const { t, tm } = useLocale()

useHead({ title: () => `${t('termsPage.title')} | GeoSpread` })

const sections = computed(() => tm('termsPage.sections') ?? [])
</script>

<style scoped>
.terms-page {
  min-height: 100%;
  padding: 16px;
  background: #edf6ff;
}

.terms-page__card {
  max-width: 736px;
  margin: 0 auto;
  padding: clamp(20px, 4vw, 40px);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 29px rgb(31 72 125 / 8%);
  color: #102968;
}

.terms-page__card h1 {
  margin: 0;
  font-size: clamp(24px, 3vw, 32px);
  line-height: 1.3;
}

.terms-page__draft {
  margin: 12px 0 0;
  padding: 10px 13px;
  border-radius: 10px;
  background: #fff6e0;
  color: #7a4b00;
  font-size: 14px;
  font-weight: 650;
}

.terms-page__section {
  margin-top: 28px;
}

.terms-page__section h2 {
  margin: 0 0 6px;
  font-size: 18px;
}

.terms-page__section p {
  max-width: 65ch;
  margin: 0;
  color: #2d4566;
  font-size: 16px;
  line-height: 1.75;
}
</style>
