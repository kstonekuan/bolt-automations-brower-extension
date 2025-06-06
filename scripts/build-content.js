import { build } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function buildContentScript() {
  await build({
    configFile: false,
    build: {
      lib: {
        entry: resolve(__dirname, '../content/content.ts'),
        name: 'BoltMonitorContent',
        formats: ['iife']
      },
      rollupOptions: {
        output: {
          dir: resolve(__dirname, '../dist/content'),
          entryFileNames: 'content.js'
        }
      },
      outDir: resolve(__dirname, '../dist/content'),
      emptyOutDir: false
    }
  });
}

buildContentScript().catch(console.error);