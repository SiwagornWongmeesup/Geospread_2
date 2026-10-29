<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// ฟอนต์ไทยแบบมีหัว อ่านง่ายสำหรับคนทุกวัย ใช้ทั้งแอปแทน system-ui
useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai+Looped:wght@400;500;600;700&display=swap'
    }
  ]
})
</script>

<style>
/* โทเคนกลางของ GeoSpread: โทนสงบ น่าเชื่อถือ
   - หมึกน้ำเงินเข้มเป็นโครง (ไม่ใช่ฟ้า SaaS)
   - แดงจากโลโก้ใช้กับเหตุ/อันตรายเท่านั้น
   - เขียวหัวเป็ดคือ "ความช่วยเหลือจากชุมชน" */
:root {
  --gs-font: 'IBM Plex Sans Thai Looped', 'Noto Sans Thai', Tahoma, sans-serif;

  --gs-paper: #f4f3ef;
  --gs-surface: #ffffff;
  --gs-surface-sunken: #f8f7f4;
  --gs-line: #e2e0d9;
  --gs-line-strong: #cbc8bf;

  --gs-ink: #17202e;
  --gs-ink-2: #384152;
  --gs-muted: #596171;

  --gs-action: #1d3557;
  --gs-action-hover: #132640;
  --gs-action-tint: #e8ecf2;

  --gs-danger: #c3282d;
  --gs-danger-hover: #a51f24;
  --gs-danger-tint: #fbeceb;

  --gs-pending: #8a5100;
  --gs-pending-tint: #fbf0dc;

  --gs-help: #0d6b5d;
  --gs-help-hover: #08574b;
  --gs-help-tint: #e2f0ec;

  --gs-verified: #1b6a3a;

  --gs-radius: 10px;
  --gs-radius-sm: 6px;
  --gs-focus: 0 0 0 3px rgb(29 53 87 / 30%);
}

/* Reset style พื้นฐาน */
body {
  margin: 0;
  padding: 0;
  font-family: var(--gs-font);
  background-color: var(--gs-paper);
  color: var(--gs-ink);
  -webkit-font-smoothing: antialiased;
}

button,
input,
select,
textarea {
  font-family: inherit;
}

::selection {
  background: #f6d9d6;
  color: var(--gs-ink);
}

* {
  scrollbar-color: var(--gs-line-strong) transparent;
}

:focus-visible {
  outline-color: var(--gs-action);
}
</style>
