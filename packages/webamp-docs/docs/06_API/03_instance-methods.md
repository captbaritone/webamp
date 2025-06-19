# Instance Methods

Once you have [constructed](02_webamp-constructor.md) a `Webamp` instance, the instance has methods you can use to get the state of the player, control playback, and manage tracks, register event listeners, and more.

```ts
import Webamp from "webamp";

const webamp = new Webamp({
  // ... options
});
```

The `webamp` instance has the following _instance_ methods:

### `appendTracks(tracks: Track[]): void`

Add an array of [`Track`s](01_track.md) to the end of the playlist.

```ts
webamp.appendTracks([
  { url: "https://example.com/track1.mp3" },
  { url: "https://example.com/track2.mp3" },
  { url: "https://example.com/track3.mp3" },
]);
```

:::warning
**The `url` must be served with the [correct CORS headers](../07_guides/01_cors.md).**
:::

### `setTracksToPlay(tracks: Track[]): void`

Replace the playlist with an array of [`Track`s](01_track.md) and begin playing the first track.

```ts
webamp.setTracksToPlay([
  { url: "https://example.com/track1.mp3" },
  { url: "https://example.com/track2.mp3" },
  { url: "https://example.com/track3.mp3" },
]);
```

:::warning
**The `url` must be served with the [correct CORS headers](../07_guides/01_cors.md).**
:::

### `previousTrack(): void`

Play the previous track.

**Since** 1.3.0

```ts
webamp.previousTrack();
```

### `nextTrack(): void`

Play the next track.

**Since** 1.3.0

```ts
webamp.nextTrack();
```

### `seekForward(seconds): void`

Seek forward n seconds in the current track.

**Since** 1.3.0

```ts
webamp.seekForward(10);
```

### `seekBackward(seconds): void`

Seek backward n seconds in the current track.

**Since** 1.3.0

```ts
webamp.seekBackward(10);
```

### `seekToTime(seconds)`

Seek to a given time within the current track.

**Since** 1.4.0

```ts
webamp.seekToTime(15.5);
```

### `getMediaStatus()`

Get the current "playing" status. The return value is one of: `"PLAYING"`, `"STOPPED"`, or `"PAUSED"`.

**Since** 1.4.0

```ts
const isPlaying = webamp.getMediaStatus() === "PLAYING";
```

### `pause(): void`

Pause the current track.

**Since** 1.3.0

```ts
webamp.pause();
```

### `play(): void`

Play the current track.

**Since** 1.3.0

```ts
webamp.play();
```

### `stop(): void`

Stop the currently playing audio. Equivilant to pressing the "stop" button.

**Since** 1.4.0

```ts
webamp.stop();
```

### `renderWhenReady(domNode: HTMLElement): Promise<void>`

Webamp will wait until it has fetched the skin and fully parsed it, and then render itself into a new DOM node at the end of the `<body>` tag.

If a `domNode` is passed, Webamp will place itself in the center of that DOM node.

A promise is returned which will resolve after the render is complete.

```ts
const container = document.getElementById("winamp-container");
webamp.renderWhenReady(container).then(() => {
  console.log("rendered webamp!");
});
```

### `onTrackDidChange(cb: (trackInfo: LoadedURLTrack | null) => void): () => void`

A callback which will be called when a new track starts loading. This can happen on startup when the first track starts buffering, or when a subsequent track starts playing. The callback will be called with an object (`{url: 'https://example.com/track.mp3'}`) containing the URL of the track.

Returns an "unsubscribe" function.

**Note:** If the user drags in a track, the URL may be an [ObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL)

```ts
const unsubscribe = webamp.onTrackDidChange((track => {
    console.log("New track playing:", track.url);
});

// If at some point in the future you want to stop listening to these events:
unsubscribe();
```

### `onWillClose(cb: (cancel: () => void) => void): () => void`

A callback which will be called when Webamp is _about to_ close. Returns an "unsubscribe" function. The callback will be passed a `cancel` function which you can use to conditionally prevent Webamp from being closed.

```ts
const unsubscribe = webamp.onWillClose((cancel) => {
  if (!window.confirm("Are you sure you want to close Webamp?")) {
    cancel();
  }
});

// If at some point in the future you want to stop listening to these events:
unsubscribe();
```

### `onClose(cb: () => void): () => void`

A callback which will be called when Webamp is closed. Returns an "unsubscribe" function.

```ts
const unsubscribe = webamp.onClose(() => {
  console.log("Webamp closed");
});

// If at some point in the future you want to stop listening to these events:
unsubscribe();
```

### `close(): void`

Equivalent to selection "Close" from Webamp's options menu. Once closed, you can open it again with `.reopen()`.

**Since** 1.4.1

### `reopen(): void`

After `.close()`ing this instance, you can reopen it by calling this method.

**Since** 1.3.0

```ts
const icon = document.getElementById("webamp-icon");

webamp.onClose(() => {
  icon.addEventListener("click", () => {
    webamp.reopen();
  });
});
```

### `onMinimize(cb: () => void): () => void`

A callback which will be called when Webamp is minimized. Returns an "unsubscribe" function.

```ts
const unsubscribe = webamp.onMinimize(() => {
  console.log("Webamp closed");
});

// If at some point in the future you want to stop listening to these events:
unsubscribe();
```

### `setSkinFromUrl(url: string): void`

Updates the skin used by the webamp instance. Note that this does not happen immediately. If you want to be notified when the skin load is complete, use `.skinIsLoaded()`, which returns a promise which you can await.

**Since** 1.4.1

### `skinIsLoaded(): Promise<void>`

Returns a promise that resolves when the skin is done loading.

```ts
const start = Date.now();
await webamp.skinIsLoaded();
console.log(`The skin loaded in ${Date.now() - start}`);
```

### `dispose(): void`

**Note:** _This method is not fully functional. It is currently impossible to clean up a Winamp instance. This method makes an effort, but it still leaks the whole instance. In the future the behavior of this method will improve, so you might as well call it._

When you are done with a Webamp instance, call this method and Webamp will attempt to clean itself up to avoid memory leaks.

```ts
webamp.dispose();
```
