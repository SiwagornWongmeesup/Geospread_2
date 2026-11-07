// ธีม Tailwind ที่คอมโพเนนต์แบบ shadcn-vue (app/components/ui) ใช้
// ชื่อสีตามแบบ shadcn (card, muted, primary, border ...) แต่ชี้ไปที่โทเคน --gs-* ใน app.vue
// เปลี่ยนสีที่ app.vue ที่เดียว คอมโพเนนต์ ui จะเปลี่ยนตาม
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        border: 'var(--gs-line)',
        background: 'var(--gs-paper)',
        foreground: 'var(--gs-ink)',
        card: { DEFAULT: 'var(--gs-surface)', foreground: 'var(--gs-ink)' },
        muted: { DEFAULT: 'var(--gs-surface-sunken)', foreground: 'var(--gs-muted)' },
        primary: { DEFAULT: 'var(--gs-action)', foreground: '#ffffff' },
        destructive: { DEFAULT: 'var(--gs-danger)', foreground: '#ffffff' },
      },
      borderRadius: {
        lg: 'var(--gs-radius)',
        md: 'var(--gs-radius-sm)',
      },
      fontFamily: {
        sans: ['var(--gs-font)'],
      },
    },
  },
}
