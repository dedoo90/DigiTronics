module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  testTimeout: 30000,
  collectCoverageFrom: [
    'config/**/*.js',
    'middleware/**/*.js',
    'services/**/*.js',
    'controllers/**/*.js',
    'routes/**/*.js',
    'utils/**/*.js',
    'server.js'
  ],
  coverageDirectory: '<rootDir>/coverage'
};
