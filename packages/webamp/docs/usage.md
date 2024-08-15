# Usage

Here's how to use Webamp in your own project. If you get stuck, or need help, please either file an issue, or reach out on [Discord](https://discord.gg/fBTDMqR).

## Examples

If you would like to look at some examples check out the [examples directory](../../../examples/) where you will find:

- [Minimal](../../../examples/minimal) Stick Webamp in a `<script>` tag, and add a few lines of JavaScript to get Webamp on your page.
- [Multiple Tracks](../../../examples/multipleTracks) An example of setting up Webamp with multiple audio tracks.
- [Multiple Skins](../../../examples/multipleSkins) An example of setting up Webamp with multiple skins.
- [Minimal Window Layout](../../../examples/minimalWindowLayout) An example of configuring the initial layout of windows in Webamp.
- [Webpack](../../../examples/webpack) Install Webamp via NPM and bundle it in a Webpack bundle.
- [Webpack Lazyload](../../../examples/webpackLazyLoad) **In progress**
- [Minimal Milkdrop](../../../examples/minimalMilkdrop) **In progress**

Each example has a README which explains it in more detail.

## Install

```
npm install --save webamp
```

Or, you can include it via a script tag:

```html
<!-- You can use this URL, or download it and check it into your own project -->
<script src="https://unpkg.com/webamp@1.4.0/built/webamp.bundle.min.js"></script>
```

## Create a container

Create a DOM element somewhere in your HTML document. This will be used by Webamp to find it's initial position.

```html
<div id="winamp-container"></div>
```

## Initialize the JavaScript

```JavaScript
import Webamp from 'webamp';

// Or, if you installed via a script tag, `Winamp` is available on the global `window`:
// const Winamp = window.Webamp;

// Check if Winamp is supported in this browser
if(!Webamp.browserIsSupported()) {
    alert("Oh no! Webamp does not work!")
    throw new Error("What's the point of anything?")
}

// All configuration options are optional.
const webamp = new Webamp({
  // Optional.
  initialTracks: [{
    metaData: {
      artist: "DJ Mike Llama",
      title: "Llama Whippin' Intro",
    },
    // NOTE: Your audio file must be served from the same domain as your HTML
    // file, or served with permissive CORS HTTP headers:
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    // Can be downloaded from: https://github.com/captbaritone/webamp/raw/master/mp3/llama-2.91.mp3
    url: "path/to/mp3/llama-2.91.mp3"
  }],
  // Optional. The default skin is included in the js bundle, and will be loaded by default.
  initialSkin: {
    // NOTE: Your skin file must be served from the same domain as your HTML
    // file, or served with permissive CORS HTTP headers:
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    // Can be downloaded from https://github.com/captbaritone/webamp/raw/master/skins/TopazAmp1-2.wsz
    url: "path/to/skins/TopazAmp1-2.wsz"
  },
});
// Render after the skin has loaded.
webamp.renderWhenReady(document.getElementById('winamp-container'));
```

## API

Many methods on the webamp instance deal with `track`s. Here is the shape of a `track`:

```JavaScript
const track = {
    // Either `url` or `blob` must be specified
    // Note: This URL must be served the with correct CORs headers.
    url: 'https://example.com/song.mp3',
    blob: dataBlob,

    // Optional. Name to be used until ID3 tags can be resolved.
    // If the track has a `url`, and this property is not given,
    // the filename will be used instead.
    defaultName: 'My Song',

    // Optional. Data to be used _instead_ of trying to fetch ID3 tags.
    // **WARNING** If you omit this data, Webamp will fetch the first
    // few bytes of this file on load to try to read its id3 tags.
    metaData: {
        artist: 'Jordan Eldredge',
        title: "Jordan's Song"
    },

    // Optional. Duration (in seconds) to be used instead of
    // fetching enough of the file to measure its length.
    // **WARNING** If you omit this property, Webamp will fetch the first
    // few bytes of this file on load to try to determine its duration.
    duration: 95
};
```

## Static Methods

The `Winamp` class has the following _static_ methods:

### `browserIsSupported()`

Returns a true if the current browser supports the features that Webamp depends upon. It is recommended to check this before you attempt to instantiate an instance of `Winamp`.

```JavaScript
import Webamp from 'webamp';

if(Winamp.browserIsSupported()) {
    new Winamp({/* ... */});
    // ...
} else {
    // Perhaps you could show some simpler player in this case.
}
```

## Construction

The `Winamp` class is constructed with an options object. All are optional.

