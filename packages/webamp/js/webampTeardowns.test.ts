import WebampLazy from "./webampLazy";

// `Media` needs Web Audio, which jsdom lacks. Treat every method as a no-op.
function FakeMedia() {
  return new Proxy({}, { get: () => () => {} });
}

function createWebamp(): WebampLazy {
  return new WebampLazy({
    __customMediaClass: FakeMedia as any,
    requireJSZip: async () => ({} as any),
    requireMusicMetadata: async () => ({} as any),
  });
}

function teardownCount(webamp: WebampLazy): number {
  return webamp._disposable._teardowns.size;
}

// `skinIsLoaded()` waits on `storeHas()` for each skin. (We call `storeHas()`
// directly, since `skinIsLoaded()` also waits for images, which jsdom never
// loads.)
function waitForSkinLoaded(webamp: WebampLazy): Promise<void> {
  return (webamp as any).storeHas((state: any) => !state.display.loading);
}

// The museum keeps one Webamp instance for as long as the page is open, so
// anything that leaves a teardown behind each time adds up.
describe("Webamp's teardowns", () => {
  it("aren't kept for each skin load once it's loaded", async () => {
    const webamp = createWebamp();
    const before = teardownCount(webamp);
    for (let i = 0; i < 10; i++) {
      webamp.store.dispatch({ type: "LOADING" });
      const loaded = waitForSkinLoaded(webamp);
      webamp.store.dispatch({ type: "LOADED" });
      await loaded;
    }
    expect(teardownCount(webamp)).toBe(before);
    webamp.dispose();
  });

  it("reject a skin load that's still waiting when Webamp is disposed", async () => {
    const webamp = createWebamp();
    webamp.store.dispatch({ type: "LOADING" });
    const loaded = waitForSkinLoaded(webamp);
    webamp.dispose();
    await expect(loaded).rejects.toThrow(
      "Store was disposed before condition was met."
    );
  });

  it("aren't kept for listeners that have unsubscribed", () => {
    const webamp = createWebamp();
    const before = teardownCount(webamp);
    const onTrackDidChange = vi.fn();
    const onStateChange = vi.fn();
    for (let i = 0; i < 10; i++) {
      webamp.onTrackDidChange(onTrackDidChange)();
      webamp.__onStateChange(onStateChange)();
    }
    expect(teardownCount(webamp)).toBe(before);

    webamp.store.dispatch({ type: "LOADING" });
    expect(onStateChange).not.toHaveBeenCalled();
    webamp.dispose();
  });

  it("unsubscribe listeners when Webamp is disposed", () => {
    const webamp = createWebamp();
    const onStateChange = vi.fn();
    const unsubscribe = webamp.__onStateChange(onStateChange);
    webamp.dispose();
    webamp.store.dispatch({ type: "LOADING" });
    expect(onStateChange).not.toHaveBeenCalled();
    // Still safe to call afterwards.
    unsubscribe();
  });
});
