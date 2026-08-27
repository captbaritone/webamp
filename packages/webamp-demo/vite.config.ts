import { defineConfig } from "vite";
import nodePolyfills from "rollup-plugin-polyfill-node";

export default defineConfig({
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 2500,
  },
  assetsInclude: ["**/*.wsz", "**/*.mp3"],
  resolve: {
    alias: {
      "react/jsx-runtime": "preact/jsx-runtime",
      "react/jsx-dev-runtime": "preact/jsx-runtime",
      "react-dom/client": "preact/compat/client",
      "react-dom": "preact/compat",
      react: "preact/compat",
    },
  },
  plugins: [
    // Needed for music-metadata-browser which uses polyfillable node APIs
    // @ts-expect-error Rollup plugin type mismatch with Vite's stricter types
    nodePolyfills(),
  ],
});
