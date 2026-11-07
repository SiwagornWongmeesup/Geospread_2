<template>
  <!-- ส่วนบนของหน้าโปรไฟล์: ล็อกอินแล้วแสดงรูป ชื่อ บทบาท และคะแนนความน่าเชื่อถือ / ยังไม่ล็อกอินแสดงปุ่มเข้าสู่ระบบและสมัคร -->
  <section class="profile-summary" :aria-labelledby="titleId">
    <template v-if="account">
      <span class="profile-summary__avatar" aria-hidden="true">
        <img v-if="account.avatarUrl" :src="account.avatarUrl" alt="" />
        <template v-else>{{ initial }}</template>
      </span>
      <div class="profile-summary__text">
        <h1 :id="titleId">{{ displayName }}</h1>
        <p>
          <span class="profile-summary__role">{{ roleLabel }}</span>
          <span v-if="memberSince" class="profile-summary__since">{{ t('profilePage.memberSince', { date: memberSince }) }}</span>
        </p>
      </div>

      <!-- คะแนนความน่าเชื่อถือ 0–100 -->
      <div v-if="trustScore !== null" class="trust" :class="`trust--${trustLevel}`">
        <div class="trust__head">
          <span>{{ t('profilePage.trustTitle') }}</span>
          <strong>{{ trustScore }}<small>/100</small></strong>
        </div>
        <div
          class="trust__meter"
          role="meter"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="trustScore"
          :aria-valuetext="`${trustScore}/100 ${trustLevelLabel}`"
          :aria-label="t('profilePage.trustTitle')"
        >
          <span :style="{ width: `${trustScore}%` }" />
        </div>
        <p class="trust__level">{{ trustLevelLabel }}</p>
        <p class="trust__hint">{{ t('profilePage.trustHint') }}</p>
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
  // ข้อมูลโปรไฟล์จาก useProfile { name, lastname, email, role, avatarUrl, trustScore, createdAt } หรือ null ถ้ายังไม่ล็อกอิน
  account: { type: Object, default: null },
})

const { t, locale } = useLocale()
const titleId = useId()

// ชื่อ-นามสกุล ถ้ายังไม่มีชื่อใช้อีเมลแทน
const displayName = computed(() => {
  const fullName = [props.account?.name, props.account?.lastname].filter(Boolean).join(' ')
  return fullName || props.account?.email || ''
})

// ตัวอักษรแรกของชื่อ ใช้แทนรูปโปรไฟล์เมื่อยังไม่มีรูป
const initial = computed(() => {
  const firstLetter = displayName.value.charAt(0)
  if (!firstLetter) {
    return '?'
  }
  return firstLetter.toUpperCase()
})

const roleLabel = computed(() => {
  if (props.account?.role === 'admin') return t('profilePage.roleAdmin')
  return t('profilePage.roleUser')
})

// คะแนนต้องเป็นตัวเลข 0–100 ถ้าไม่มีคะแนนจะไม่แสดงส่วนนี้
const trustScore = computed(() => {
  const score = Number(props.account?.trustScore)
  if (!Number.isFinite(score)) {
    return null
  }

  const roundedScore = Math.round(score)
  if (roundedScore < 0) {
    return 0
  }
  if (roundedScore > 100) {
    return 100
  }
  return roundedScore
})

// เกณฑ์ระดับ: 80 ขึ้นไป = สูง, 50–79 = ปานกลาง, ต่ำกว่า 50 = ต่ำ
const trustLevel = computed(() => {
  if (trustScore.value >= 80) return 'high'
  if (trustScore.value >= 50) return 'medium'
  return 'low'
})

const trustLevelLabel = computed(() => t(`profilePage.trustLevel.${trustLevel.value}`))

const memberSince = computed(() => {
  const date = props.account?.createdAt ? new Date(props.account.createdAt) : null
  if (!date || Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale.value === 'th' ? 'th-TH' : 'en-GB', { year: 'numeric', month: 'long' }).format(date)
})
</script>

<style scoped>
.profile-summary {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
}

.profile-summary__avatar {
  display: grid;
  width: 72px;
  height: 72px;
  overflow: hidden;
  place-items: center;
  border-radius: 50%;
  background: var(--gs-action);
  color: #fff;
  font-size: 28px;
  font-weight: 800;
}

.profile-summary__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-summary__avatar--guest {
  background: var(--gs-action-tint);
}

.profile-summary__avatar--guest img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.profile-summary__text {
  min-width: 0;
}

.profile-summary__text h1 {
  overflow: hidden;
  margin: 0;
  color: var(--gs-ink);
  font-size: 20px;
  font-weight: 800;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-summary__text p {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  margin: 4px 0 0;
  color: var(--gs-muted);
  font-size: 14px;
  line-height: 1.5;
}

.profile-summary__role {
  padding: 1px 10px;
  border-radius: 999px;
  background: var(--gs-action-tint);
  color: var(--gs-action);
  font-size: 13px;
  font-weight: 700;
}

/* คะแนนความน่าเชื่อถือ */
.trust {
  --trust-color: var(--gs-verified);
  --trust-tint: #e3f1e8;
  display: grid;
  grid-column: 1 / -1;
  gap: 8px;
  padding: 14px 16px;
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface-sunken);
}

.trust--medium {
  --trust-color: var(--gs-pending);
  --trust-tint: var(--gs-pending-tint);
}

.trust--low {
  --trust-color: var(--gs-danger);
  --trust-tint: var(--gs-danger-tint);
}

.trust__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  color: var(--gs-ink-2);
  font-size: 14px;
  font-weight: 700;
}

.trust__head strong {
  color: var(--trust-color);
  font-size: 26px;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.trust__head small {
  margin-left: 2px;
  color: var(--gs-muted);
  font-size: 13px;
  font-weight: 600;
}

.trust__meter {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--trust-tint);
}

.trust__meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--trust-color);
  transition: width 300ms ease;
}

.trust__level {
  margin: 0;
  color: var(--trust-color);
  font-size: 13px;
  font-weight: 700;
}

.trust__hint {
  margin: 0;
  color: var(--gs-muted);
  font-size: 13px;
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
  border: 1px solid var(--gs-action);
  border-radius: var(--gs-radius-sm);
  color: var(--gs-action);
  font-size: 15px;
  font-weight: 750;
  text-decoration: none;
}

.profile-summary__button--primary {
  background: var(--gs-action);
  color: #fff;
}

.profile-summary__button:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

@media (prefers-reduced-motion: reduce) {
  .trust__meter span {
    transition: none;
  }
}
</style>
