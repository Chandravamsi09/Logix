module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages', '<rootDir>/services', '<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.base.json',
      isolatedModules: true
    }]
  },
  moduleNameMapper: {
    '^@nexus/common/(.*)$': '<rootDir>/packages/common/src/$1',
    '^@nexus/common$': '<rootDir>/packages/common/src'
  },
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/apps/web-dashboard/'],
  collectCoverageFrom: [
    'packages/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/dist/**',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  verbose: true,
  testTimeout: 30000
};
