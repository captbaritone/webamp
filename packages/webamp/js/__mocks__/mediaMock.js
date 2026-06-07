import { vi } from "vitest";

const media = {
  addEventListener: vi.fn(),
  setVolume: vi.fn(),
  setBalance: vi.fn(),
  setPreamp: vi.fn(),
  getAnalyser: () => null,
  on: vi.fn(),
};
export default media;
