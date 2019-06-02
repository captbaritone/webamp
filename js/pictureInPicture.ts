import React from "react";
import { useOnUnmount } from "./hooks";

export function videoFromCanvasIsSupported() {
  const canvas = document.createElement("canvas");
  // @ts-ignore
  return canvas.captureStream != null;
}

interface VideoFromCanvasOptions {
  canvas: HTMLCanvasElement | null;
  playing: boolean;
  contextType: "webgl2" | "2d";
}
export function useVideoFromCanvas({
  canvas,
  playing,
  contextType,
}: VideoFromCanvasOptions): HTMLVideoElement | null {
  // Create an HTMLVideoElement from the passed canvas
  const video = React.useMemo(() => {
    if (canvas == null) {
      return null;
    }
    // @ts-ignore
    if (canvas.captureStream == null) {
      return null;
    }
    const v = document.createElement("video");
    v.muted = true;
    // Firefox will blow up if you try to capture a stream without initializing
    // a context. So we get the context here just to be sure.
    canvas.getContext(contextType);
    // @ts-ignore
    v.srcObject = canvas.captureStream(60 /* fps */);
    return v;
  }, [canvas, contextType]);

  // Ensure the video element's playing status stays in sync with the audio.
  // This is important because Chrome decides which media control buttons
  // (play/pause) to show based upon the video's status.
  React.useEffect(() => {
    if (video == null || video.paused !== playing) {
      return;
    }
    if (playing) {
      video.play();
    } else {
      video.pause();
    }
  }, [video, playing]);

  return video;
}

export function pictureInPictureIsSupported() {
  // @ts-ignore
  return Boolean(document.pictureInPictureEnabled);
}

interface PictureInPictureOptions {
  video: HTMLVideoElement | null;
  enabled: boolean;
  onChange(enabled: boolean): void;
}

export function usePictureInPicture({
  video,
  enabled,
  onChange,
}: PictureInPictureOptions) {
  const [actuallyEnabled, setActuallyEnabled] = React.useState(false);
  // Wrap the local setEnabled call so that its always called with the change handler.
  const wrappedSetEnabled = React.useCallback(
    (newValue: boolean) => {
      if (newValue !== enabled) {
        onChange(newValue);
      }
      setActuallyEnabled(newValue);
    },
    [enabled, onChange]
  );

  // Subscribe to pictureInPicture events to keep `actuallyEnabled` in sync.
  React.useEffect(() => {
    if (video == null) {
      return;
    }
    // @ts-ignore
    setActuallyEnabled(document.pictureInPictureElement === video);
    const enterHandler = () => wrappedSetEnabled(true);
    const leaveHandler = () => wrappedSetEnabled(false);
    video.addEventListener("enterpictureinpicture", enterHandler);
    video.addEventListener("leavepictureinpicture", leaveHandler);
    return () => {
      video.removeEventListener("enterpictureinpicture", enterHandler);
      video.removeEventListener("leavepictureinpicture", leaveHandler);
    };
  }, [video, wrappedSetEnabled]);

  // Apply the user's `enabled` state if needed.
  React.useEffect(() => {
    if (
      video == null ||
      enabled === actuallyEnabled ||
      !pictureInPictureIsSupported()
    ) {
      return;
    }

    let mounted = true;

    if (enabled) {
      // Returns a promise which we could theoretically await.
      // @ts-ignore
      video.requestPictureInPicture().catch((e: Error) => {
        // I've seen this happen when rendering the MediaStream of a canvas that
        // has never been painted into a video and trying to open that video in
        // picture in picture.
        console.error("Failed to enter picture in picture mode", e);
        // TODO: Technically, this callback could be stale.
        if (mounted) wrappedSetEnabled(false);
      });
    } else {
      // Returns a promise which we could theoretically await.
      // @ts-ignore
      document.exitPictureInPicture().catch((e: Error) => {
        console.error("Failed to exit picture in picture mode", e);
        // TODO: Technically, this callback could be stale.
        if (mounted) wrappedSetEnabled(true);
      });
    }

    return () => {
      mounted = false;
    };
  }, [video, enabled, actuallyEnabled, wrappedSetEnabled]);

  // When the component that owns the video is unmounted, we want the
  // picture-in-picture to close as well.
  const onUnmount = React.useCallback(() => {
    if (actuallyEnabled && pictureInPictureIsSupported()) {
      // @ts-ignore
      document.exitPictureInPicture();
    }
    if (enabled) {
      onChange(false);
    }
  }, [actuallyEnabled, onChange, enabled]);

  useOnUnmount(onUnmount);
}
