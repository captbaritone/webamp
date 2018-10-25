const EXTINF_REGEX = /^#EXTINF:(-?)(\d+),(.*)$/;

interface ExtendedM3uTrack {
  title: string;
  duration: number;
  file: string;
}

interface M3uTrack {
  file: string;
}

type Playlist =
  | { extended: false; tracks: M3uTrack[] }
  | { extended: true; tracks: ExtendedM3uTrack[] };

function parseSimpleM3u(lines: string[]): Array<M3uTrack> {
  const tracks = [];
  for (var i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("#")) {
      continue;
    }
    tracks.push({ file: line.trim() });
  }

  return tracks;
}

function parseExtendedM3u(lines: string[]): ExtendedM3uTrack[] {
  const tracks = [];
  for (var i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith("#EXTINF")) {
      continue;
    }
    var result = EXTINF_REGEX.exec(line);
    if (!result) {
      throw new Error(`Invalid EXTINF at line ${i}`);
    }
    const nextLine = lines[++i];
    if (nextLine == null) {
      throw new Error(`Missing track path at line ${i}`);
    }

    tracks.push({
      title: result[3].trim(),
      duration: Number(result[1] + result[2]),
      file: nextLine.trim()
    });
  }
  return tracks;
}
export default function parseM3u(content: string): Playlist {
  // TODO: Support Windows line endings
  const lines = content.split("\n").filter(Boolean);
  const firstLine = lines[0];

  const extended = Boolean(firstLine && firstLine.startsWith("#EXTM3U"));
  return extended
    ? { extended: true, tracks: parseExtendedM3u(lines) }
    : { extended: false, tracks: parseSimpleM3u(lines) };
}
