<script setup>
const incidentTypes = ['เลือกประเภทเหตุการณ์', 'อุบัติเหตุ', 'อัคคีภัย', 'น้ำท่วม', 'ภัยอื่น ๆ'];
</script>

<template>
  <form class="report-incident-form" @submit.prevent>
    <header>
      <h1>แจ้งเหตุการณ์</h1>
      <p>แบบฟอร์มนี้เป็นโครงสร้างเริ่มต้นและยังไม่ส่งข้อมูลไปยังระบบ</p>
    </header>

    <label>
      <span>ประเภทเหตุการณ์</span>
      <select>
        <option v-for="type in incidentTypes" :key="type">{{ type }}</option>
      </select>
    </label>

    <label>
      <span>รายละเอียด</span>
      <textarea rows="5" placeholder="อธิบายสิ่งที่เกิดขึ้น" />
    </label>

    <slot name="location" />

    <button type="submit" disabled>ส่งรายงาน (เร็ว ๆ นี้)</button>
  </form>
</template>

<style scoped>
.report-incident-form {
  display: grid;
  gap: 1.25rem;
  width: 100%;
  padding: 1.5rem;
  border: 1px solid #dce5f2;
  border-radius: 0.875rem;
  background: #ffffff;
}

.report-incident-form h1 {
  margin: 0;
  color: #123765;
  font-size: 1.5rem;
}

.report-incident-form p {
  margin: 0.5rem 0 0;
  color: #60718c;
  font-size: 0.9rem;
}

.report-incident-form label {
  display: grid;
  gap: 0.5rem;
  color: #3e587a;
  font-size: 0.875rem;
  font-weight: 700;
}

.report-incident-form select,
.report-incident-form textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #bfcde0;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #123765;
  font: inherit;
  resize: vertical;
}

.report-incident-form select:focus-visible,
.report-incident-form textarea:focus-visible {
  outline: 3px solid rgb(10 83 183 / 20%);
  border-color: #0a53b7;
}

.report-incident-form button {
  justify-self: start;
  padding: 0.75rem 1rem;
  border: 0;
  border-radius: 0.625rem;
  background: #0a53b7;
  color: #ffffff;
  font: inherit;
  font-weight: 700;
}

.report-incident-form button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
