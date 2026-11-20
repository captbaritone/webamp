import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
    viewport: { width: 1280, height: 1024 },
  },
  webServer: {
    command: "pnpm --filter webamp-demo start",
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
});
