module.exports = {
  automock: false,
  moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],
  testMatch: ['**/**/*.test.ts', '**/**/*.test.tsx'],
  coveragePathIgnorePatterns: [
    'node_modules',
    'coverage',
    '/__.*__/',
    'jest.config.js',
    './src/types',
  ],
  collectCoverage: false,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
}
