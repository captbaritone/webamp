import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["**/*.test.{js,ts,tsx}"],
    exclude: ["node_modules"],
  },
});
