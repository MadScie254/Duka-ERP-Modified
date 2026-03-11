import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'NyumbaIQ',
        short_name: 'NyumbaIQ',
        theme_color: '#0A1628',
        background_color: '#0A1628',
        start_url: '/dashboard',
        display: 'standalone',
        icons: [
          { src: '/icons/nyumbaiq.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/icons/nyumbaiq.svg', sizes: '512x512', type: 'image/svg+xml' }
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
