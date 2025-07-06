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
  {
    name: "Webamp Butterchurn ES",
    input: "js/webampWithButterchurn.ts",
    minify: true,
    output: {
      file: "built/webamp.butterchurn-bundle.min.mjs",
      format: "module",
      // music-metadata uses dynamic imports, so we need to inline them
      // to avoid issues with the UMD build.
      inlineDynamicImports: true,
    },
  },
];

build();

async function build() {
  console.log(`🚀 Building ${BUNDLES.length} bundles in parallel...`);

  const buildPromises = BUNDLES.map(async (bundleDesc) => {
    console.log(`📦 Building ${bundleDesc.name}...`);
    const plugins = getPlugins({
      outputFile: bundleDesc.output.file,
      minify: bundleDesc.minify,
    });
    const bundle = await rollup({
      input: bundleDesc.input,
      plugins,
      // Enable tree shaking optimizations
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
      // Optimize external dependencies handling
      external: (id) => {
        // Don't externalize these - we want them bundled for browser compatibility
        return false;
      },
      onwarn: (warning, warn) => {
        // Suppress expected circular dependency warnings from external libraries
        if (warning.code === "CIRCULAR_DEPENDENCY") {
          const message = warning.message || "";
          // Skip warnings for known external library circular dependencies
          if (
            message.includes("polyfill-node") ||
            message.includes("readable-stream") ||
            message.includes("jszip") ||
            message.includes("music-metadata") ||
            message.includes("node_modules")
          ) {
            return; // Don't show these warnings
          }
        }
        // Show all other warnings
        warn(warning);
      },
    });
    await bundle.write({
      sourcemap: true,
      ...bundleDesc.output,
    });
    console.log(`✅ Completed ${bundleDesc.name}`);
  });

  await Promise.all(buildPromises);
  console.log(`🎉 All ${BUNDLES.length} bundles built successfully!`);
}
