import WebampLazy from "./webampLazy";
import Emitter from "./emitter";

// A stand-in for `Media`, which needs Web Audio, which jsdom lacks. It can emit
// events and treats every other method as a no-op.
class FakeMedia {
  static instance: FakeMedia;
  _emitter = new Emitter();

  constructor() {
    FakeMedia.instance = this;
    return new Proxy(this, {
      get(target, prop) {
        return prop in target ? (target as any)[prop] : () => {};
      },
    });
  }

  on(event: string, callback: (...args: any[]) => void) {
    return this._emitter.on(event, callback);
  }

  trigger(event: string, ...args: any[]) {
    this._emitter.trigger(event, ...args);
  }
}

describe("onMediaError", () => {
  it("is called with the media error code", () => {
    const webamp = new WebampLazy({
      __customMediaClass: FakeMedia as any,
      requireJSZip: async () => null,
      requireMusicMetadata: async () => null,
    });
    const onMediaError = vi.fn();
    const unsubscribe = webamp.onMediaError(onMediaError);

    FakeMedia.instance.trigger("error", 4);
    expect(onMediaError).toHaveBeenCalledWith({ code: 4 });

    unsubscribe();
    FakeMedia.instance.trigger("error", 3);
    expect(onMediaError).toHaveBeenCalledTimes(1);
    webamp.dispose();
  });
});
