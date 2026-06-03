import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",

      manifest: false,

      includeAssets: [
        "favicon.ico",
        "favicon.svg",
        "apple-touch-icon.png",
        "icon-192.png",
        "logo-512.png",
        "og-banner.jpg",
      ],

      workbox: {
         maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,webp,woff2,json}"],
        navigateFallback: "/index.html",
        runtimeCaching: [
          // your caching rules here
        ],
      },

      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],

  server: {
    port: 3000,
  },
});