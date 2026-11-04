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
  padding: 1rem;
  background: #edf6ff;
}

.terms-page__card {
  max-width: 46rem;
  margin: 0 auto;
  padding: clamp(1.25rem, 4vw, 2.5rem);
  border-radius: 0.85rem;
  background: #fff;
  box-shadow: 0 0.65rem 1.8rem rgb(31 72 125 / 8%);
  color: #102968;
}

.terms-page__card h1 {
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2rem);
  line-height: 1.3;
}

.terms-page__draft {
  margin: 0.75rem 0 0;
  padding: 0.6rem 0.8rem;
  border-radius: 0.6rem;
  background: #fff6e0;
  color: #7a4b00;
  font-size: 0.88rem;
  font-weight: 650;
}

.terms-page__section {
  margin-top: 1.75rem;
}

.terms-page__section h2 {
  margin: 0 0 0.4rem;
  font-size: 1.15rem;
}

.terms-page__section p {
  max-width: 65ch;
  margin: 0;
  color: #2d4566;
  font-size: 1rem;
  line-height: 1.75;
}
</style>
