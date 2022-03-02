module.exports = {
  ...require("@snowpack/app-scripts-react/jest.config.js")(),
  testMatch: ["**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "ts-jest",
    //"^.+\\.svg$": "<rootDir>/jest/svgTransform.js",
    // "^.+\\.css$": "<rootDir>/jest/cssTransform.js",
  },
  // testEnvironment: "jsdom",
  globals: {
    "ts-jest": {
      diagnostics: {
        warnOnly: true,
      },
    },
  },
};
