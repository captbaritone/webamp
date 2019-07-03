const fs = require("fs");
const path = require("path");
const System = require("./runtime/System");
const runtime = require("./runtime");
const interpret = require("./interpreter");

function runFile(relativePath) {
  const system = new System();
  const buffer = fs.readFileSync(path.join(__dirname, relativePath));
  interpret({ runtime, buffer, system, log: false });
}

describe("v1.1.1.b3 (Winamp 3.0 full)", () => {
  test("can call messageBox with hello World", () => {
    const mockMessageBox = jest.fn();
    // The VM depends upon the arity of this function, so we can't use
    // `mockMessageBox` directly.
    System.prototype.messageBox = function(a, b, c, d) {
      mockMessageBox(a, b, c, d);
    };
    runFile(
      "./reference/maki_compiler/v1.1.1.b3 (Winamp 3.0 full)/hello_world.maki"
    );
    expect(mockMessageBox).toHaveBeenCalledTimes(1);
    expect(mockMessageBox).toHaveBeenCalledWith(
      "Hello World",
      "Hello Title",
      1,
      null
    );
  });
});
