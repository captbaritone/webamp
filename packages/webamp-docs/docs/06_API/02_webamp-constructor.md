# Webamp Constructor

The `Webamp` class is constructed with an options object. _All config properties are optional._

```ts
import Webamp from "webamp";

const webamp = new Webamp({
  // ...constructor options go here.
});

// ...after this you can call `webamp.renderWhenReady(...)` to render Webamp.
```

For more information on initializing Webamp, see the [Initialization Guide](../03_initialization.md).

### `initialTracks`

An array of [`track`s](./01_track.md) to prepopulate the playlist with. **The `url` must be served with the [correct CORS headers](../07_guides/01_cors.md).**

:::warning
It is highly recommended to provide `metaData` and `duration` for each track, as this will prevent Webamp from needing to fetch the first few bytes of the file to read ID3 tags and duration.
:::

```ts
const webamp = new Webamp({
  initialTracks: [
    {
      url: "./path/to/track.mp3",
      metaData: {
        artist: "Artist Name",
        title: "Track Title",
      },
      duration: 120, // Track duration in seconds
    },
  ],
  // ...other config options
});
```

### `initialSkin`

An object representing the initial skin to use. If omitted, the default skin, included in the bundle, will be used. **The URL must be served with the [correct CORS headers](../07_guides/01_cors.md).**

```ts
const webamp = new Webamp({
  initialSkin: {
    url: "./path/to/skin.wsz",
  },
  // ...other config options
});
```

### `availableSkins`

An array of objects representing skins. These will appear in the "Options" menu under "Skins". **The URLs must be served with the [correct CORS headers](../07_guides/01_cors.md).**

:::tip
You can find skins to download at the [Winamp Skin Museum](https://skins.webamp.org).
:::

```ts
const webamp = new Webamp({
  availableSkins: [
    { url: "./green.wsz", name: "Green Dimension V2" },
    { url: "./osx.wsz", name: "Mac OSX v1.5 (Aqua)" },
  ],
  // ...other config options
});
```

### `windowLayout`

**Since** [v2.0.0](../12_changelog.md#200)

An object representing the initial layout of the windows. Valid keys are `main`, `equalizer`, `playlist`, and `milkdrop`. Omitted windows will start hidden.

- Each provided window must specify a `position` object with `top` and `left` which specify pixel offsets.
- Each provided window, except for `milkdrop`, may specify a `shadeMode` boolean.
- Each provided window may specify a `closed` boolean.
- The playlist and milkdrop windows may specify a `size` object with `extraHeight` and `extraWidth`. These numbers represent the number of additional sprites by which to expand the window.

**Note:** After windows are positioned, they are then centered _as a group_ within the DOM element that Webamp is rendered into.

```ts
const webamp = new Webamp({
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
      size: { extraHeight: 1, extraWidth: 10 },
      closed: false,
    },
  },
  // ...other config options
});
```

### `enableDoubleSizeMode`

**Since** [v2.0.0](../12_changelog.md#200)

A boolean indicating if double size mode should be enabled. **Default:** `false`.

```ts
const webamp = new Webamp({
  enableDoubleSizeMode: true,
  // ...other config options
});
```

:::tip
In keeping with the original Winamp, **double size mode does not apply to resizable windows like the equalizer or Milkdrop**.
:::

### `enableHotkeys`

A boolean indicating if global hotkeys should be enabled. **Default:** `false`.

```ts
const webamp = new Webamp({
  enableHotkeys: true,
  // ...other config options
});
```

For a list of hotkeys, see the [hotkeys documentation](../05_features/01_hotkeys.md).

### `zIndex`

An integer representing the zIndex that Webamp should use. **Default:** `99999`.

```ts
const webamp = new Webamp({
  zIndex: 99999,
  // ...other config options
});
```

### `filePickers`

An array of additional file pickers. These will appear in the "Options" menu under "Play". Each file picker should have a `contextMenuName`, a `filePicker` function that returns a Promise resolving to an array of [`track`s](01_track.md), and a `requiresNetwork` boolean indicating if the option should be available when offline.

This can be used to implement integration with services like Dropbox or Google Drive.

```ts
const webamp = new Webamp({
  filePickers: [
    {
      contextMenuName: "My File Picker...",
      filePicker: () =>
        Promise.resolve([
          {
            url: "./rick_roll.mp3",
          },
        ]),
      requiresNetwork: true,
    },
  ],
  // ...other config options
});
```

### `handleTrackDropEvent`

An optional function to provide a custom way to derive [`Track`](01_track.md) objects from a drop event. Useful if your website has some DOM representation of a track that you can map to a URL/blob.

The function should return an array of [`Track`](01_track.md) objects or `null` to get the default drop behavior.

```ts
const webamp = new Webamp({
  handleTrackDropEvent: async (e) => {
    return [
      /* array of Tracks */
    ];
  },
  // ...other config options
});
```

### `handleAddUrlEvent`

**Since** [v1.4.1](../12_changelog.md#141)

An optional function to extend the behavior of the button "ADD URL". The function should return an optional array of [`Track`](01_track.md) objects or `null`.

```ts
const webamp = new Webamp({
  handleAddUrlEvent: async () => {
    return [
      /* array of Tracks */
    ];
  },
  // ...other config options
});
```

### `handleLoadListEvent`

**Since** [v1.4.1](../12_changelog.md#141)

An optional function to extend the behavior of the playlist button "LOAD LIST". The function should return an optional array of [`Track`](01_track.md) objects or `null`.

```ts
const webamp = new Webamp({
  handleLoadListEvent: async () => {
    return [
      /* array of Tracks */
    ];
  },
  // ...other config options
});
```

### `handleSaveListEvent`

**Since** [v1.4.1](../12_changelog.md#141)
Provide a way to extend the behavior of the playlist button SAVE LIST.

```ts
const webamp = new Webamp({
  handleSaveListEvent: (tracks) => {
    // Perform custom save logic with the current tracks.
  },
  // ...other config options
});
```

### `enableMediaSession`

**Since** [v2.2.0](../12_changelog.md#220)

Have Webamp connect to the browser's [Media Session
API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API), if the browser supports it.
**Default:** `false`.

This allows OS/hardware level media controls like play/pause/next/previous
and lock screen "current track" information to work with Webamp.

```ts
const webamp = new Webamp({
  enableMediaSession: true,
  // ...other config options
});
```

### `requireButterchurnPresets?: () => Promise<Preset[]>`

**Since** [unreleased](../12_changelog.md#unreleased)

Milkdrop (Butterchurn) presets to be used. If not specified, the default presets
included in the bundle will be used.

Presets are expected to be in Butterchurn's JSON format. You can find these `.json` files in:

- The [Milkdrop Presets Collection](https://archive.org/details/milkdrops) at the Internet Archive.
- The [`butterchurn-presets@3.0.0-beta.4`](https://www.npmjs.com/package/butterchurn-presets/v/3.0.0-beta.4) NPM package
