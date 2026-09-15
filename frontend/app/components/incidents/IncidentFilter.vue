<script setup>
const distanceOptions = ['ทุกระยะ', '0–2 กม.', '2–5 กม.', '5–10 กม.', 'มากกว่า 10 กม.'];
const statusOptions = ['ทุกสถานะ', 'ยืนยันแล้ว', 'กำลังตรวจสอบ', 'ยังไม่ยืนยัน'];
</script>

<template>
  <section class="incident-filter" aria-label="ตัวกรองเหตุการณ์">
    <label>
      <span>ระยะทาง</span>
      <select>
        <option v-for="option in distanceOptions" :key="option">{{ option }}</option>
      </select>
    </label>

    <label>
      <span>สถานะข้อมูล</span>
      <select>
        <option v-for="option in statusOptions" :key="option">{{ option }}</option>
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
