module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/e2e'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.base.json'
    }]
  },
  moduleNameMapper: {
    '^@nexus/common/(.*)$': '<rootDir>/packages/common/src/$1',
    '^@nexus/common$': '<rootDir>/packages/common/src'
  },
  testMatch: ['**/*.e2e.test.ts', '**/*.integration.test.ts'],
  testTimeout: 60000,
  verbose: true
};
