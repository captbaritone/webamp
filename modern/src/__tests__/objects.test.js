import { getClass, getFormattedId, objects } from "../maki-interpreter/objects";
import runtime from "../runtime";

test("getFormattedId() is reversable", () => {
  Object.keys(runtime).forEach((id) => {
    const formattedId = getFormattedId(id);
    const inverse = getFormattedId(formattedId);
    expect(inverse).toBe(id);
  });
  Object.keys(objects)
    .map((id) => id.toLowerCase())
    .forEach((id) => {
      const formattedId = getFormattedId(id);
      const inverse = getFormattedId(formattedId);
      expect(inverse).toBe(id);
    });
});

const getMakiMethods = (obj) =>
  Object.getOwnPropertyNames(obj).filter((name) => {
    return (
      typeof obj[name] === "function" &&
      !name.startsWith("js_") &&
      !name.startsWith("_") &&
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
      obj.functions.forEach((func) => {
        const methodName = func.name.toLowerCase();
        // Once all methods are implemented this check can be removed.
        // For now we have a separate test which checks that we haven't
        // regressed on the methods we've implemented.
        const hasMethodOnSelf = Klass.prototype.hasOwnProperty(methodName);
        test(`Has the method ${obj.name}.${func.name}`, () => {
          expect(hasMethodOnSelf).toBe(true);
        });
        if (!hasMethodOnSelf) {
          return;
        }
        const actual = Klass.prototype[func.name.toLowerCase()].length;
        test(`${obj.name}.${func.name} has an arity of ${actual}`, () => {
          expect(func.parameters.length).toBe(actual);
        });
      });
    });
  });
}

describe("Maki classes", () => {
  const runtimeMethods = new Set();
  const unimplementedRuntimeMethods = new Set();
  const objectMethods = new Set();
  for (const [key, Klass] of Object.entries(runtime)) {
    const obj = getClass(key);
    getMakiMethods(Klass.prototype).forEach((methodName) => {
      runtimeMethods.add(`${obj.name}.${methodName}`);
      const methodSource = Klass.prototype[methodName].toString();
      if (methodSource.includes("unimplementedWarning")) {
        unimplementedRuntimeMethods.add(`${obj.name}.${methodName}`);
      }
    });
    obj.functions.forEach((func) => {
      objectMethods.add(`${obj.name}.${func.name.toLowerCase()}`);
    });
  }

  test("All classes are implemented", () => {
    const getName = (Klass) => Klass.prototype.getclassname();
    const actualNames = Object.keys(runtime).map(
      (id) => `${getName(runtime[id])} (${id})`
    );
    const expectedNames = Object.keys(objects).map(
      (id) => `${objects[id].name} (${getFormattedId(id)})`
    );
    expect(new Set(actualNames)).toEqual(new Set(expectedNames));
  });

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

  test("There are no missing methods", () => {
    const missing = [...objectMethods].filter((x) => !runtimeMethods.has(x));

    expect(missing).toEqual([]);
  });

  test("Track unimplemented methods", () => {
    // Write this as a newline delineated string to make it easier to other
    // tools to extract from the `.snap` file.
    const expected = Array.from(unimplementedRuntimeMethods).join("\n");
    expect(expected).toMatchSnapshot();
  });
});
