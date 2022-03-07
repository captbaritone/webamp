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
    "/packages/webamp-modern/src/__tests__/integration*",
  ],
  testEnvironment: "jsdom",
};
