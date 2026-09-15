<template>
  <section class="recent-activity" aria-labelledby="recent-activity-heading">
    <header class="recent-activity__header">
      <div>
        <p>อัปเดตจากระบบ</p>
        <h2 id="recent-activity-heading">{{ title }}</h2>
      </div>
      <NuxtLink to="/notifications">ดูทั้งหมด</NuxtLink>
    </header>

    <ol class="recent-activity__list">
      <li v-for="activity in activities" :key="activity.text">
        <span class="recent-activity__marker" :class="`recent-activity__marker--${activity.tone}`" aria-hidden="true" />
        <span class="recent-activity__text">{{ activity.text }}</span>
        <time>{{ activity.time }}</time>
      </li>
    </ol>
  </section>
</template>

<script setup>
defineProps({ title: { type: String, default: 'กิจกรรมล่าสุด' } })

const activities = [
  { text: 'มีรายงานไฟป่าใกล้ดอยสุเทพ', time: '28 นาที', tone: 'red' },
  { text: 'พบต้นไม้ล้มบนถนนสันทราย', time: '2 ชม.', tone: 'green' },
  { text: 'ระดับน้ำเพิ่มขึ้นในช้างคลาน', time: '3 ชม.', tone: 'blue' },
  { text: 'ปิดการจราจรบนถนนสาย 121', time: '5 ชม.', tone: 'orange' },
]
</script>

<style scoped>
.recent-activity { padding: 1rem; border: 1px solid #dfe8f4; border-radius: 1rem; background: #fff; box-shadow: 0 4px 16px rgb(31 72 125 / 6%); }
.recent-activity__header { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.75rem; }
.recent-activity__header p { margin: 0 0 0.2rem; color: #6c7c93; font-size: 0.72rem; font-weight: 600; }
.recent-activity h2 { margin: 0; color: #102968; font-size: 1.05rem; }
.recent-activity__header a { color: #2563eb; font-size: 0.875rem; font-weight: 600; text-decoration: none; }
.recent-activity__header a:hover { text-decoration: underline; }
.recent-activity__list { display: grid; gap: 0.25rem; margin: 0; padding: 0; list-style: none; }
.recent-activity__list li { display: grid; grid-template-columns: 0.65rem minmax(0, 1fr) auto; align-items: center; gap: 0.55rem; padding: 0.45rem 0; border-bottom: 1px solid #eef2f7; }
.recent-activity__list li:last-child { border-bottom: 0; }
.recent-activity__marker { width: 0.6rem; height: 0.6rem; border-radius: 50%; }
.recent-activity__marker--red { background: #e63c47; }.recent-activity__marker--green { background: #1da66b; }.recent-activity__marker--blue { background: #177fea; }.recent-activity__marker--orange { background: #ea8b26; }
.recent-activity__text { overflow: hidden; color: #344865; font-size: 0.76rem; text-overflow: ellipsis; white-space: nowrap; }
.recent-activity time { color: #8290a5; font-size: 0.68rem; }
</style>
