import { defineConfig } from 'vitest/config'
import { vueSfcSsr } from './tests/support/vue-sfc-ssr'

export default defineConfig({
  plugins: [vueSfcSsr()],
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
})
