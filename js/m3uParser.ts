const EXTINF_REGEX = /^#EXTINF:(-?)(\d+),(.*)$/;

interface M3uTrack {
  title: string;
  duration: number;
  file: string;
}

export default function parseM3u(content: string): Array<M3uTrack> {
  // TODO: Support Windows line endings
  const lines = content.split("\n").filter(Boolean);
  const firstLine = lines[0];

  if (!firstLine || !firstLine.startsWith("#EXTM3U")) {
    throw new Error("Content is not a valid M3U playlist");
  }

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
