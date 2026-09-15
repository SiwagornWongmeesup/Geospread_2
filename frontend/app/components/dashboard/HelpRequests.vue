<template>
  <section class="help-requests" aria-labelledby="help-requests-heading">
    <header class="help-requests__header">
      <div>
        <p>ชุมชนใกล้เคียง</p>
        <h2 id="help-requests-heading">{{ title }}</h2>
      </div>
      <NuxtLink to="/help-requests">ดูทั้งหมด</NuxtLink>
    </header>

    <div class="help-requests__list">
      <article v-for="request in requests" :key="request.title" class="help-request-card">
        <div class="help-request-card__visual" :class="`help-request-card__visual--${request.tone}`" aria-hidden="true">
          <span />
        </div>
        <div class="help-request-card__content">
          <h3>{{ request.title }}</h3>
          <p>{{ request.location }} · {{ request.distance }}</p>
          <small>{{ request.description }}</small>
          <NuxtLink to="/help-requests">ดูรายละเอียด</NuxtLink>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'คำขอความช่วยเหลือใกล้ฉัน',
  },
})

const requests = [
  { title: 'ต้องการเรืออพยพ', location: 'ช้างคลาน, เชียงใหม่', distance: '1.2 กม.', description: 'ผู้สูงอายุรอความช่วยเหลือจากพื้นที่น้ำท่วม', tone: 'water' },
  { title: 'ต้องการหน้ากากอนามัย', location: 'สุเทพ, เชียงใหม่', distance: '4.8 กม.', description: 'ขอหน้ากากสำหรับเด็กในพื้นที่ที่มีควัน', tone: 'smoke' },
]
</script>

<style scoped>
.help-requests { padding: 1rem; border: 1px solid #dfe8f4; border-radius: 1rem; background: #fff; box-shadow: 0 4px 16px rgb(31 72 125 / 6%); }
.help-requests__header { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.875rem; }
.help-requests__header p { margin: 0 0 0.2rem; color: #6c7c93; font-size: 0.72rem; font-weight: 600; }
.help-requests h2 { margin: 0; color: #102968; font-size: 1.05rem; }
.help-requests__header a { color: #2563eb; font-size: 0.875rem; font-weight: 600; text-decoration: none; }
.help-requests__header a:hover { text-decoration: underline; }
.help-requests__list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
.help-request-card { display: grid; grid-template-columns: 5.25rem minmax(0, 1fr); gap: 0.7rem; padding: 0.55rem; border: 1px solid #e4ebf4; border-radius: 0.75rem; }
.help-request-card__visual { position: relative; min-height: 7.1rem; overflow: hidden; border-radius: 0.55rem; }
.help-request-card__visual::before { position: absolute; right: -1.1rem; bottom: -1rem; width: 4rem; height: 4rem; border-radius: 50%; background: rgb(255 255 255 / 35%); content: ''; }
.help-request-card__visual span { position: absolute; top: 1.1rem; left: 1.25rem; width: 1.8rem; height: 2.8rem; border: 3px solid rgb(255 255 255 / 75%); border-radius: 0.9rem 0.9rem 0.4rem 0.4rem; transform: rotate(18deg); }
.help-request-card__visual--water { background: #2088e9; }
.help-request-card__visual--smoke { background: #e66441; }
.help-request-card__content { min-width: 0; }
.help-request-card h3 { margin: 0; color: #162d5b; font-size: 0.8rem; line-height: 1.35; }
.help-request-card p { margin: 0.25rem 0; color: #6d7e96; font-size: 0.68rem; }
.help-request-card small { display: -webkit-box; min-height: 2.15rem; overflow: hidden; color: #66758b; font-size: 0.68rem; line-height: 1.45; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.help-request-card a { float: right; margin-top: 0.4rem; padding: 0.3rem 0.55rem; border-radius: 0.35rem; background: #1479ef; color: #fff; font-size: 0.67rem; font-weight: 700; text-decoration: none; }
.help-request-card a:hover, .help-request-card a:focus-visible { background: #0767d8; outline: none; }
@media (max-width: 36rem) { .help-requests__list { grid-template-columns: 1fr; } }
</style>
