import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['dotenv/config'],
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts', 
        'src/shared/testing/**',
        'src/**/index.ts',             
        'src/main/server.ts',
        'src/application/interfaces/**',
        'src/**/*DTO.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
        'src/domain/**': { lines: 95, functions: 95, branches: 90, statements: 95 },
      },
    },
    fileParallelism: false,
  },
});
