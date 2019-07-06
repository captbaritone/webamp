const fs = require("fs");
const path = require("path");
const System = require("./runtime/System");
const runtime = require("./runtime");
const interpret = require("./interpreter");

function runFile(relativePath) {
  const system = new System();
  const data = fs.readFileSync(path.join(__dirname, relativePath));
  interpret({ runtime, data, system, log: false });
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
    // "v1.1.0.a9 (Winamp 3 alpha 8r)",
    "v1.1.1.b3 (Winamp 3.0 build 488d)",
    "v1.1.1.b3 (Winamp 3.0 full)",
    // "v1.1.13 (Winamp 5.02)",
    // "v1.2.0 (Winamp 5.66)"
  ];
  versions.forEach(version => {
    test(`with bytecode compiled by ${version}`, () => {
      runFile(`./reference/maki_compiler/${version}/hello_world.maki`);
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
