import { defineConfig } from "vite";
import nodePolyfills from "rollup-plugin-polyfill-node";

export default defineConfig({
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 2500,
  },
  assetsInclude: ["**/*.wsz", "**/*.mp3"],
  plugins: [
    // Needed for music-metadata-browser which uses polyfillable node APIs
    // @ts-expect-error Rollup plugin type mismatch with Vite's stricter types
    nodePolyfills(),
  ],
});
