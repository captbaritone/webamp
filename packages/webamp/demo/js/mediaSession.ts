import { WebampLazy } from "./Webamp";

export default function enableMediaSession(webamp: WebampLazy) {
  if ("mediaSession" in navigator) {
    /* global MediaMetadata */
    webamp.onTrackDidChange((track) => {
      if (track == null) {
        return;
      }
      const {
        metaData: { title, artist, album, albumArtUrl },
      } = track;
      // @ts-ignore TypeScript does not know about the Media Session API: https://github.com/Microsoft/TypeScript/issues/19473
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist,
        album,
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

    // @ts-ignore TypeScript does not know about the Media Session API: https://github.com/Microsoft/TypeScript/issues/19473
    navigator.mediaSession.setActionHandler("play", () => {
      webamp.play();
    });
    // @ts-ignore TypeScript does not know about the Media Session API: https://github.com/Microsoft/TypeScript/issues/19473
    navigator.mediaSession.setActionHandler("pause", () => {
      webamp.pause();
    });
    // @ts-ignore TypeScript does not know about the Media Session API: https://github.com/Microsoft/TypeScript/issues/19473
    navigator.mediaSession.setActionHandler("seekbackward", () => {
      webamp.seekBackward(10);
    });
    // @ts-ignore TypeScript does not know about the Media Session API: https://github.com/Microsoft/TypeScript/issues/19473
    navigator.mediaSession.setActionHandler("seekforward", () => {
      webamp.seekForward(10);
    });
    // @ts-ignore TypeScript does not know about the Media Session API: https://github.com/Microsoft/TypeScript/issues/19473
    navigator.mediaSession.setActionHandler("previoustrack", () => {
      webamp.previousTrack();
    });
    // @ts-ignore TypeScript does not know about the Media Session API: https://github.com/Microsoft/TypeScript/issues/19473
    navigator.mediaSession.setActionHandler("nexttrack", () => {
      webamp.nextTrack();
    });
  }
}
