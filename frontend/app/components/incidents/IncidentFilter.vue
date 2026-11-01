<script setup>
const { t } = useLocale();
// ข้อความของตัวเลือกอยู่ใน locales: incidentFilter.distance.* และ incidentFilter.status.*
const distanceOptions = ['any', 'within2', 'within5', 'within10', 'over10'];
const statusOptions = ['any', 'verified', 'reviewing', 'unverified'];
</script>

<template>
  <section class="incident-filter" :aria-label="t('incidentFilter.label')">
    <label>
      <span>{{ t('incidentFilter.distanceLabel') }}</span>
      <select>
        <option v-for="option in distanceOptions" :key="option" :value="option">{{ t(`incidentFilter.distance.${option}`) }}</option>
      </select>
    </label>

    <label>
      <span>{{ t('incidentFilter.statusLabel') }}</span>
      <select>
        <option v-for="option in statusOptions" :key="option" :value="option">{{ t(`incidentFilter.status.${option}`) }}</option>
      </select>
    </label>
  </section>
</template>

<style scoped>
.incident-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #dce5f2;
  border-radius: 0.75rem;
  background: #ffffff;
}

.incident-filter label {
  display: grid;
  gap: 0.375rem;
  min-width: 11rem;
  color: #3e587a;
  font-size: 0.8rem;
  font-weight: 700;
}

.incident-filter select {
  min-height: 2.5rem;
  padding: 0 0.75rem;
  border: 1px solid #bfcde0;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #123765;
  font: inherit;
}

.incident-filter select:focus-visible {
  outline: 3px solid rgb(10 83 183 / 20%);
  border-color: #0a53b7;
}
</style>
