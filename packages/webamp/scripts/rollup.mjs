import { rollup } from "rollup";
import { getPlugins } from "./rollupPlugins.mjs";

/**
 * Each object here represents a different bundle/build. This enables us to
 * define the full matrix of module types/entry points/bundle style (minified?)
 * as well as where those files should end up.
 */
const BUNDLES = [
  {
    name: "Minified WebampLazy UMD",
    input: "js/webampLazy.tsx",
    minify: false,
    output: {
      file: "built/webamp.lazy-bundle.js",
      format: "umd",
      name: "Webamp",
    },
  },
  {
    name: "Minified WebampLazy UMD",
    input: "js/webampLazy.tsx",
    minify: true,
    output: {
      file: "built/webamp.lazy-bundle.min.js",
      format: "umd",
      name: "Webamp",
    },
  },
  {
    name: "Minified WebampLazy ES",
    input: "js/webampLazy.tsx",
    minify: true,
    output: {
      file: "built/webamp.lazy-bundle.min.mjs",
      format: "module",
    },
  },
  {
    name: "Webamp UMD",
    input: "js/webamp.ts",
    minify: false,
    output: {
      file: "built/webamp.bundle.js",
      format: "umd",
      name: "Webamp",
      // music-metadata uses dynamic imports, so we need to inline them
      // to avoid issues with the UMD build.
      inlineDynamicImports: true,
    },
  },
  {
    name: "Minified Webamp UMD",
    input: "js/webamp.ts",
    minify: true,
    output: {
      file: "built/webamp.bundle.min.js",
      format: "umd",
      name: "Webamp",
      // music-metadata uses dynamic imports, so we need to inline them
      // to avoid issues with the UMD build.
      inlineDynamicImports: true,
    },
  },
  {
    name: "Webamp ES",
    input: "js/webamp.ts",
    minify: true,
    output: {
      file: "built/webamp.bundle.min.mjs",
      format: "module",
      // music-metadata uses dynamic imports, so we need to inline them
      // to avoid issues with the UMD build.
      inlineDynamicImports: true,
    },
  },
];

build();

async function build() {
  for (const bundleDesc of BUNDLES) {
    console.log(`=======[ Building ${bundleDesc.name} ]=======`);
    const plugins = getPlugins({
      outputFile: bundleDesc.output.file,
      minify: bundleDesc.minify,
    });
    const bundle = await rollup({ input: bundleDesc.input, plugins });
    await bundle.write({
      sourcemap: true,
      ...bundleDesc.output,
    });
  }
}