```ts
const options = {
  // Optional. An object representing the initial skin to use.
  // If omitted, the default skin, included in the bundle, will be used.
  // Note: This URL must be served the with correct CORs headers.
  initialSkin: {
    url: "./path/to/skin.wsz",
  },

  // Optional. An array of `track`s (see above) to prepopulate the playlist with.
  initialTracks: [
    /* ... */
  ],

  // Optional. An array of objects representing skins.
  // These will appear in the "Options" menu under "Skins".
  // Note: These URLs must be served with the correct CORs headers.
  availableSkins: [
    { url: "./green.wsz", name: "Green Dimension V2" },
    { url: "./osx.wsz", name: "Mac OSX v1.5 (Aqua)" },
  ],

  // Optional. An object representing the initial layout of the windows.
  // Valid keys are `main`, `equalizer`, `playlist` and `milkdrop`. All windows
  // are optional.
  //
  // - Each provided window must specify a `position` object with `top` and
  //   `left` which specify pixel offsets.
  // - Each provided window, except for
  // `milkdrop` may specify a `shadeMode` boolean.
  // - Each provided window may specify a `closed` boolean.
  // - The playlist and milkdrop windows may specify a `size` object with
  //   `extraHeight` and `extraWidth`.
  //
  // **Note:** After windows are positioned, they are then centered _as a group_
  // within the DOM element that Webamp is rendered into.
  //
  // **Since** @next
  windowLayout: {
    main: {
      position: { top: 0, left: 0 },
      shadeMode: true,
      closed: false,
    },
    equalizer: {
      position: { top: 0, left: 0 },
      shadeMode: true,
      closed: false,
    },
    playlist: {
      position: { top: 0, left: 0 },
      shadeMode: true,
      // Number of additional sprites by which to expand the window.
      size: { extraHeight: 1, extraHeight: 10 },
      closed: false,
    },
  },

  // Optional. (Default: `false`) Should double size mode be enabled?
  // **Note:** In keeping with the original Winamp, double size mode
  // does not apply to resizable windows like the equalizer or Milkdrop.
  //
  // **Since** @next
  enableDoubleSizeMode: true,

  // Optional. (Default: `false`) Should global hotkeys be enabled?
  enableHotkeys: true,

  // Optional. (Default: `0`) The zIndex that Webamp should use.
  zIndex: 99999,

  // Optional. An array of additional file pickers.
  // These will appear in the "Options" menu under "Play".
  // In the demo site, This option is used to provide a "Dropbox" file
  // picker.
  filePickers: [
    {
      // The name that will appear in the context menu.
      contextMenuName: "My File Picker...",
      // A function which returns a Promise that resolves to
      // an array of `track`s (see above)
      filePicker: () =>
        Promise.resolve([
          {
            url: "./rick_roll.mp3",
          },
        ]),
      // A boolean indicating if this options should be made
      // available when the user is offline.
      requiresNetwork: true,
    },
  ],

  // Optional. Provide a custom way to derive `Track` objects from a drop event.
  // Useful if your website has some DOM representation of a track that you can map to a URL/blob.
  handleTrackDropEvent: async (e) => {
    // Return an array of `Track` objects, see documentation below, or `null` to get the default drop behavior.
    // You may optionally wrap the return value in a promise.
  },

  // Optional. Provide a way to extend the behavior of the button ADD URL.
  // **Since** 1.4.1
  handleAddUrlEvent: async () => {
    // Return an optional array of `Track` objects or null.
  },

  // Optional. Provide a way to extend the behavior of the playlist button LOAD LIST.
  // **Since** 1.4.1
  handleLoadListEvent: async () => {
    // Return an optional array of `Track` objects or null.
  },

  // Optional. Provide a way to extend the behavior of the playlist button SAVE LIST.
  // Where tracks: Track[]
  // **Since** 1.4.1
  handleSaveListEvent: (tracks) => {},
};
const webamp = new Webamp(options);
```

## Instance Methods

The `Webamp` class has the following _instance_ methods:

### `appendTracks(tracks: Track[]): void`

Add an array of `track`s (see above) to the end of the playlist.

```JavaScript
// NOTE: Your audio files must be served from the same domain as your HTML
// file, or served with permissive CORS HTTP headers:
// https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
webamp.appendTracks([
    {url: 'https://example.com/track1.mp3'},
    {url: 'https://example.com/track2.mp3'},
    {url: 'https://example.com/track3.mp3'}
]);
```

### `setTracksToPlay(tracks: Track[]): void`

Replace the playlist with an array of `track`s (see above) and begin playing the first track.

```JavaScript
// NOTE: Your audio files must be served from the same domain as your HTML
// file, or served with permissive CORS HTTP headers:
// https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
webamp.setTracksToPlay([
    {url: 'https://example.com/track1.mp3'},
    {url: 'https://example.com/track2.mp3'},
    {url: 'https://example.com/track3.mp3'}
]);
```

### `previousTrack(): void`

Play the previous track.

**Since** 1.3.0

```JavaScript
webamp.previousTrack();
```

### `nextTrack(): void`

Play the next track.

**Since** 1.3.0

```JavaScript
webamp.nextTrack();
```

### `seekForward(seconds): void`

Seek forward n seconds in the current track.

**Since** 1.3.0

```JavaScript
webamp.seekForward(10);
```

### `seekBackward(seconds): void`

