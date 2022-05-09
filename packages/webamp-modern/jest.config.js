module.exports = {
    displayName: "webamp-modern-test",
    // rootDir: path.join(__dirname, "/packages/webamp-modern/src"),
    rootDir: "./",
    testRegex: "\\.test\\.(js|ts)$",
    moduleFileExtensions: ["js", "ts"],
    testPathIgnorePatterns: [
      "/node_modules/",
      "build",
      "dist",
      "/temp/",
    ],
    // testEnvironment: "jsdom",
    // setupFiles: ["<rootDir>/packages/skin-database/jest-setup.js"],
  };