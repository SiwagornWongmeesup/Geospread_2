<template>
  <!-- แถบเบอร์ฉุกเฉิน: ถ้าอันตรายต่อชีวิต ให้โทรก่อนกรอกฟอร์ม กดเบอร์แล้วเปิดหน้าโทรออกของมือถือ
       ใช้ที่ฟอร์มแจ้งเหตุ ฟอร์มขอความช่วยเหลือ และเมนูปุ่มบวกบนมือถือ -->
  <aside class="emergency-strip" :class="{ 'emergency-strip--compact': compact }" :aria-label="t('emergency.label')">
    <p class="emergency-strip__title">{{ t('emergency.title') }}</p>
    <ul class="emergency-strip__numbers">
      <li v-for="line in hotlines" :key="line.number">
        <a :href="`tel:${line.number}`" class="emergency-strip__call">
          <strong>{{ line.number }}</strong>
          <span>{{ t(line.label) }}</span>
        </a>
      </li>
    </ul>
  </aside>
</template>

<script setup>
defineProps({
  // แบบย่อ: ใช้ในเมนูปุ่มบวก (พื้นที่น้อย)
  compact: { type: Boolean, default: false },
})

const { t } = useLocale()

// เบอร์ฉุกเฉินหลักของประเทศไทย
const hotlines = [
  { number: '191', label: 'emergency.police' },
  { number: '1669', label: 'emergency.medical' },
  { number: '199', label: 'emergency.fire' },
  { number: '1784', label: 'emergency.disaster' },
]
</script>

<style scoped>
.emergency-strip {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid #f1c4c6;
  border-radius: 12px;
  background: var(--gs-danger-tint);
}

.emergency-strip__title {
  margin: 0;
  color: #8f1d22;
  font-size: 14px;
  font-weight: 700;
}

.emergency-strip__numbers {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.emergency-strip__call {
  display: grid;
  min-height: 48px;
  align-content: center;
  justify-items: center;
  padding: 4px;
  border: 1px solid #ecb3b6;
  border-radius: 8px;
  background: var(--gs-surface);
  color: #8f1d22;
  text-decoration: none;
}

.emergency-strip__call strong {
  font-size: 17px;
  font-variant-numeric: tabular-nums;
  font-weight: 800;
  line-height: 1.1;
}

.emergency-strip__call span {
  overflow: hidden;
  max-width: 100%;
  font-size: 12px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.emergency-strip__call:active {
  background: #fff5f5;
}

.emergency-strip__call:focus-visible {
  outline: 3px solid rgb(195 40 45 / 40%);
  outline-offset: 2px;
}

.emergency-strip--compact {
  padding: 10px;
}

.emergency-strip--compact .emergency-strip__title {
  font-size: 13px;
}
</style>
