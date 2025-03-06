import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { viteStaticCopy } from 'vite-plugin-static-copy';

dotenv.config();

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'src/img/*', dest: 'img' },       // Copy images to public/img
        { src: 'src/sounds/*', dest: 'sounds' },  // Copy sounds to public/sounds
      ],
    }),
  ],
  server: {
    port: process.env.VITE_PORT || 5173,
  },
  build: {
    outDir: 'public/dist',  // Build output should go to dist folder
    emptyOutDir: false,     // Keeps previous files in dist
    assetsDir: 'assets',    // All build assets (like JS, CSS) will go into dist/assets
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.mp3')) {
            return 'sounds/[name]';  // Ensure sound files stay in sounds folder
          }
          return 'assets/[name]';  // Other assets like JS and CSS go in assets
        },
      },
    },
  },
});
