// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/device', '@vite-pwa/nuxt'],
  router: {
    middleware: ['device']
  },
  runtimeConfig: {
    public: {
      mapboxToken: process.env.NUXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
    }
  },

  // ไอคอนสำหรับ iPhone (Safari ไม่อ่านไอคอนจาก manifest) และสีแถบสถานะของมือถือ
  app: {
    head: {
      link: [
        { rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png' }
      ],
      meta: [
        { name: 'theme-color', content: '#ffffff' }
      ]
    }
  },

  // ---------------------------------------------------------------------------
  // PWA: ให้ติดตั้งเว็บลงหน้าจอหลักของมือถือได้เหมือนแอป
  // ---------------------------------------------------------------------------
  pwa: {
    // มีเวอร์ชันใหม่ (deploy ใหม่) ให้อัปเดตเองตอนเปิดครั้งถัดไป ไม่ต้องถามผู้ใช้
    registerType: 'autoUpdate',

    // ข้อมูลแอปที่มือถือใช้ตอนติดตั้ง: ชื่อ ไอคอน สี และหน้าที่เปิดเมื่อกดไอคอน
    manifest: {
      name: 'GeoSpread',
      short_name: 'GeoSpread',
      description: 'แจ้งและติดตามเหตุการณ์ความปลอดภัยในชุมชนใกล้คุณ',
      lang: 'th',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      icons: [
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        // maskable: Android ตัดขอบไอคอนเป็นวงกลม/สี่เหลี่ยมมนได้ โดยโลโก้ไม่โดนตัด
        { src: '/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },

    workbox: {
      // หน้าเว็บสร้างจาก server (SSR) จึงไม่ใช้หน้าสำรองหน้าเดียวแทนทุกหน้า
      navigateFallback: null,
      // เก็บไฟล์โค้ดและสไตล์ของเว็บไว้ในเครื่องตั้งแต่ติดตั้ง เปิดครั้งถัดไปจะเร็วขึ้น
      globPatterns: ['**/*.{js,css}', 'pwa-*.png', 'maskable-icon-*.png'],
      runtimeCaching: [
        {
          // หน้าเว็บ: ขอจากเน็ตก่อนเสมอ (ข้อมูลเหตุต้องสดใหม่)
          // ถ้าเน็ตหลุดหรือช้าเกิน 5 วินาที ใช้หน้าที่เคยเปิดไว้ เช่น คู่มือรับมือเหตุฉุกเฉิน
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'geospread-pages',
            networkTimeoutSeconds: 5,
            expiration: { maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 }
          }
        },
        {
          // ไอคอนและรูปในเว็บ: ไม่ค่อยเปลี่ยน ใช้ของในเครื่องก่อน
          urlPattern: ({ url }) => url.pathname.startsWith('/icons/') || url.pathname.startsWith('/images/') || url.pathname.startsWith('/logos/'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'geospread-images',
            expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }
          }
        }
      ]
    },

    // ตอนรัน npm run dev ไม่เปิด service worker จะได้ไม่ติด cache ระหว่างเขียนโค้ด
    devOptions: {
      enabled: false
    }
  }
})
