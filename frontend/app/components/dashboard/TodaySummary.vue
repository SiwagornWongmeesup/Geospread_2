<template>
  <section class="today-summary" aria-labelledby="today-summary-heading">
    <header>
      <h2 id="today-summary-heading">{{ title }}</h2>
      <NuxtLink to="/incidents">ดูรายละเอียด</NuxtLink>
    </header>
    <div class="today-summary__stats">
      <div>
        <strong class="today-summary__number today-summary__number--red">5</strong>
        <span>เหตุการณ์<br>ที่รายงาน</span>
      </div>
      <div>
        <strong class="today-summary__number today-summary__number--blue">3</strong>
        <span>คำขอช่วยเหลือ<br>วันนี้</span>
      </div>
      <div>
        <strong class="today-summary__number today-summary__number--green">ดี</strong>
        <span>ระดับความ<br>ปลอดภัยชุมชน</span>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({ title: { type: String, default: 'สรุปเหตุการณ์วันนี้' } })
</script>

<style scoped>
.today-summary {
  padding: 1rem;
  border: 1px solid #dfe8f4;
  border-radius: 0.875rem;
  background: #fff;
}

.today-summary header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.today-summary h2 {
  margin: 0;
  color: #102968;
  font-size: 0.95rem;
}

.today-summary a {
  color: #1479ef;
  font-size: 0.74rem;
  font-weight: 700;
  text-decoration: none;
}

.today-summary a:hover {
  text-decoration: underline;
}

.today-summary__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.4rem;
  margin-top: 0.75rem;
}

.today-summary__stats > div {
  display: grid;
  justify-items: center;
  gap: 0.25rem;
  min-height: 5.4rem;
  padding: 0.55rem 0.25rem;
  border: 1px solid #e6edf6;
  border-radius: 0.55rem;
  text-align: center;
}

.today-summary__number {
  font-size: 1.15rem;
  line-height: 1;
}

.today-summary__number--red {
  color: #e52d38;
}

.today-summary__number--blue {
  color: #1479ef;
}

.today-summary__number--green {
  color: #13945b;
}

.today-summary span {
  color: #50637e;
  font-size: 0.62rem;
  line-height: 1.35;
}
</style>
