module.exports = {
  launch: {
    dumpio: true,
  },
  server: {
    // Note: We require the the build be run before these tests.
    // TODO: Figure out how to get this command to run the build.
    command: "npm run serve",
    port: 8080, // Jest Puppeteer will wait 5000ms for this port to come online.
  },
};
