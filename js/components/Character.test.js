import { characterClassName } from "./Character";

describe("characterClassName", () => {
  it("is not case sensitive", () => {
    expect(characterClassName("a")).toBe("character-97");
    expect(characterClassName("A")).toBe("character-97");
  });
  it("handles integers", () => {
    expect(characterClassName("1")).toBe("character-49");
    expect(characterClassName(1)).toBe("character-49");
  });
});
