import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Precache only the lightweight App Shell + always-visible offense/fallback icons.
      // Defense sprites are cached on demand via CacheFirst runtimeCaching below.
      includeAssets: ['favicon.ico', 'images/offense/**/*', 'images/other/defense*.webp'],
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/images/defense/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'coc-defense-images',
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 250,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/images/favicon/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'coc-favicon-images',
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
      manifest: {
        name: 'CoC Damage Calculator',
        short_name: 'CoC Calc',
        description: 'Clash of Clans ZapQuake & Hero Equipment Damage Calculator (Patch v19.32.4 - 16 Nov 2026)',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ]
      }
    })
  ],
})
