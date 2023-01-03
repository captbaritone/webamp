module.exports = {
  displayName: "test",
  rootDir: "../",
  testRegex: "\\.test\\.(js|ts|tsx)$",
  moduleFileExtensions: ["js", "tsx", "ts"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "dist",
    // TODO: Add these as we can...
    "/packages/webamp/",
    // TODO: Fix config import so that this can work.
    "/packages/webamp-modern/src/__tests__/integration*",
  ],
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/packages/skin-database/jest-setup.js"],
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
};
