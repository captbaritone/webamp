import { Track } from "../../js/types";

const CLIENT_ID = "T9EbIJ75SnsJK3iX8lOZaDlGIYgQB32G";

/* eslint-disable camelcase */
export type SoundCloudPlaylist = {
  permalink_url: string;
  title: string;
  uri: string;
  tracks_uri: string;
  user: {
    avatar_url: string;
    id: number;
    permalink_url: string;
    uri: string;
    username: string;
  };
  tracks: {
    artwork_url: string;
    description: string;
    user: {
      username: string;
    };
    title: string;
    stream_url: string;
    duration: number;
  }[];
};
/* eslint-enable camelcase */

export async function getPlaylist(
  playlistId: string
): Promise<SoundCloudPlaylist> {
  const result = await fetch(
    `https://api.soundcloud.com/playlists/${playlistId}?client_id=${CLIENT_ID}`,
    {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.1",
      },
      mode: "cors",
      credentials: "omit",
    }
  );

  // eslint-disable-next-line no-return-await
  return await result.json();
}

export function tracksFromPlaylist(playlist: SoundCloudPlaylist): Track[] {
  return playlist.tracks.map((track) => {
    return {
      metaData: {
        artist: track.user.username,
        title: track.title,
      },
      url: `${track.stream_url}?client_id=${CLIENT_ID}`,
      duration: track.duration / 1000,
    };
  });
}
