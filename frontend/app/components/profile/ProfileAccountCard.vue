<template>
  <!-- บัญชีและความปลอดภัย: สถานะอีเมล การเข้าสู่ระบบล่าสุด สิทธิ์ และลิงก์ไปเปลี่ยนรหัสผ่าน/ตั้งค่า -->
  <section class="account-card" :aria-labelledby="titleId">
    <h2 :id="titleId">{{ t('profilePage.accountTitle') }}</h2>

    <dl class="account-list">
      <div class="account-list__row">
        <dt>{{ t('profilePage.fields.email') }}</dt>
        <dd class="account-list__verified">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" /></svg>
          {{ t('profilePage.emailVerified') }}
        </dd>
      </div>
      <div class="account-list__row">
        <dt>{{ t('profilePage.lastLogin') }}</dt>
        <dd>{{ t('profilePage.lastLoginValue') }}</dd>
      </div>
      <div class="account-list__row">
        <dt>{{ t('profilePage.accountRole') }}</dt>
        <dd>{{ roleLabel }}</dd>
      </div>
    </dl>

    <div class="account-links">
      <NuxtLink to="/forgot-password" class="account-link">
        {{ t('profilePage.changePassword') }}
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
      </NuxtLink>
      <NuxtLink to="/settings" class="account-link">
        {{ t('profilePage.openSettings') }}
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  // ข้อมูลโปรไฟล์จาก useProfile (ใช้แค่ role)
  account: { type: Object, required: true },
})

const { t } = useLocale()
const titleId = useId()

const roleLabel = computed(() => {
  if (props.account.role === 'admin') {
    return t('profilePage.roleAdmin')
  }
  return t('profilePage.roleUser')
})
</script>

<style scoped>
.account-card {
  display: grid;
  gap: 12px;
  padding: 20px;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
}

.account-card h2 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 17px;
  font-weight: 800;
}

.account-list {
  display: grid;
  margin: 0;
}

.account-list__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid var(--gs-line);
}

.account-list dt {
  color: var(--gs-muted);
  font-size: 14px;
  font-weight: 600;
}

.account-list dd {
  margin: 0;
  color: var(--gs-ink);
  font-size: 14px;
  font-weight: 700;
  text-align: right;
}

.account-list .account-list__verified {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--gs-verified);
}

.account-list__verified svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.account-links {
  display: grid;
  gap: 8px;
}

.account-link {
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  border: 1px solid var(--gs-line-strong);
  border-radius: var(--gs-radius-sm);
  color: var(--gs-action);
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.account-link:hover {
  background: var(--gs-action-tint);
}

.account-link:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

.account-link svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}
</style>
