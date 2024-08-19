module.exports = {
    preset: 'react-native',
    transformIgnorePatterns: [
      'node_modules/(?!(react-native|react-navigation|@react-native|@react-navigation/.*))',
    ],
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  };
  