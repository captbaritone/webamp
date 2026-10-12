import WebampLazy from "./webampLazy";
import Emitter from "./emitter";

// A stand-in for `Media`, which needs Web Audio, which jsdom lacks. It records
// calls to `loadFromUrl` and `play`, and treats every other method as a no-op.
let media: {
  loadFromUrl: ReturnType<typeof vi.fn>;
  play: ReturnType<typeof vi.fn>;
};
function FakeMedia() {
  const emitter = new Emitter();
  media = { loadFromUrl: vi.fn(), play: vi.fn() };
  const target = { ...media, on: emitter.on.bind(emitter) };
  return new Proxy(target, {
    get(t, prop) {
      return prop in t ? (t as any)[prop] : () => {};
    },
  });
}

function track(name: string) {
  return {
    url: `https://example.com/${name}.mp3`,
    duration: 60,
    metaData: { artist: "Artist", title: name },
  };
}

describe("setTracks", () => {
  it("replaces the playlist and loads the first track without playing", () => {
    const webamp = new WebampLazy({
      __customMediaClass: FakeMedia as any,
      requireJSZip: async () => ({} as any),
      requireMusicMetadata: async () => ({} as any),
    });
    webamp.appendTracks([track("old")]);

    webamp.setTracks([track("one"), track("two")]);

    expect(webamp.getPlaylistTracks().map((t) => t.url)).toEqual([
      "https://example.com/one.mp3",
      "https://example.com/two.mp3",
    ]);
    expect(media.loadFromUrl).toHaveBeenLastCalledWith(
      "https://example.com/one.mp3",
      false
    );
    expect(media.play).not.toHaveBeenCalled();
    webamp.dispose();
  });
});
