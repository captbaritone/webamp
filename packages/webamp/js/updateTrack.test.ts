import WebampLazy from "./webampLazy";
import Emitter from "./emitter";

// A stand-in for `Media`, which needs Web Audio, which jsdom lacks. It treats
// every method other than `on` as a no-op.
function FakeMedia() {
  const emitter = new Emitter();
  const target = { on: emitter.on.bind(emitter) };
  return new Proxy(target, {
    get(t, prop) {
      return prop in t ? (t as any)[prop] : () => {};
    },
  });
}

describe("updateTrack", () => {
  let webamp: WebampLazy;

  beforeEach(() => {
    webamp = new WebampLazy({
      __customMediaClass: FakeMedia as any,
      requireJSZip: async () => ({} as any),
      requireMusicMetadata: async () => ({} as any),
    });
    webamp.appendTracks(
      ["one", "two"].map((name) => ({
        url: `https://example.com/${name}.mp3`,
        duration: 60,
        defaultName: name,
        metaData: { artist: "Artist", title: name },
      }))
    );
  });

  afterEach(() => {
    webamp.dispose();
  });

  it("updates a track's default name", () => {
    webamp.updateTrack(1, { defaultName: "Renamed" });
    const [one, two] = webamp.getPlaylistTracks();
    expect(one.defaultName).toBe("one");
    expect(two.defaultName).toBe("Renamed");
  });

  it("updates a track's metadata", () => {
    webamp.updateTrack(0, {
      metaData: { artist: "New Artist", title: "New Title" },
    });
    const [one, two] = webamp.getPlaylistTracks();
    expect(one.artist).toBe("New Artist");
    expect(one.title).toBe("New Title");
    expect(two.title).toBe("two");
  });

  it("throws for an index with no track", () => {
    expect(() => webamp.updateTrack(2, { defaultName: "Nope" })).toThrow(
      "No track at index 2"
    );
  });
});
