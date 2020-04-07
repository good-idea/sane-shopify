module.exports = {
  automock: false,
  moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],
  testMatch: ['**/**/*.test.ts'],
  coveragePathIgnorePatterns: [
    'node_modules',
    'coverage',
    '/__.*__/',
    'jest.config.js',
    './src/types'
  ],
  collectCoverage: false,
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
}
