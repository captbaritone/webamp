# Webamp Constructor

The `Winamp` class is constructed with an options object. _All config properties are optional._

### `initialTracks`

An array of `track`s to prepopulate the playlist with. **The `url` must be served with the [correct CORS headers](../07_guides/01_cors.md).**

:::warning
It is highly recommended to provide `metaData` and `duration` for each track, as this will prevent Webamp from needing to fetch the first few bytes of the file to read ID3 tags and duration.
:::

```ts
const options = {
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
};
```

### `initialSkin`

An object representing the initial skin to use. If omitted, the default skin, included in the bundle, will be used. **The URL must be served with the [correct CORS headers](../07_guides/01_cors.md).**

```ts
const options = {
  initialSkin: {
    url: "./path/to/skin.wsz",
  },
};
```

### `availableSkins`

An array of objects representing skins. These will appear in the "Options" menu under "Skins". **The URLs must be served with the [correct CORS headers](../07_guides/01_cors.md).**

:::tip
You can find skins to download at the [Winamp Skin Museum](https://skins.webamp.org).
:::

```ts
const options = {
  availableSkins: [
    { url: "./green.wsz", name: "Green Dimension V2" },
    { url: "./osx.wsz", name: "Mac OSX v1.5 (Aqua)" },
  ],
};
```

### `windowLayout`

**Since** 2.0.0

An object representing the initial layout of the windows. Valid keys are `main`, `equalizer`, `playlist`, and `milkdrop`. Omitted windows will start hidden.

- Each provided window must specify a `position` object with `top` and `left` which specify pixel offsets.
- Each provided window, except for `milkdrop`, may specify a `shadeMode` boolean.
- Each provided window may specify a `closed` boolean.
- The playlist and milkdrop windows may specify a `size` object with `extraHeight` and `extraWidth`. These numbers represent the number of additional sprites by which to expand the window.

**Note:** After windows are positioned, they are then centered _as a group_ within the DOM element that Webamp is rendered into.

```ts
const options = {
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
};
```

### `enableDoubleSizeMode`

_Since 2.0.0_

A boolean indicating if double size mode should be enabled. **Default:** `false`.

```ts
const options = {
  enableDoubleSizeMode: true,
};
```

:::tip
In keeping with the original Winamp, **double size mode does not apply to resizable windows like the equalizer or Milkdrop**.
:::

### `enableHotkeys`

A boolean indicating if global hotkeys should be enabled. **Default:** `false`.

```ts
const options = {
  enableHotkeys: true,
};
```

For a list of hotkeys, see the [hotkeys documentation](../05_features/01_hotkeys.md).

### `zIndex`

An integer representing the zIndex that Webamp should use. **Default:** `99999`.

```ts
const options = {
  zIndex: 99999,
};
```

### `filePickers`

An array of additional file pickers. These will appear in the "Options" menu under "Play". Each file picker should have a `contextMenuName`, a `filePicker` function that returns a Promise resolving to an array of `track`s, and a `requiresNetwork` boolean indicating if the option should be available when offline.

This can be used to implement integration with services like Dropbox or Google Drive.

```ts
const options = {
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
};
```

### `handleTrackDropEvent`

An optional function to provide a custom way to derive `Track` objects from a drop event. Useful if your website has some DOM representation of a track that you can map to a URL/blob.

The function should return an array of `Track` objects or `null` to get the default drop behavior.

```ts
const options = {
  handleTrackDropEvent: async (e) => {
    return [
      /* array of Tracks */
    ];
  },
};
```

### `handleAddUrlEvent`

**Since** 1.4.1

An optional function to extend the behavior of the button "ADD URL". The function should return an optional array of `Track` objects or `null`.

```ts
const options = {
  handleAddUrlEvent: async () => {
    return [
      /* array of Tracks */
    ];
  },
};
```

### `handleLoadListEvent`

**Since** 1.4.1

An optional function to extend the behavior of the playlist button "LOAD LIST". The function should return an optional array of `Track` objects or `null`.

```ts
const options = {
  handleLoadListEvent: async () => {
    return [
      /* array of Tracks */
    ];
  },
};
```

### `handleSaveListEvent`

**Since** 1.4.1
Provide a way to extend the behavior of the playlist button SAVE LIST.

```ts
const options = {
  handleSaveListEvent: (tracks) => {
    // Perform custom save logic with the current tracks.
  },
};
```