Seek backward n seconds in the current track.

**Since** 1.3.0

```JavaScript
webamp.seekBackward(10);
```

### `seekToTime(seconds)`

Seek to a given time within the current track.

**Since** 1.4.0

```JavaScript
webamp.seekToTime(15.5);
```

### `getMediaStatus()`

Get the current "playing" status. The return value is one of: `"PLAYING"`, `"STOPPED"`, or `"PAUSED"`.

**Since** 1.4.0

```JavaScript
const isPlaying = webamp.getMediaStatus() === "PLAYING";
```

### `pause(): void`

Pause the current track.

**Since** 1.3.0

```JavaScript
webamp.pause();
```

### `play(): void`

Play the current track.

**Since** 1.3.0

```JavaScript
webamp.play();
```

### `stop(): void`

Stop the currently playing audio. Equivilant to pressing the "stop" button.

**Since** 1.4.0

```JavaScript
webamp.stop();
```

### `renderWhenReady(domNode: HTMLElement): Promise<void>`

Webamp will wait until it has fetched the skin and fully parsed it, and then render itself into a new DOM node at the end of the `<body>` tag.

If a `domNode` is passed, Webamp will place itself in the center of that DOM node.

A promise is returned which will resolve after the render is complete.

```JavaScript
const container = document.getElementById('winamp-container');
webamp.renderWhenReady(container).then(() => {
    console.log('rendered webamp!');
});
```

### `onTrackDidChange(cb: (trackInfo: LoadedURLTrack | null) => void): () => void`

A callback which will be called when a new track starts loading. This can happen on startup when the first track starts buffering, or when a subsequent track starts playing. The callback will be called with an object (`{url: 'https://example.com/track.mp3'}`) containing the URL of the track.

Returns an "unsubscribe" function.

**Note:** If the user drags in a track, the URL may be an [ObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL)

```JavaScript
const unsubscribe = webamp.onTrackDidChange((track => {
    console.log("New track playing:", track.url);
});

// If at some point in the future you want to stop listening to these events:
unsubscribe();
```

### `onWillClose(cb: (cancel: () => void) => void): () => void`

A callback which will be called when Webamp is _about to_ close. Returns an "unsubscribe" function. The callback will be passed a `cancel` function which you can use to conditionally prevent Webamp from being closed.

```JavaScript
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

```JavaScript
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

```JavaScript
const icon = document.getElementById('webamp-icon');

webamp.onClose(() => {
    icon.addEventListener('click', () => {
        webamp.reopen();
    });
})
```

### `onMinimize(cb: () => void): () => void`

A callback which will be called when Webamp is minimized. Returns an "unsubscribe" function.

```JavaScript
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

```JavaScript
const start = Date.now();
await webamp.skinIsLoaded();
console.log(`The skin loaded in ${Date.now() - start}`);
```

### `dispose(): void`

**Note:** _This method is not fully functional. It is currently impossible to clean up a Winamp instance. This method makes an effort, but it still leaks the whole instance. In the future the behavior of this method will improve, so you might as well call it._

When you are done with a Webamp instance, call this method and Webamp will attempt to clean itself up to avoid memory leaks.

```JavaScript
webamp.dispose();
```

## Optimizing Bundle Size

**Since** UNRELEASED

By default the Webamp import/bundle includes a few heavy dependencies. `JSZip` for extracting user defined skin files and `music-metadata-browser` for reading ID3 tags. If you are using the default skin and supply metadata and duration for all your preloaded tracks, neither of these dependencies are needed for initial load and can instead be lazily loaded only when they are needed. To do this, you can import from `webamp/lazy` instead of `webamp`.

First you'll need to install the dependencies in your project:

```bash
npm install jszip music-metadata-browser@^0.6.1
```

The "lazy" version of Webamp will require that you inject functions for lazily importing these dependencies.

```ts
import Webamp from "webamp/lazy";

const webamp = new Webamp({
  initialTracks: [
    {
      url: "https://example.com/track1.mp3",
      metaData: {
        artist: "Jordan Eldredge",
        title: "Jordan's Song",
      },
      duration: 95,
    },
  ],
  requireJSZip: () => import("jszip/dist/jszip"),
  requireMusicMetadata: () => import("music-metadata-browser/dist/index"),
});
```

## Notes

- Internet Explorer is not supported.
- Webamp injects CSS into the page. The CSS is namespaced (every CSS selector is prefixed with `#webamp`), so it should not interfere with anything on the host page.
- Webamp HTML contains somewhat generic IDs and class names. If you have CSS on your page that is not namespaced, it may accidentaly be applied to Webamp. If this happens please reach out. I may be able to resolve it.
- Skin and audio URLs are subject to [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS). Please ensure they are either served from the same domain, or that the other domain is served with the correct headers.
- Please reach out to me. I'd love to help you set it up, and understand how it's being used. I plan to expand this API as I learn how people want to use it.
