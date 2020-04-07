import skinSprites from "./skinSprites";

const each = (obj, iterator) => {
  Object.keys(obj).forEach((key) => {
    iterator(obj[key]);
  });
};

const getNames = (arr) => arr.map((item) => item.name);

describe("skinSprites", () => {
  it("each spritSheet has a unique name", () => {
    const spriteSheetNames = Object.keys(skinSprites);
    const seenNames = [];
    spriteSheetNames.forEach((name) => {
      expect(seenNames).not.toContain(name);
      seenNames.push(name);
    });
  });
  it("each sprite has a unique name", () => {
    let spriteNames = [];
    each(skinSprites, (spriteSheet) => {
      spriteNames = spriteNames.concat(getNames(spriteSheet));
    });
    const seenNames = [];
    spriteNames.forEach((name) => {
      expect(seenNames).not.toContain(name);
      seenNames.push(name);
    });
  });
  it("each sprite has the needed properties", () => {
    each(skinSprites, (spriteSheet) => {
      spriteSheet.forEach((sprite) => {
        expect(typeof sprite.name).toBe("string");
        expect(typeof sprite.x).toBe("number");
        expect(typeof sprite.y).toBe("number");
        expect(typeof sprite.height).toBe("number");
        expect(typeof sprite.width).toBe("number");
      });
    });
  });
});
