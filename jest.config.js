module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  collectCoverage: true,
  collectCoverageFrom: ['apps/**/*.ts', 'packages/**/*.ts'],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  // Run a global setup that imports every source file to force coverage
  globalSetup: './tests/global-setup.ts',
};