module.exports = {
  launch: {
    dumpio: true,
  },
  server: {
    // Note: We require the the build be run before these tests.
    // TODO: Figure out how to get this command to run the build.
    command: "PORT=8080 yarn serve",
    port: 8080, // Jest Puppeteer will wait 5000ms for this port to come online.
    launchTimeout: 10000, // Jest Puppeteer will wait 10000ms for the server to start.
    debug: true,
    usedPortAction: "ask", // Note: "kill" will kill the process running on the port.
    waitOnScheme: {
      verbose: true,
    },
  },
};
