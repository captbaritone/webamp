import skinSprites from "./skinSprites";

const getNames = arr => arr.map(item => item.name);

const spriteFiles = skinSprites.filter(file => file.sprites);

describe("skinSprites", () => {
  it("each spritSheet has a unique name", () => {
    const spriteSheetNames = getNames(skinSprites);
    const seenNames = [];
    spriteSheetNames.forEach(name => {
      expect(seenNames).not.toContain(name);
      seenNames.push(name);
    });
  });
  it("each sprite has a unique name", () => {
    let spriteNames = [];
    spriteFiles.forEach(spriteSheet => {
      spriteNames = spriteNames.concat(getNames(spriteSheet.sprites));
    });
    const seenNames = [];
    spriteNames.forEach(name => {
      expect(seenNames).not.toContain(name);
      seenNames.push(name);
    });
  });
  it("each sprite has the needed properties", () => {
    spriteFiles.forEach(spriteSheet => {
      spriteSheet.sprites.forEach(sprite => {
        expect(typeof sprite.name).toBe("string");
        expect(typeof sprite.x).toBe("number");
        expect(typeof sprite.y).toBe("number");
        expect(typeof sprite.height).toBe("number");
        expect(typeof sprite.width).toBe("number");
      });
    });
  });
});
