const fs = require("fs");
const path = require("path");
const System = require("../runtime/System");
const runtime = require("../runtime");
const interpret = require("./interpreter");
const { VERSIONS } = require("./testConstants");

async function runFile(version, fileName) {
  const relativePath = `../../resources/maki_compiler/${version}/${fileName}`;
  const system = new System();
  const data = fs.readFileSync(path.join(__dirname, relativePath));
  // Remove this await when we can run the VM synchronously.
  // See GitHub issue #814
  await interpret({ runtime, data, system, log: false });
}

// The basicTest.m file that jberg prepared follows a convention for what a
// passing test looks like. This ultility function lets us just write the
// message, since the rest is common for all success messages.
function successOutputFromMessage(message) {
  return [message, "Success", 0, ""];
}

let mockMessageBox;
beforeEach(() => {
  mockMessageBox = jest.fn();
  // The VM depends upon the arity of this function, so we can't use
  // `mockMessageBox` directly.
  System.prototype.messageBox = function(a, b, c, d) {
    mockMessageBox(...arguments);
  };
});

describe("can call messageBox with hello World", () => {
  const versions = [
    // VERSIONS.WINAMP_3_ALPHA,
    VERSIONS.WINAMP_3_BETA,
    VERSIONS.WINAMP_3_FULL,
    VERSIONS.WINAMP_5_02,
    VERSIONS.WINAMP_5_66,
  ];
  versions.forEach(version => {
    test(`with bytecode compiled by ${version}`, async () => {
      // Remove this await when we can run the VM synchronously.
      // See GitHub issue #814
      await runFile(version, "hello_world.maki");
      expect(mockMessageBox).toHaveBeenCalledTimes(1);
      expect(mockMessageBox).toHaveBeenCalledWith(
        "Hello World",
        "Hello Title",
        1,
        null
      );
    });
  });
});

describe("can use basic operators", () => {
  const versions = [
    // jberg could not get the script to compile on this version
    // VERSIONS.WINAMP_3_ALPHA,
    VERSIONS.WINAMP_3_BETA,
    VERSIONS.WINAMP_3_FULL,
    VERSIONS.WINAMP_5_02,
    VERSIONS.WINAMP_5_66,
  ];

  versions.forEach(version => {
    test(`with basic test bytecode compiled by ${version}`, async () => {
      // Remove this await when we can run the VM synchronously.
      // See GitHub issue #814
      await runFile(version, "basicTests.maki");
      expect(mockMessageBox.mock.calls).toEqual(
        [
          "2 + 2 = 4",
          "2.2 + 2.2 = 4.4",
          "4 + 4.4 = 4.4 + 4 (not implict casting)",
          "#t + #t = 2",
          "3 - 2 = 1",
          "3 - -2 = 5",
          "3.5 - 2 = 1.5",
          "2 * 3 = 6",
          "2 * 1.5 = 3",
          "#t * 3 = 3",
          "#f * 3 = 0",
          "#t * 0.25 = 0.25",
          "0.25 * #t = 0.25",
          "#f * 0.25 = 0",
          "6 / 3 = 2",
          "3 / 2 = 1.5",
          "5 % 2 = 1",
          "5.5 % 2 = 1 (implict casting)",
          "3 & 2 = 2",
          "3 | 2 = 3",
          "2 << 1 = 4",
          "4 >> 1 = 2",
          "2.5 << 1 = 4 (implict casting)",
          "4.5 >> 1 = 2 (implict casting)",
          "1 != 2",
          "1 < 2",
          "2 > 1",
          "[int] 4 = [float] 4.4 (autocasting types)",
          "! [float] 4.4 = [int] 4 (not autocasting types)",
          "[float] 4.4 != [int] 4 (not autocasting types)",
          "! [int] 4 != [float] 4.4 (autocasting types)",
          "[int] 4 <= [float] 4.4 (autocasting types)",
          "[int] 4 >= [float] 4.4 (autocasting types)",
          "! [float] 4.4 <= [int] 4 (not autocasting types)",
          "[float] 4.4 >= [int] 4 (not autocasting types)",
          "! [int] 4 < [float] 4.4 (autocasting types)",
          "! [float] 4.4 < [int] 4 (not autocasting types)",
          "! [int] 4 > [float] 4.4 (autocasting types)",
          "[float] 4.4 > [int] 4 (not autocasting types)",
          "1++ = 1",
          "1++ (after incremeent) = 2",
          "2-- = 2",
          "2-- (after decrement) = 1",
          "++1 = 2",
          "!#f",
          "!0",
          "!1 == #f",
          "1 == #t",
          "0 == #f",
          "#t && #t",
          "!(#t && #f)",
          "!(#f && #f)",
          "#t || #t",
          "#t || #f",
          "#f || #t",
          "!(#f || #f)",
          "#t || ++n (doesn't short circuit)",
          "!(#f && ++ n) (doesn't short circuit)",
        ].map(successOutputFromMessage)
      );
    });
  });
});

describe("can use simple functions", () => {
  const versions = [
    // jberg could not get the script to compile on this version
    // VERSIONS.WINAMP_3_ALPHA,
    VERSIONS.WINAMP_3_BETA,
    VERSIONS.WINAMP_3_FULL,
    VERSIONS.WINAMP_5_02,
    VERSIONS.WINAMP_5_66,
  ];

  versions.forEach(version => {
    test(`with bytecode compiled by ${version}`, async () => {
      // Remove this await when we can run the VM synchronously.
      // See GitHub issue #814
      await runFile(version, "simpleFunctions.maki");
      expect(mockMessageBox.mock.calls).toEqual(
        [
          "simple custom function",
          "simple custom function with implicit cast",
          "fib(2) == 0 (should be 1)",
          "fib(3) == -3 (should be 2)",
          "fib(9) == -63 (should be 34)",
          "fib(20) == -360 (should be 6765)",
          "global num == 0",
          "shadow num == 5",
          "localNum == 20",
          "global num == 0",
          "localNum == 20",
        ].map(successOutputFromMessage)
      );
    });
  });
});
