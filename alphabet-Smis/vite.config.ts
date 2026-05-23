import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'Logo.jpg', 'pwa-192x192.png', 'pwa-512x512.png', 'screenshot-desktop.png', 'screenshot-mobile.png'],
      manifest: {
        name: 'Alphabet SMIS',
        short_name: 'Alphabet SMIS',
        description: 'Alphabet School Management Information System',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshot-desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'screenshot-mobile.png',
            sizes: '720x1280',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,pdf,txt}'],
        maximumFileSizeToCacheInBytes: 3000000, // 3MB to allow computerLab.png (2.2MB) to be precached
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
            }
          },
          {
            // Matches any request to the backend server (localhost:3000)
            urlPattern: /^https?:\/\/localhost:3000\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // <== 7 days
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache uploaded images/files from the backend
            urlPattern: /.*\/uploads\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'backend-uploads-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // <== 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Sync POST requests when offline
            urlPattern: /^https?:\/\/localhost:3000\/.*/i,
            handler: 'NetworkOnly',
            method: 'POST',
            options: {
              backgroundSync: {
                name: 'api-post-queue',
                options: {
                  maxRetentionTime: 24 * 60 // 24 Hours
                }
              }
            }
          },
          {
            // Sync PUT requests when offline
            urlPattern: /^https?:\/\/localhost:3000\/.*/i,
            handler: 'NetworkOnly',
            method: 'PUT',
            options: {
              backgroundSync: {
                name: 'api-put-queue',
                options: {
                  maxRetentionTime: 24 * 60 // 24 Hours
                }
              }
            }
          },
          {
            // Sync DELETE requests when offline
            urlPattern: /^https?:\/\/localhost:3000\/.*/i,
            handler: 'NetworkOnly',
            method: 'DELETE',
            options: {
              backgroundSync: {
                name: 'api-delete-queue',
                options: {
                  maxRetentionTime: 24 * 60 // 24 Hours
                }
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    allowedHosts: ['.trycloudflare.com'], // From previous step
    proxy: {
      // Directs any request starting with /api to your backend
      '/api': {
        target: 'http://localhost:3306', // Your backend's local port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
