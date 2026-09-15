<script setup>
defineProps({
  title: {
    type: String,
    default: 'ยังไม่มีชื่อเหตุการณ์'
  },
  category: {
    type: String,
    default: 'รอระบุประเภท'
  },
  severity: {
    type: String,
    default: 'รอประเมิน'
  }
});
</script>

<template>
  <article class="incident-card">
    <div class="incident-card__meta">
      <span>{{ category }}</span>
      <span>{{ severity }}</span>
    </div>

    <h3>{{ title }}</h3>

    <div class="incident-card__details">
      <slot>รายละเอียดเหตุการณ์จะแสดงเมื่อมีข้อมูลจากระบบ</slot>
    </div>
  </article>
</template>

<style scoped>
.incident-card {
  padding: 1rem;
  border: 1px solid #dce5f2;
  border-radius: 0.75rem;
  background: #ffffff;
}

.incident-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  color: #315b8f;
  font-size: 0.75rem;
  font-weight: 700;
}

.incident-card__meta span {
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  background: #eaf2ff;
}

.incident-card h3 {
  margin: 0.75rem 0 0;
  color: #123765;
  font-size: 1rem;
}

.incident-card__details {
  margin-top: 0.5rem;
  color: #60718c;
  font-size: 0.875rem;
  line-height: 1.6;
}
</style>
