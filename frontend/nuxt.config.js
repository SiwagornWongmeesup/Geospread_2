// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/device'],
  router: {
    middleware: ['device']
  },
  runtimeConfig: {
    public: {
      mapboxToken: process.env.NUXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
    }
  }
})
