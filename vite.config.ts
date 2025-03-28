import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  optimizeDeps: {
    exclude: ['puppeteer', 'puppeteer-core'],
    include: ['axios', 'cheerio']
  },
  resolve: {
    alias: {
      'puppeteer': 'puppeteer-core'
    }
  }
})