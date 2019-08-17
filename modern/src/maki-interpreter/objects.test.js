import { getClass } from "./objects";
import runtime from "../runtime";

const getMethods = obj =>
  Object.getOwnPropertyNames(obj).filter(name => {
    return (
      typeof obj[name] === "function" &&
      !name.startsWith("js_") &&
      name !== "constructor"
    );
  });

for (let [key, Klass] of Object.entries(runtime)) {
  const obj = getClass(key);
  describe(`${obj.name}`, () => {
    test("implements getclassname()", () => {
      expect(Klass.prototype.getclassname()).toBe(obj.name);
    });
    /*
    test("implements all methods", () => {
      const methods = getMethods(Klass.prototype);
      console.log(methods);
    });
    */
    test("has the correct parent", () => {
      const Parent = Object.getPrototypeOf(Klass);
      if (Klass.prototype.getclassname() === "Object") {
        expect(Parent.prototype).toBe(undefined);
        return;
      }
      expect(Parent.prototype.getclassname()).toBe(obj.parent);
    });
  });
}
