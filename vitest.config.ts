import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    typecheck: {
      enabled: true,
      tsconfig: 'tsconfig.test.json',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['ts/game/**/*.ts', 'ts/data/**/*.ts'],
      exclude: ['ts/**/*.d.ts']
    }
  },
  resolve: {
    // Allow Vitest to resolve .ts extensions
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  }
})
