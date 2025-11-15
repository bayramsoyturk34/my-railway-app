module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/server/__tests__/**/*.test.js'
  ],
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true
};