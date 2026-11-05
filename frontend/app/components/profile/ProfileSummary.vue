<template>
  <!-- ส่วนบนของหน้าโปรไฟล์: ล็อกอินแล้วแสดงข้อมูลบัญชี / ยังไม่ล็อกอินแสดงปุ่มเข้าสู่ระบบและสมัคร -->
  <section class="profile-summary" :aria-labelledby="titleId">
    <template v-if="account">
      <span class="profile-summary__avatar" aria-hidden="true">{{ initial }}</span>
      <div class="profile-summary__text">
        <h1 :id="titleId">{{ account.email }}</h1>
        <p>{{ roleLabel }}</p>
      </div>
    </template>

    <template v-else>
      <span class="profile-summary__avatar profile-summary__avatar--guest" aria-hidden="true">
        <img src="/icons/User.svg" alt="" />
      </span>
      <div class="profile-summary__text">
        <h1 :id="titleId">{{ t('profilePage.guestTitle') }}</h1>
        <p>{{ t('profilePage.guestText') }}</p>
      </div>
      <div class="profile-summary__actions">
        <NuxtLink to="/login" class="profile-summary__button profile-summary__button--primary">{{ t('header.login') }}</NuxtLink>
        <NuxtLink to="/register" class="profile-summary__button">{{ t('header.register') }}</NuxtLink>
      </div>
    </template>
  </section>
</template>

<script setup>
const props = defineProps({
  // ข้อมูลผู้ใช้จาก cookie { id, email, role } หรือ null ถ้ายังไม่ล็อกอิน
  account: { type: Object, default: null },
})

const { t } = useLocale()
const titleId = useId()

// ตัวอักษรแรกของอีเมล ใช้แทนรูปโปรไฟล์
const initial = computed(() => {
  if (!props.account?.email) return '?'
  return props.account.email.charAt(0).toUpperCase()
})

const roleLabel = computed(() => {
  if (props.account?.role === 'admin') return t('profilePage.roleAdmin')
  return t('profilePage.roleUser')
})
</script>

<style scoped>
.profile-summary {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border: 1px solid #dce5f2;
  border-radius: 14px;
  background: #fff;
}

.profile-summary__avatar {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  border-radius: 50%;
  background: #0b5fcc;
  color: #fff;
  font-size: 22px;
  font-weight: 800;
}

.profile-summary__avatar--guest {
  background: #e8f1fd;
}

.profile-summary__avatar--guest img {
  width: 28px;
  height: 28px;
}

.profile-summary__text {
  min-width: 0;
}

.profile-summary__text h1 {
  overflow: hidden;
  margin: 0;
  color: #102968;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-summary__text p {
  margin: 4px 0 0;
  color: #52708b;
  font-size: 14px;
  line-height: 1.5;
}

.profile-summary__actions {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.profile-summary__button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border: 1px solid #0b5fcc;
  border-radius: 10px;
  color: #0b5fcc;
  font-size: 15px;
  font-weight: 750;
  text-decoration: none;
}

.profile-summary__button--primary {
  background: #0b5fcc;
  color: #fff;
}

.profile-summary__button:focus-visible {
  outline: 3px solid rgb(11 95 204 / 40%);
  outline-offset: 2px;
}
</style>
