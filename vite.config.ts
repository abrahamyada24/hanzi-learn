import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'pwa-192.png', 'pwa-512.png', 'favicon.svg'],
      manifest: {
        name: 'HanziLearn - Belajar Mandarin & Menulis',
        short_name: 'HanziLearn',
        description: 'Web belajar bahasa Mandarin mandiri: Kosakata HSK 1, asal-usul piktogram, dan latihan menulis aksara Hanzi interaktif.',
        theme_color: '#b91c1c',
        background_color: '#fafaf9',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      }
    }),
  ],
  css: {
    postcss: {},
  },
})
