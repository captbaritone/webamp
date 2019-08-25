import { getClass } from "./objects";
import runtime from "../runtime";

const getMakiMethods = obj =>
  Object.getOwnPropertyNames(obj).filter(name => {
    return (
      typeof obj[name] === "function" &&
      !name.startsWith("js_") &&
      name !== "constructor"
    );
  });

for (const [key, Klass] of Object.entries(runtime)) {
  const obj = getClass(key);
  describe(`${obj.name}`, () => {
    test("implements getclassname()", () => {
      expect(Klass.prototype.getclassname()).toBe(obj.name);
    });
    test("has the correct parent", () => {
      const Parent = Object.getPrototypeOf(Klass);
      if (Klass.prototype.getclassname() === "Object") {
        expect(Parent.prototype).toBe(undefined);
        return;
      }
      expect(Parent.prototype.getclassname()).toBe(obj.parent);
    });
    describe("methods have the correct arity", () => {
      obj.functions.forEach(func => {
        const methodName = func.name.toLowerCase();
        // Once all methods are implemented this check can be removed.
        // For now we have a separate test which checks that we haven't
        // regressed on the methods we've implemented.
        if (Klass.prototype.hasOwnProperty(methodName)) {
          const actual = Klass.prototype[func.name.toLowerCase()].length;
          test(`${obj.name}.${func.name} has an arity of ${actual}`, () => {
            expect(func.parameters.length).toBe(actual);
          });
        }
      });
    });
  });
}

describe("Maki classes", () => {
  const runtimeMethods = new Set();
  const objectMethods = new Set();
  for (const [key, Klass] of Object.entries(runtime)) {
    const obj = getClass(key);
    getMakiMethods(Klass.prototype).forEach(methodName => {
      runtimeMethods.add(`${obj.name}.${methodName}`);
    });
    obj.functions.forEach(func => {
      objectMethods.add(`${obj.name}.${func.name.toLowerCase()}`);
    });
  }

  test("have no extra methods", () => {
    // getclassname _should_ be implemented on Object and let each class inherit
    // it. However it's far easier to implement it on each class directly, so
    // we'll allow that.
    function isntGetClassname(method) {
      return !/\.getclassname$/.test(method);
    }

    function isntMakiMethod(method) {
      return !objectMethods.has(method);
    }

    const extra = [...runtimeMethods]
      .filter(isntMakiMethod)
      .filter(isntGetClassname);

    expect(extra).toEqual([]);
  });

  test("Track all missing methods", () => {
    const missing = [...objectMethods]
      .filter(x => !runtimeMethods.has(x))
      .sort();

    expect(missing).toMatchInlineSnapshot(`Array []`);
  });
});
