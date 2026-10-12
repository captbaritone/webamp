import { writeFileSync } from "node:fs";

/**
 * tsc emits our declarations as `.d.ts` files containing ESM syntax. Since this
 * package is not `"type": "module"`, TypeScript consumers using
 * `moduleResolution: "node16"` would otherwise interpret those files as
 * CommonJS and see each default export as a namespace. This nested
 * package.json tells TypeScript the declarations are ESM.
 */
writeFileSync(
  new URL("../built/types/package.json", import.meta.url),
  JSON.stringify({ type: "module" }) + "\n"
);
