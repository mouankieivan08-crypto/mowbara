import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'service-worker-injector',
      closeBundle() {
        const distDir = path.resolve(__dirname, 'dist');
        const assetsDir = path.resolve(distDir, 'assets');
        if (!fs.existsSync(assetsDir)) return;

        // Find all compiled asset files in dist/assets/
        const files = fs.readdirSync(assetsDir);
        const assetsToPrecache = files.map(file => `/assets/${file}`);

        // Read sw.js from dist
        const swPath = path.resolve(distDir, 'sw.js');
        if (fs.existsSync(swPath)) {
          let swContent = fs.readFileSync(swPath, 'utf8');
          // In public/sw.js, the STATIC_ASSETS array is declared.
          // We can inject the assets directly after 'const STATIC_ASSETS = ['
          const replaceStr = assetsToPrecache.map(f => `  '${f}'`).join(',\n');
          swContent = swContent.replace(
            "const STATIC_ASSETS = [",
            `const STATIC_ASSETS = [\n${replaceStr},`
          );
          fs.writeFileSync(swPath, swContent, 'utf8');
          console.log(`[ServiceWorker] Injected ${assetsToPrecache.length} build assets into dist/sw.js`);
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 500
  },
  server: {
    port: 3000,
    host: true
  }
});
