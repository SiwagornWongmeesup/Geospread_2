<template>
  <!-- ชวนติดตั้งแอป: แสดงเฉพาะเครื่องที่ติดตั้งได้และยังไม่ได้ติดตั้ง
       variant="banner" กดปิดได้ (จำไว้ในเครื่อง) / variant="row" เป็นแถวในเมนู แสดงตลอดจนกว่าจะติดตั้ง -->
  <div v-if="isVisible" class="install-app" :class="`install-app--${variant}`">
    <img src="/pwa-192x192.png" alt="" class="install-app__logo" />
    <!-- แบนเนอร์ในแผ่นรายการ: ข้อความบรรทัดเดียว ไม่กินพื้นที่รายการเหตุ / แถวในหน้าโปรไฟล์: มีคำอธิบายเพิ่ม -->
    <p class="install-app__text">
      <strong v-if="variant === 'banner'">{{ t('installApp.bannerTitle') }}</strong>
      <template v-else>
        <strong>{{ t('installApp.title') }}</strong>
        <span>{{ t('installApp.hint') }}</span>
      </template>
    </p>
    <button type="button" class="install-app__button" @click="install">
      {{ t('installApp.button') }}
    </button>
    <button
      v-if="variant === 'banner'"
      type="button"
      class="install-app__dismiss"
      :aria-label="t('installApp.dismiss')"
      @click="dismiss"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  variant: { type: String, default: 'banner' },
})

const { t } = useLocale()
const { canInstall, install } = usePwaInstall()

// กดปิดแบนเนอร์แล้วจำไว้ในเครื่อง ไม่แสดงอีก (ยังติดตั้งได้จากหน้าโปรไฟล์)
const DISMISS_KEY = 'geospread-install-banner-dismissed'
const isDismissed = ref(false)

onMounted(() => {
  try {
    isDismissed.value = localStorage.getItem(DISMISS_KEY) === 'true'
  } catch {
    /* เปิดแบบส่วนตัว/บล็อก storage: แสดงตามปกติ */
  }
})

const isVisible = computed(() => {
  if (!canInstall.value) return false
  if (props.variant === 'banner' && isDismissed.value) return false
  return true
})

const dismiss = () => {
  isDismissed.value = true
  try {
    localStorage.setItem(DISMISS_KEY, 'true')
  } catch {
    /* เก็บไม่ได้ก็ซ่อนแค่รอบนี้ */
  }
}
</script>

<style scoped>
.install-app {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #c9dbf2;
  border-radius: 12px;
  background: #eef5fe;
}

.install-app--banner {
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  gap: 8px;
  padding: 6px 6px 6px 10px;
}

.install-app--banner .install-app__logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.install-app--row {
  border-color: #dce5f2;
  border-radius: 14px;
  background: var(--gs-surface);
}

.install-app__logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgb(16 41 104 / 15%);
}

.install-app__text {
  display: grid;
  gap: 2px;
  margin: 0;
  min-width: 0;
}

.install-app__text strong {
  color: #102968;
  font-size: 14px;
  font-weight: 700;
}

.install-app__text span {
  color: #52708b;
  font-size: 12px;
  line-height: 1.4;
}

.install-app__button {
  min-height: 40px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  background: var(--gs-action);
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}

.install-app__dismiss {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #52708b;
  cursor: pointer;
}

.install-app__dismiss svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 2;
}

.install-app__button:focus-visible,
.install-app__dismiss:focus-visible {
  outline: 3px solid rgb(29 53 87 / 40%);
  outline-offset: 2px;
}
</style>
