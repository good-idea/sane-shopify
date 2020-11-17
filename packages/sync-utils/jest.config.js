const baseConfig = require('../../jest.config.js')

module.exports = {
  ...baseConfig,
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },

  collectCoverageFrom: ['./src/**/*.{ts,tsx}'],
}
