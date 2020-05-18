import * as fromTracks from "./tracks";
import { PlaylistTrack } from "../types";

describe("getTrackDisplayName", () => {
  const expectDisplayName = (
    track: Partial<PlaylistTrack>,
    expected: string
  ) => {
    // @ts-ignore We test incomplete tracks
    expect(fromTracks.getTrackDisplayName({ "1": track }, 1)).toBe(expected);
  };
  it("uses the artists and title if provided", () => {
    expectDisplayName(
      {
        artist: "Artist",
        title: "Title",
        defaultName: "Default Name",
        url: "https://example.com/dir/filename.mp3",
      },
      "Artist - Title"
    );
  });
  it("uses the title if provided", () => {
    expectDisplayName(
      {
        title: "Title",
        defaultName: "Default Name",
        url: "https://example.com/dir/filename.mp3",
      },
      "Title"
    );
  });
  it("uses a defaultName if provided", () => {
    expectDisplayName(
      {
        defaultName: "Default Name",
        url: "https://example.com/dir/filename.mp3",
      },
      "Default Name"
    );
  });
  it("uses the filename if a URL is provided", () => {
    expectDisplayName(
      { url: "https://example.com/dir/filename.mp3" },
      "filename.mp3"
    );
  });
  it("does not use the filename if a blob URL is provided", () => {
    expectDisplayName({ url: "blob:foo" }, "???");
  });
  it("falls back to '???'", () => {
    expectDisplayName({}, "???");
  });
});
