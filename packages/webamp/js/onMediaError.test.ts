import WebampLazy from "./webampLazy";
import Emitter from "./emitter";

// A stand-in for `Media`, which needs Web Audio, which jsdom lacks. It can emit
// events and treats every other method as a no-op.
let emitter: Emitter;
function FakeMedia() {
  emitter = new Emitter();
  const media = { on: emitter.on.bind(emitter) };
  return new Proxy(media, {
    get(target, prop) {
      return prop in target ? (target as any)[prop] : () => {};
    },
  });
}

describe("onMediaError", () => {
  it("is called with the media error code", () => {
    const webamp = new WebampLazy({
      __customMediaClass: FakeMedia as any,
      requireJSZip: async () => ({} as any),
      requireMusicMetadata: async () => ({} as any),
    });
    const onMediaError = vi.fn();
    const unsubscribe = webamp.onMediaError(onMediaError);

    emitter.trigger("error", 4);
    expect(onMediaError).toHaveBeenCalledWith({ code: 4 });

    unsubscribe();
    emitter.trigger("error", 3);
    expect(onMediaError).toHaveBeenCalledTimes(1);
    webamp.dispose();
  });
});
