<template>
  <!-- วิธีติดตั้งบน iPhone/iPad: Safari ไม่มีหน้าต่างติดตั้ง ต้องกดเองจากปุ่มแชร์ (ใส่ไว้ใน app.vue ครั้งเดียว) -->
  <Teleport to="body">
    <div v-if="isIosHelpOpen" class="install-help" @click.self="closeIosHelp" @keydown.esc="closeIosHelp">
      <section class="install-help__sheet" role="dialog" aria-modal="true" aria-labelledby="install-help-title">
        <header class="install-help__header">
          <img src="/pwa-192x192.png" alt="" class="install-help__logo" />
          <h2 id="install-help-title">{{ t('installApp.iosTitle') }}</h2>
        </header>
        <ol class="install-help__steps">
          <li>
            <span class="install-help__number" aria-hidden="true">1</span>
            <span>{{ t('installApp.iosStep1') }}
              <!-- ไอคอนปุ่มแชร์ของ Safari (สี่เหลี่ยมมีลูกศรชี้ขึ้น) -->
              <svg class="install-help__share" viewBox="0 0 24 24" :aria-label="t('installApp.shareIcon')" role="img">
                <path d="M12 3v12M8 7l4-4 4 4M6 11H5v10h14V11h-1" />
              </svg>
            </span>
          </li>
          <li>
            <span class="install-help__number" aria-hidden="true">2</span>
            <span>{{ t('installApp.iosStep2') }}</span>
          </li>
          <li>
            <span class="install-help__number" aria-hidden="true">3</span>
            <span>{{ t('installApp.iosStep3') }}</span>
          </li>
        </ol>
        <button ref="closeButton" type="button" class="install-help__close" @click="closeIosHelp">
          {{ t('installApp.gotIt') }}
        </button>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
const { t } = useLocale()
const { isIosHelpOpen, closeIosHelp } = usePwaInstall()
const closeButton = ref(null)

// เปิดหน้าต่างแล้ว ย้ายเคอร์เซอร์ไปที่ปุ่มปิด (ใช้คีย์บอร์ด/screen reader ได้)
watch(isIosHelpOpen, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  closeButton.value?.focus()
})
</script>

<style scoped>
.install-help {
  position: fixed;
  z-index: 200;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgb(16 41 104 / 40%);
}

.install-help__sheet {
  display: grid;
  gap: 16px;
  width: 100%;
  max-width: 480px;
  padding: 20px 20px calc(20px + env(safe-area-inset-bottom));
  border-radius: 16px 16px 0 0;
  background: var(--gs-surface);
}

.install-help__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.install-help__logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgb(16 41 104 / 15%);
}

.install-help__header h2 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 18px;
  font-weight: 700;
}

.install-help__steps {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.install-help__steps li {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--gs-ink-2);
  font-size: 15px;
  line-height: 1.5;
}

.install-help__number {
  display: grid;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 50%;
  background: var(--gs-action-tint);
  color: var(--gs-action);
  font-size: 14px;
  font-weight: 700;
}

.install-help__share {
  width: 20px;
  height: 20px;
  margin-left: 4px;
  vertical-align: -4px;
  fill: none;
  stroke: #0b5fcc;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.install-help__close {
  min-height: 48px;
  border: 0;
  border-radius: 10px;
  background: var(--gs-action);
  color: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.install-help__close:focus-visible {
  outline: 3px solid rgb(29 53 87 / 40%);
  outline-offset: 2px;
}
</style>
