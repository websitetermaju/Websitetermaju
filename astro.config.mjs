// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://webtermajuumkm.com',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
