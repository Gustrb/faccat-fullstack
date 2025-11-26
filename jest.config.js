module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFiles: ['<rootDir>/tests/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.teardown.js'],
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.js', '!src/config/database.js']
};

