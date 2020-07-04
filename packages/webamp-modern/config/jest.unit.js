module.exports = {
  displayName: "test",
  rootDir: "../",
  testRegex: "\\.test\\.(js|ts|tsx)$",
  globals: {
    SENTRY_DSN: null,
  },
  moduleFileExtensions: ["js", "tsx", "ts"],
  moduleNameMapper: {
    "\\.css$": "<rootDir>/js/__mocks__/styleMock.js",
    "\\.wsz$": "<rootDir>/js/__mocks__/fileMock.js",
    "\\.mp3$": "<rootDir>/js/__mocks__/fileMock.js",
  },
  transform: {
    "^.+\\.(js|ts|tsx)$": "babel-jest",
  },
  testPathIgnorePatterns: ["/node_modules/"],
};
