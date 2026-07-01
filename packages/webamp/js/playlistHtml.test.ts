import { createPlaylistURL, getAsDataURI } from "./playlistHtml";

function base64ToUtf8(str: string): string {
  return decodeURIComponent(
    Array.prototype.map
      .call(
        atob(str),
        (c: string) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`
      )
      .join("")
  );
}

describe("playlistHtml", () => {
  describe("createPlaylistURL", () => {
    it("handles track names with characters outside Latin-1 range", () => {
      const props = {
        averageTrackLength: "3:45",
        numberOfTracks: 3,
        playlistLengthSeconds: 15,
        playlistLengthMinutes: 11,
        tracks: [
          "Song with emoji 🎵🎶",
          "中文歌曲名称.mp3",
          "Песня на русском.mp3",
        ],
      };

      const result = createPlaylistURL(props);

      // Should be a valid data URI
      expect(result).toMatch(/^data:text\/html;base64,/);

      // Decode the base64 to check the content
      const base64Content = result.replace("data:text/html;base64,", "");
      const decodedHTML = base64ToUtf8(base64Content);

      // Check that all track names are present in the decoded HTML
      expect(decodedHTML).toContain("Song with emoji 🎵🎶");
      expect(decodedHTML).toContain("中文歌曲名称.mp3");
      expect(decodedHTML).toContain("Песня на русском.mp3");

      // Verify playlist metadata is included
      expect(decodedHTML).toContain("3");
      expect(decodedHTML).toContain("3:45");
      expect(decodedHTML).toContain("11");
      expect(decodedHTML).toContain("15");
    });

    it("creates valid HTML with basic track names", () => {
      const props = {
        averageTrackLength: "4:20",
        numberOfTracks: 1,
        playlistLengthSeconds: 20,
        playlistLengthMinutes: 4,
        tracks: ["test-track.mp3"],
      };

      const result = createPlaylistURL(props);

      expect(result).toMatch(/^data:text\/html;base64,/);

      const base64Content = result.replace("data:text/html;base64,", "");
      const decodedHTML = atob(base64Content);

      expect(decodedHTML).toContain("<html>");
      expect(decodedHTML).toContain("test-track.mp3");
      expect(decodedHTML).toContain("Winamp Generated PlayList");
    });
  });

  describe("getAsDataURI", () => {
    it("converts text to base64 data URI", () => {
      const text = "Hello, World!";
      const result = getAsDataURI(text);

      expect(result).toBe("data:text/html;base64,SGVsbG8sIFdvcmxkIQ==");
    });

    it("handles text with HTML tags", () => {
      const text = "<html>Test</html>";
      const result = getAsDataURI(text);

      expect(result).toMatch(/^data:text\/html;base64,/);

      const base64Content = result.replace("data:text/html;base64,", "");
      const decoded = atob(base64Content);
      expect(decoded).toBe(text);
    });
  });
});
