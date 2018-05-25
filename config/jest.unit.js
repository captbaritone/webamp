module.exports = {
  displayName: "test",
  rootDir: "../",
  testRegex: "\\.test\\.js$",
  globals: {
    SENTRY_DSN: null
  },
  moduleNameMapper: {
    "\\.css$": "<rootDir>/js/__mocks__/styleMock.js",
    "\\.wsz$": "<rootDir>/js/__mocks__/fileMock.js",
    "\\.mp3$": "<rootDir>/js/__mocks__/fileMock.js"
  }
};
