import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { visualizer } from "rollup-plugin-visualizer";
import replace from "@rollup/plugin-replace";
import postcssOptimizeDataUriPngs from "./postcss-optimize-data-uri-pngs.mjs";
import atImport from "postcss-import";
import { babel } from "@rollup/plugin-babel";
import nodePolyfills from "rollup-plugin-polyfill-node";
import path from "node:path";

export function getPlugins({ minify, outputFile, vite }) {
  const plugins = [
    replace({
      // Ensure we don't use the dev build of React
      values: { "process.env.NODE_ENV": JSON.stringify("production") },
      preventAssignment: true,
    }),
    vite ? null : stripInlineSuffix(),
    // https://rollupjs.org/troubleshooting/#warning-treating-module-as-external-dependency
    // TODO: We could offer a version which does not inline React/React-DOM
    nodeResolve(),
    // Needed for music-metadata-browser in the Webamp bundle which depends upon
    // being able to use some polyfillable node APIs
    nodePolyfills(),
    typescript({
      compilerOptions: {
        jsx: "react-jsx",
        module: "esnext",
        declarationDir: vite ? "dist/demo-site/declarations" : undefined,
        // Without this it complains that files will be overwritten, but I don't
        // think this ever gets used...
        outDir: vite ? undefined : "./tsBuilt",
      },
    }),
    // Enable importing .json files. But Vite already enables this, so enabling it there
    // causes it to try to parse the js version as JSON.
    vite ? null : json(),
    // https://www.npmjs.com/package/rollup-plugin-import-css
    vite
      ? null
      : postcss({
          inject: false,
          plugins: [atImport, postcssOptimizeDataUriPngs],
        }),
    // Without this we get: Error: 'default' is not exported by node_modules/react/index.js
    // because react-redux import react as if it were an es6 module, but it is not.
    commonjs(),
    // Must come after commonjs
    babel({ babelHelpers: "bundled", compact: minify }),
    minify ? terser() : null,
    // Generate a report so we can see how our bundle size is spent
    visualizer({ filename: `./${outputFile}.html` }),
  ].filter(Boolean);

  return plugins;
}

// Vite expects `?inline` for CSS imports that we don't want to be auto
// injected. This hack strips that suffix here in Rollup for the library build.
function stripInlineSuffix() {
  return {
    name: "strip-inline-suffix",
    resolveId(source, importer) {
      if (source.includes("?inline")) {
        // Remove the `?inline` part from the import path
        const cleanedSource = source.replace("?inline", "");

        // Resolve the cleaned source to an absolute path
        const resolvedPath = path.resolve(
          path.dirname(importer),
          cleanedSource
        );

        return resolvedPath; // Return the absolute path
      }

      return null; // Return null to let other plugins handle the path if not modified
    },
  };
}
