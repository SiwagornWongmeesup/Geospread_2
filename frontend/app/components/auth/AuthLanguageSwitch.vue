<template>
  <!-- สลับภาษาบนหน้าเข้าสู่ระบบ/สมัครของมือถือ (หน้าคอมใช้ปุ่มใน AppHeader) -->
  <div class="auth-language" role="group" :aria-label="t('common.switchLanguage')">
    <button
      v-for="option in locales"
      :key="option.code"
      type="button"
      class="auth-language__option"
      :aria-pressed="locale === option.code"
      :lang="option.code"
      :title="option.label"
      @click="setLocale(option.code)"
    >
      {{ option.short }}
    </button>
  </div>
</template>

<script setup>
const { t, locale, locales, setLocale } = useLocale()
</script>

<style scoped>
.auth-language {
  display: inline-flex;
  padding: 3px;
  border-radius: 999px;
  background: rgb(255 255 255 / 85%);
  box-shadow: 0 2px 10px rgb(16 41 104 / 10%);
}

.auth-language__option {
  min-width: 44px;
  min-height: 38px;
  padding: 0 0.6rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #3f5a80;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
}

.auth-language__option[aria-pressed='true'] {
  background: #102968;
  color: #fff;
}

.auth-language__option:focus-visible {
  outline: 2px solid #0b5fcc;
  outline-offset: 2px;
}
</style>
