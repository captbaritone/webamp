import path from "path";
import { run } from "../maki-interpreter/virtualMachine";
import runtime from "../runtime";
import System from "../runtime/System";
import fs from "fs";

function runScript(filePath) {
  const scriptFullPath = path.join(
    __dirname,
    "../../resources/maki_compiler/v1.2.0 (Winamp 5.66)",
    filePath
  );

  const program = fs.readFileSync(scriptFullPath);

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  function fakeMessageBox(a, b, c, d) {
    // This function has four fake arguments because we check the arity of the
    // method in the VM to determine how many values to pop off the stack.
  }
  expect(fakeMessageBox.length).toBe(System.prototype.messagebox.length);

  const mockMessageBox = jest.fn(fakeMessageBox);
  System.prototype.messagebox = mockMessageBox;

  const system = new System();

  run({ runtime, data: program, system });

  return mockMessageBox.mock.calls
    .map(([assertion, result]) => `${result}: ${assertion}`)
    .join("\n");
}

test("basicTests", () => {
  expect(runScript("basicTests.maki")).toMatchInlineSnapshot(`
"Success: 2 + 2 = 4
Success: 2.2 + 2.2 = 4.4
Success: 4 + 4.4 = 4.4 + 4 (not implict casting)
Success: #t + #t = 2
Success: 3 - 2 = 1
Success: 3 - -2 = 5
Success: 3.5 - 2 = 1.5
Success: 2 * 3 = 6
Success: 2 * 1.5 = 3
Success: #t * 3 = 3
Success: #f * 3 = 0
Success: #t * 0.25 = 0.25
Success: 0.25 * #t = 0.25
Success: #f * 0.25 = 0
Success: 6 / 3 = 2
Success: 3 / 2 = 1.5
Success: 5 % 2 = 1
Success: 5.5 % 2 = 1 (implict casting)
Success: 3 & 2 = 2
Success: 3 | 2 = 3
Success: 2 << 1 = 4
Success: 4 >> 1 = 2
Success: 2.5 << 1 = 4 (implict casting)
Success: 4.5 >> 1 = 2 (implict casting)
Success: 1 != 2
Success: 1 < 2
Success: 2 > 1
Success: [int] 4 = [float] 4.4 (autocasting types)
Success: ! [float] 4.4 = [int] 4 (not autocasting types)
Success: [float] 4.4 != [int] 4 (not autocasting types)
Success: ! [int] 4 != [float] 4.4 (autocasting types)
Success: [int] 4 <= [float] 4.4 (autocasting types)
Success: [int] 4 >= [float] 4.4 (autocasting types)
Success: ! [float] 4.4 <= [int] 4 (not autocasting types)
Success: [float] 4.4 >= [int] 4 (not autocasting types)
Success: ! [int] 4 < [float] 4.4 (autocasting types)
Success: ! [float] 4.4 < [int] 4 (not autocasting types)
Success: ! [int] 4 > [float] 4.4 (autocasting types)
Success: [float] 4.4 > [int] 4 (not autocasting types)
Success: 1++ = 1
Success: 1++ (after incremeent) = 2
Success: 2-- = 2
Success: 2-- (after decrement) = 1
Success: ++1 = 2
Success: !#f
Success: !0
Success: !1 == #f
Success: 1 == #t
Success: 0 == #f
Success: #t && #t
Success: !(#t && #f)
Success: !(#f && #f)
Success: #t || #t
Success: #t || #f
Success: #f || #t
Success: !(#f || #f)
Success: #t || ++n (doesn't short circuit)
Success: !(#f && ++ n) (doesn't short circuit)"
`);
});
test("hello_world", () => {
  expect(runScript("hello_world.maki")).toMatchInlineSnapshot(
    `"Hello Title: Hello World"`
  );
});
