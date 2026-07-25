import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['shared/**/*.test.ts', 'tools/pipeline/**/*.test.ts'],
    environment: 'node',
  },
})
