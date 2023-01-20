// See jest-puppeteer.config.js for the config that setups the web server.
module.exports = {
  displayName: "integration-test",
  rootDir: "../",
  preset: "jest-puppeteer",
  testRegex: "\\.integration-test\\.js$",
};
