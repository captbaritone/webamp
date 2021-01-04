# Usage

Here's how to use Webamp in your own project. If you get stuck, or need help, please either file an issue, or reach out on [Discord](https://discord.gg/fBTDMqR).

## Examples

If you would like to look at some examples check out the [examples directory](../examples/) where you will find:

- [Minimal](../examples/minimal/) - An example that just uses a `<script>` tag that points to a CDN. No install required.
- [Webpack](../examples/webpack/) - An example that installs Webamp via NPM, and bundles it into an application using Webpack.

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
    metaData: {
        artist: 'Jordan Eldredge',
        title: "Jordan's Song"
    },

    // Optional. Duration (in seconds) to be used instead of
    // fetching enough of the file to measure its length.
    duration: 95
};
```

## Static Methods

The `Winamp` class has the following _static_ methods:

### `browserIsSupported()`

Returns a true if the current browser supports the features that Webamp depends upon. It is recommended to check this before you attempt to instantiate an instance of `Winamp`.

```JavaScript
if(Winamp.browserIsSupported()) {
    new Winamp({/* ... */});
    // ...
} else {
    // Perhaps you could show some simpler player in this case.
}
```

## Construction

The `Winamp` class is constructed with an options object. All are optional.

```JavaScript
const options = {
    // Optional. An object representing the initial skin to use.
    // If omitted, the default skin, included in the bundle, will be used.
    // Note: This URL must be served the with correct CORs headers.
    initialSkin: {
        url: './path/to/skin.wsz'
    },

    // Optional. An array of `track`s (see above) to prepopulate the playlist with.
    initialTracks: [/* ... */],

    // Optional. An array of objects representing skins.
    // These will appear in the "Options" menu under "Skins".
    // Note: These URLs must be served with the correct CORs headers.
    availableSkins: [
      { url: "./green.wsz", name: "Green Dimension V2" },
      { url: "./osx.wsz", name: "Mac OSX v1.5 (Aqua)" }
    ],

    // Optional. (Default: `false`) Should global hotkeys be enabled?
    enableHotkeys: true,

    // Optional. (Default: `0`) The zIndex that Webamp should use.
    zIndex: 99999,

    // Optional. An array of additional file pickers.
    // These will appear in the "Options" menu under "Play".
    // In the offical version. This option is used to provide a "Dropbox" file picker.
    filePickers: [{
        // The name that will appear in the context menu.
        contextMenuName: "My File Picker...",
        // A function which returns a Promise that resolves to
        // an array of `track`s (see above)
        filePicker: () => Promise.resolve([{
            url: './rick_roll.mp3'
        }]),
        // A boolean indicating if this options should be made
        // available when the user is offline.
        requiresNetwork: true
    }],

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
    handleSaveListEvent: (tracks) => {}
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

## Notes

- Internet Explorer is not supported.
- Webamp injects CSS into the page. The CSS is namespaced (every CSS selector is prefixed with `#webamp`), so it should not interfere with anything on the host page.
- Webamp HTML contains somewhat generic IDs and class names. If you have CSS on your page that is not namespaced, it may accidentaly be applied to Webamp. If this happens please reach out. I may be able to resolve it.
- Skin and audio URLs are subject to [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS). Please ensure they are either served from the same domain, or that the other domain is served with the correct headers.
- Please reach out to me. I'd love to help you set it up, and understand how it's being used. I plan to expand this API as I learn how people want to use it.
