import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      
      // OPTION B: Keep this false so Vite doesn't overwrite your manual file
      manifest: false, 

      includeAssets: [
        "favicon.ico",
        "favicon.svg",
        "apple-touch-icon.png",
        "icon-192.png",
        "logo-512.png",
        "og-banner.jpg",
        "site.webmanifest", // <-- CRITICAL: Tells Vite to bundle your file
      ],
      
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // CRITICAL: Added webmanifest to the glob patterns so it gets precached
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,webp,woff2,json,webmanifest}"],
        navigateFallback: "/index.html",
        
        runtimeCaching: [
          {
            // HTML pages
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "pages-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            // JS / CSS / Workers
            urlPattern: ({ request }) => ["style", "script", "worker"].includes(request.destination),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "assets-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // FIX: Captures BOTH raw local images AND Netlify's optimized CDN paths
            urlPattern: ({ url, request }) => 
              request.destination === "image" || url.pathname.startsWith('/.netlify/images'),
            handler: "CacheFirst", // CacheFirst ensures instant offline rendering
            options: {
              cacheName: "images-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: {
                statuses: [0, 200], // 0 handles opaque/cross-origin CDN assets safely
              },
            },
          },
          {
            // Menu JSON data
            urlPattern: ({ url }) => url.pathname.endsWith(".json") || url.pathname.startsWith("/menu"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "menu-data-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            // Google Fonts
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-cache" },
          },
        ],
      },
      devOptions: { enabled: true, type: "module" },
    }),
  ],
  server: { port: 3000 },
});