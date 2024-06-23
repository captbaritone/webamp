import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { visualizer } from "rollup-plugin-visualizer";
import replace from "@rollup/plugin-replace";
import postcssOptimizeDataUriPngs from "./postcss-optimize-data-uri-pngs.js";
import atImport from "postcss-import";
import { babel } from "@rollup/plugin-babel";
import nodePolyfills from "rollup-plugin-polyfill-node";

/**
 * @return {import('rollup').InputOptions}
 */
export function getPlugins({ minify, outputFile, vite }) {
  const plugins = [
    replace({
      // Ensure we don't use the dev build of React
      values: { "process.env.NODE_ENV": JSON.stringify("production") },
      preventAssignment: true,
    }),
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
    babel({ babelHelpers: "bundled" }),
    minify ? terser() : null,
    // Generate a report so we can see how our bundle size is spent
    vite ? null : visualizer({ filename: `./${outputFile}.html` }),
  ].filter(Boolean);

  return plugins;
}
