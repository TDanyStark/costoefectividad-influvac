// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import path from 'path';

// https://astro.build/config
export default defineConfig({
  base: '/apps/abbott/costoefectividad-influvac',
  outDir: 'apps/abbott/costoefectividad-influvac',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      }
    }
  },
});
