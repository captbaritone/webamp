import type WebampLazy from "./webampLazy";

const ACTIONS = [
  "play",
  "pause",
  "seekbackward",
  "seekforward",
  "previoustrack",
  "nexttrack",
] as const;

// The page has one media session, so the instance that enabled it most
// recently owns it.
let owner: WebampLazy | null = null;

/**
 * Connects `webamp` to the browser's media session. Returns a teardown that
 * disconnects it again, unless another instance has taken the session over
 * since.
 */
export default function enableMediaSession(webamp: WebampLazy): () => void {
  if (!("mediaSession" in navigator)) {
    return () => {};
  }
  owner = webamp;

  /* global MediaMetadata */
  const unsubscribe = webamp.onTrackDidChange((track) => {
    if (track == null) {
      return;
    }
    const {
      metaData: { title, artist, album, albumArtUrl },
    } = track;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title ?? undefined,
      artist: artist ?? undefined,
      album: album ?? undefined,
      artwork: albumArtUrl
        ? [
            {
              src: albumArtUrl,
              // We don't currently know these.
              // sizes: "96x96",
              // type: "image/png"
            },
          ]
        : [],
    });
  });

  const handlers: Record<(typeof ACTIONS)[number], () => void> = {
    play: () => webamp.play(),
    pause: () => webamp.pause(),
    seekbackward: () => webamp.seekBackward(10),
    seekforward: () => webamp.seekForward(10),
    previoustrack: () => webamp.previousTrack(),
    nexttrack: () => webamp.nextTrack(),
  };
  for (const action of ACTIONS) {
    navigator.mediaSession.setActionHandler(action, handlers[action]);
  }

  return () => {
    unsubscribe();
    if (owner !== webamp) {
      return;
    }
    owner = null;
    // The handlers close over this instance, so they'd keep it alive (and
    // keep the media keys controlling it) after it's disposed.
    for (const action of ACTIONS) {
      navigator.mediaSession.setActionHandler(action, null);
    }
    navigator.mediaSession.metadata = null;
  };
}
